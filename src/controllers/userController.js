import { userService } from "../services/userService.js";

export const userController = {
    async register(req, res) {
        try {
            const { email, full_name, password } = req.body;

            const result = await userService.registerUser({ email, full_name, password });
            
            if (!result.ok) {
                return res.status(result.status).json({ error: result.message });
            }

            return res.status(result.status).json({ user: result.data });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    },
    
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await userService.loginUser({ email, password });

            if (!result.ok) {
                return res.status(result.status).json({ error: result.message });
            }

            return res.status(result.status).json({ token: result.data.token, user: result.data.user });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getMe(req, res) {
        return res.status(200).json({ user: req.user });    
    }
};
