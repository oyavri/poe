import { callService } from "../services/callService.js";

export const callController = {
    async createCall(req, res) {
        try {
            const { title, duration, participants } = req.body;
            const userId = req.user.id;
           
            const result = await callService.createCall({ title, duration, participants, userId });

            if (!result.ok) {
                return res.status(result.status).json({ error: result.message });
            }

            return res.status(result.status).json({ call: result.data });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    
    async getCalls(req, res) {
        try {
            const userId = req.user.id;

            const result = await callService.getCallsByUserId(userId);

            if (!result.ok) {
                return res.status(result.status).json({ error: result.message });
            }

            return res.status(result.status).json(result.data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getCallDetails(req, res) {
        try {
            const callId = req.params.id;
            const userId = req.user.id;

            const result = await callService.getCall(callId, userId);

            if (!result.ok) {
                return res.status(result.status).json({ error: result.message });
            }

            return res.status(result.status).json(result.data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async deleteCall(req, res) {
        try {
            const callId = req.params.id;
            const userId = req.user.id;

            const result = await callService.deleteCall(callId, userId);

            if (!result.ok) {
                return res.status(result.status).json({ error: result.message });
            }

            return res.status(result.status).json(result.data);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async getCallTranscription(req, res) {
        try {
            const callId = req.params.id;
            const userId = req.user.id;

            const result = await callService.getTranscription(callId, userId);

            if (!result.ok) {
                return res.status(result.status). json({ error: result.message });
            }

            if (result.data.status === 'completed') {
                return res.status(result.status).json({ id: result.data.id, status: result.data.status, transcription: result.data.transcription });
            }

            return res.status(result.status).json({ id: result.data.id, status: result.data.status });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};
