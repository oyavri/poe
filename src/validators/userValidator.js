import { z } from 'zod';

export const registerSchema = z.object({
    email: z.email("Invalid email."),
    full_name: z.string().min(2, "Full name is too short."),
    password: z.string().min(6, "Password is too short, needs at least to be 6 characters."),
});

export const validateRegister = (req, res, next) => {
    try {
        registerSchema.parse(req.body);
        next();
    } catch (err) {
        // I could not find a better solution for displaying errors easily within my remaining time.
        const errorMessages = z.prettifyError(err); 
        return res.status(400).json({ errors: errorMessages });
    }
}

export const loginSchema = z.object({
    email: z.email("Invalid email."),
    password: z.string().min(6, "Invalid password."),
});

export const validateLogin = (req, res, next) => {
    try {
        loginSchema.safeParse(req.body);
        next();
    } catch (err) {
        // I could not find a better solution for displaying errors easily within my remaining time.
        const errorMessages = z.prettifyError(err); 
        return res.status(400).json({ errors: errorMessages });
    }
};
