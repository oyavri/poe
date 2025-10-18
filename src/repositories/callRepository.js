import { config } from "../config.js";
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
                RETURNING id, title, duration;
                `,
                [title, duration, created_by, true]
            );
            // Add participants in participants table
            const callId = callResult.rows[0].id;
            
            await Promise.all(
                participants.map((participantId) => {
                    client.query(`
                        INSERT INTO participants (call_id, user_id)
                        VALUES ($1, $2);
                        `,
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
    }
};
