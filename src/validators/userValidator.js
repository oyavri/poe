import { z } from 'zod';

export const registerSchema = z.object({
    email: z.email("Invalid email."),
    full_name: z.string("Full name must be a string.").min(2, "Full name is too short."),
    password: z.string("Password must be a string.").min(6, "Password is too short, needs at least to be 6 characters."),
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
    email: z.email("Invalid email."),
    password: z.string("Password must be a string.").min(6, "Invalid password."),
});

export const validateLogin = (req, res, next) => {
    try {
        loginSchema.parse(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ error: err.errors });
    }
};
