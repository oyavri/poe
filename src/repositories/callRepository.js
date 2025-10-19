import { db } from "../db.js";

export const callRepository = {
    async createCall(client, { title, duration, created_by }) {
            // Create call entity in calls table
            const result = db.query(`
                INSERT INTO calls (title, duration, created_by, active)
                VALUES ($1, $2, $3, $4)
                RETURNING id, title, duration;`,
                [title, duration, created_by, true]
            );
            
            return result;
    },

    async addParticipantsToCallById(client, callId, participants) {
            // Add participants to the participants table
            return Promise.all(
                participants.map((participantId) => {
                    client.query(`
                        INSERT INTO participants (call_id, user_id)
                        VALUES ($1, $2);`,
                        [callId, participantId]
                    )
                })
            );
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

    async getCallById(callId, userId) {
        const query = `
            SELECT c.title, c.duration, c.created_by, c.created_at, p.user_id AS participant_id
            FROM calls c
            JOIN participants p ON p.call_id = c.id
            WHERE c.active = TRUE 
                AND c.id = $1
                AND c.created_by = $2`; 

        const { rows } = await db.query(query, [callId, userId]);

        const call = {
            title: rows[0].title,
            duration: rows[0].duration,
            created_at: rows[0].created_at,
            created_by: rows[0].created_by,
            participants: rows.map(r => r.participant_id),
        };

        for (const row of rows) {
            call.participants.push(row[2]);
        }

        return call;
    },

    async softDeleteCall(client, callId, userId) {
        const query = `
            WITH target AS (
                SELECT id, created_by, active
                FROM calls c
                WHERE id = $1
                FOR UPDATE
            )
            UPDATE calls c 
            SET active = false
            WHERE c.id = target.id
                AND target.created_by = $2
                AND target.active = true
            RETURNING target.created_by, c.id, c.active;`;
        
        const result = await client.query(query, [callId, userId]);

        return result;
    },

    async findCallByIdForUpdate(client, callId) {
        const result = await client.query(
            `SELECT id, created_by, active FROM calls WHERE id = $1 FOR UPDATE;`,
            [callId]
        );

        return result;
    },

    async getCallTranscription(callId) {
        const query = `
            SELECT status, transcription FROM transcriptions
            WHERE call_id = $1`;
        
        const { rows } = await db.query(query, [callId]);
        
        return rows[0];
    }
};
