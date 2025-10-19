import { z } from 'zod';

export const callSchema = z.object({
    title: z.coerce.string().min(1, "Title cannot be empty."),
    duration: z.coerce.number("Duration must be a number").int("Duration must be an integer").gt(0, "Duration must be greater than zero and an integer."),
    participants: z.array(z.uuid()).min(2, "There must be at least 2 participants."),
});

export const validateCall = (req, res, next) => {
    try {
        callSchema.parse(req.body);
        next();
    } catch (err) {
        // I could not find a better solution for displaying errors easily within my remaining time.
        const errorMessages = z.prettifyError(err); 
        return res.status(400).json({ errors: errorMessages });
    }
}
