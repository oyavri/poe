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
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const data = await userService.loginUser({ email, password });
            res.json(data);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    getMe(req, res) {
        return res.status(200).json({ user: req.user });    
    }
};
