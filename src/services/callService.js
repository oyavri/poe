import { db } from "../db.js";
import { logger } from "../logger.js";
import { callRepository } from "../repositories/callRepository.js";
import { transcriptionQueue } from "../transcriptionQueue.js";

export const callService = {
    async createCall({ title, duration, participants, userId }) {
        const client = await db.connect();
        try {
            // First create call in the DB
            const call = await callRepository.createCall(client, { title, duration, created_by: userId});
            const participants = await callRepository.addParticipantsToCallById(client, call.id, participants);

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            logger.error(err);
            throw err;
        } finally {
            client.release();
        }

        // Then send it to the queue to be transcribed
        const job = await transcriptionQueue.add(
            `generateTranscription`,
            // example.org represents a CDN for the recording
            { callId, media: `https://example.org/audio-${callId}` },
            // to avoid duplicate processing of transcription
            { jobId: `transcription-${callId}` },
        );

        /*
        This way of first writing to database and then pushing to the queue is 
        a faulty way but simple to implement. For this project, it can be fault
        tolerant by using outbox pattern. Even though I am aware of it, to get 
        a working project I wanted to implement it this way.
        */

        // There probably is a way to return the call from createCall 
        // but to make things easier, I will just put this. An optimization
        // for this part can be done. Also, since it is not atomic, there
        // may be a race condition.
        const call = await callRepository.getCallById();

        return call;
    },

    async getCallsByUserId(userId) {

    },

    async getCall(callId, userId) {

    },

    async deleteCall(callId, userId) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');

            const result = await callRepository.softDeleteCall(client, callId, userId);

            if (result.rowCount === 1) {
                await client.query('COMMIT');
                return { status: 200, message: 'Call deleted successfully.' };
            }

            const check = await callRepository.findCallByIdForUpdate(client, callId);

            if (check.rowCount === 0) {
                await client.query('ROLLBACK');
                return { status: 404, message: 'Call not found.' };
            }

            const call = check.rows[0];
            if (call.created_by !== userId) {
                await client.query('ROLLBACK');
                return { status: 403, message: 'Unauthorized!' };
            }

            if (!call.active) {
                await client.query('ROLLBACK');
                return { status: 400, message: 'Call is already deleted.' };
            }

        } catch (err) {
            await client.query('ROLLBACK');
            logger.error('Error deleting call: ', err);
            return { status: 500, message: 'Internal server error.' };
        } finally {
            client.release();
        }
    },

    async getTranscription(callId, userId) {

    }
};
