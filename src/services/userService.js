import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { userRepository } from '../repositories/userRepository.js';
import { apiConfig } from '../common/apiConfig.js';

export const userService = {
    async registerUser({ email, full_name, password }) {
        const existingUser = await userRepository.findUserByEmail(email);
        if (existingUser.rowCount === 1) {
            throw new Error('Email is already registered.');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const userResult = await userRepository.createUser({ email, full_name, password_hash });

        if (userResult.rowCount === 1) {
            return { ok: true, status: 201, data: userResult.rows[0] };
        }

        return { ok: false, status: 500, message: 'Internal server error.' };
    },
    async loginUser({ email, password }) {
        const result = await userRepository.findUserByEmail(email);
        if (result.rowCount === 0) {
            return { ok: false, status: 400, message: 'Invalid email or password.' };
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return { ok: false, status: 400, message: 'Invalid email or password.' };
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            apiConfig.jwtSecret
        );
        
        return {
            ok: true,
            status: 200,
            data: {
                token, 
                user: { 
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    created_at: user.created_at
                }
            },
        };
    }
};
