import { z } from 'zod';

export const callSchema = z.object({
    title: z.string().min(1),
    duration: z.number().int().nonnegative(),
    participants: z.array(z.uuid().nonempty()),
});

export const validateCall = (req, res, next) => {
    try {
        callSchema.parse(req.body);
        next();
    } catch (err) {
        return res.status(400).json({ error: err.errors });
    }
}
