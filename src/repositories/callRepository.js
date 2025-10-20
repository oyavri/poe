import { db } from "../common/db.js";

export const callRepository = {
    // returns call without participants => { id, title, duration, created_by }
    async createCall(client, { title, duration, created_by }) {
            // Create call entity in calls table
            const result = client.query(`
                INSERT INTO calls (title, duration, created_by, active)
                VALUES ($1, $2, $3, $4)
                RETURNING id, title, duration, created_by;`,
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

    // returns all of the calls of given userId
    async getCallsByUserId(userId) {
        const query = `
            SELECT c.id AS call_id, c.title, c.duration, c.created_at, c.created_by, p.user_id AS participant_id
            FROM calls c
            JOIN participants p ON p.call_id = c.id
            WHERE c.active = TRUE 
                AND c.id IN (
                    SELECT call_id
                    FROM participants
                    WHERE user_id = $1
                )
            ORDER BY created_at DESC`;
        
        const result = await db.query(query, [userId]);
        
        return result;
    },

    // returns call with given callId of given userId 
    async getCallById(callId, userId) {
        const query = `
            SELECT c.id, c.title, c.duration, c.created_by, c.created_at, p.user_id AS participant_id
            FROM calls c
            JOIN participants p ON p.call_id = c.id
            WHERE c.active = TRUE 
                AND c.id = $1
                AND c.created_by = $2`;

        const result = await db.query(query, [callId, userId]);

        return result;
    },

    // returns soft deleted call's id, owner(created_by) 
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
            FROM target
            WHERE c.id = target.id
                AND target.created_by = $2
                AND target.active = true
            RETURNING c.id, target.created_by;`;
        
        const result = await client.query(query, [callId, userId]);

        return result;
    },

    // locks the call for update, returns locked call's row with its id, owner and active status
    async getCallByIdForUpdate(client, callId) {
        const query = `SELECT id, created_by, active FROM calls WHERE id = $1 FOR UPDATE;`;
        const result = await client.query(query, [callId]);

        return result;
    },

    async getCallByIdForShare(client, callId) { 
        const query = `SELECT id, created_by, active FROM calls WHERE id = $1 FOR SHARE;`;
        const result = await client.query(query, [callId]);

        return result;
    },

    async getTranscription(client, callId) {
        const query = `
            SELECT id, call_id, status, transcription
            FROM transcriptions
            WHERE call_id = $1;`;
        
        const result = await client.query(query, [callId]);
        
        return result;
    },

    async createTranscriptionRequest(client, callId) {
        const query = `
            INSERT INTO transcriptions (call_id)
            VALUES ($1)
            RETURNING id, call_id, status;`;
        
        const result = await client.query(query, [callId]);

        return result;
    }
};
