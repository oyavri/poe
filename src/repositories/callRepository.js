import { db } from "../db.js";
import { logger } from "../logger.js";
import { transcriptionQueue } from "../messageQueue.js";

export const callRepository = {
    async createCall({ title, duration, created_by, participants }) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            // Create call entity in calls table
            const callResult = db.query(`
                INSERT INTO calls (title, duration, created_by, active)
                VALUES ($1, $2, $3, $4)
                RETURNING id, title, duration;`,
                [title, duration, created_by, true]
            );
            // Add participants in participants table
            const callId = callResult.rows[0].id;
            
            await Promise.all(
                participants.map((participantId) => {
                    client.query(`
                        INSERT INTO participants (call_id, user_id)
                        VALUES ($1, $2);`,
                        [callId, participantId]
                    )
                })
            );
            await client.query('COMMIT'); 

            await transcriptionQueue.add(
                `generateTranscription`,
                // example.org represents a CDN for the recording
                { callId, media: "https://example.org" },
                // to avoid duplicate processing of transcription
                { jobId: `transcription-${callId}` },
            );
        } catch (err) {
            await client.query('ROLLBACK');
            logger.error(err);
            throw err;
        } finally {
            client.release();
        }
    },

    async getCallsByUserId(userId) {
        const query = `
            SELECT c.id AS call_id, c.title, c.duration, c.created_at, p.user_id AS participant_id
            FROM calls c
            JOIN participants p ON p.call_id = c.id
            WHERE c.active = TRUE 
                AND c.id IN (
                    SELECT call_id
                    FROM participants
                    WHERE user_id = $1
                )
            ORDER BY created_at DESC`;
        
        const { rows } = await db.query(query, [userId]);

        const callsMap = new Map();

        for (const row of rows) {
            if (!callsMap.has(row.call_id)) {
                callsMap.set(row.call_id, {
                    title: row.title,
                    duration: row.duration,
                    created_at: row.created_at,
                    participants: [],
                });
            }

            callsMap.get(row.call_id).participants.push(row.participant_id);
        }

        return Array.from(callsMap.values);
    },

    async getCallById(callId) {
        const query = `
            SELECT c.title, c.duration, c.created_at, p.user_id AS participant_id
            FROM calls c
            JOIN participants p ON p.call_id = c.id
            WHERE c.active = TRUE AND c.id = $1`; 

        const { rows } = await db.query(query, [callId]);

        const call = {
            title: rows[0].title,
            duration: rows[0].duration,
            created_at: rows[0].created_at,
            participants: rows.map(r => r.participant_id),
        };

        for (const row of rows) {
            call.participants.push(row[2]);
        }

        return call;
    },

    async deleteCall(callId) {
        const query = `
            UPDATE calls c 
            SET active = false
            WHERE c.id = $1;`;
        
        await db.query(query, [callId]);

        return true;
    },

    async getCallTranscription(callId) {
        const query = `
            SELECT status, transcription FROM transcriptions
            WHERE call_id = $1`;
        
        const { rows } = await db.query(query, [callId]);
        
        return rows[0];
    }
};
