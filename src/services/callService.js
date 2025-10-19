import { db } from "../db.js";
import { logger } from "../logger.js";
import { callRepository } from "../repositories/callRepository.js";
import { transcriptionQueue } from "../transcriptionQueue.js";

export const callService = {
    async createCall({ title, duration, participants, userId }) {
        const client = await db.connect();
        // This is probably not a good idea to use.
        let call; 
        try {
            // First create call in the DB
            call = await callRepository.createCall(client, { title, duration, created_by: userId});
            await callRepository.addParticipantsToCallById(client, call.id, participants);

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            logger.error("Error creating call", err);
            return { ok: false, status: 500, message: 'Internal server error.' };
        } finally {
            client.release();
        }

        // Then send it to the queue to be transcribed
        await transcriptionQueue.add(
            `generateTranscription`,
            // example.org represents a CDN for the recording
            { callId: call.id, media: `https://example.org/audio-${call.id}` },
            // to avoid duplicate processing of transcription
            { jobId: `transcription-${call.id}` },
        );

        /*
        This way of first writing to database and then pushing to the queue is 
        a faulty way but simple to implement. For this project, it can be fault
        tolerant by using outbox pattern. Even though I am aware of it, to get 
        a working project I wanted to implement it this way.
        */

        return { ok: true, status: 200, data: { ...call } };
    },

    async getCallsByUserId(userId) {
        const result = await callRepository.getCallsByUserId(userId);

        if (result.rowCount === 0) {
            return { ok: false, status: 404, message: 'No calls found.' };
        }

        const callsMap = new Map();

        for (const row of result.rows) {
            if (!callsMap.has(row.call_id)) {
                callsMap.set(row.call_id, {
                    title: row.title,
                    duration: row.duration,
                    created_at: row.created_at,
                    created_by: row.created_by,
                    participants: [],
                });
            }

            callsMap.get(row.call_id).participants.push(row.participant_id);
        }

        return { ok: true, status: 200, data: Array.from(callsMap.values) };
    },

    async getCall(callId, userId) {
        const result = await callRepository.getCallById(callId, userId);

        if (result.rowCount === 0) {
            return { ok: false, status: 404, message: 'Call is not found.' };
        }

        const call = {
            title: rows[0].title,
            duration: rows[0].duration,
            created_at: rows[0].created_at,
            created_by: rows[0].created_by,
            participants: rows.map(r => r.participant_id),
        };

        for (const row of result.rows) {
            call.participants.push(row[2]);
        }

        return { ok: true, status: 200, data: { ...call } };
    },

    async deleteCall(callId, userId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const result = await callRepository.softDeleteCall(client, callId, userId);

            if (result.rowCount === 1) {
                await client.query('COMMIT');
                return { ok: true, status: 200, message: 'Call deleted successfully.' };
            }

            const check = await callRepository.findCallByIdForUpdate(client, callId);

            if (check.rowCount === 0) {
                await client.query('ROLLBACK');
                return { ok: false, status: 404, message: 'Call not found.' };
            }

            const call = check.rows[0];
            if (call.created_by !== userId) {
                await client.query('ROLLBACK');
                return { ok: false, status: 403, message: 'Unauthorized!' };
            }

            if (!call.active) {
                await client.query('ROLLBACK');
                return { ok: false, status: 400, message: 'Call is already deleted.' };
            }

        } catch (err) {
            await client.query('ROLLBACK');
            logger.error('Error deleting call: ', err);
            return { ok: false, status: 500, message: 'Internal server error.' };
        } finally {
            client.release();
        }
    },

    async getTranscription(callId, userId) {

    }
};
