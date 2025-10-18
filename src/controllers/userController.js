import { userService } from "../services/userService.js";

export const userController = {
    async register(req, res) {
        try {
            const { email, full_name, password } = req.body;

            const user = await userService.registerUser({ email, full_name, password });
            
            return res.status(201).json(user);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }
};
