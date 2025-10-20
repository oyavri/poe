import jwt from 'jsonwebtoken';
import { apiConfig } from '../common/apiConfig.js';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized!'});
    }

    try {
        const payload = jwt.verify(token, apiConfig.jwtSecret);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token.'});
    }
};
