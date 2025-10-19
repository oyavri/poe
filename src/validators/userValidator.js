import { z } from 'zod';

export const registerSchema = z.object({
    email: z.email(),
    full_name: z.string().min(2),
    password: z.string().min(6),
});

export const validateRegister = (req, res, next) => {
    try {
        registerSchema.parse(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ error: err.errors });
    }
}

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

export const validateLogin = (req, res, next) => {
    try {
        loginSchema.parse(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ error: err.errors });
    }
};
