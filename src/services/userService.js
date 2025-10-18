import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import { userRepository } from '../repositories/userRepository.js';
import { config } from '../config.js';

export const userService = {
    async registerUser({ email, full_name, password }) {
        const existingUser = await userRepository.findUserByEmail(email);
        if (existingUser) {
            throw new Error('Email is already registered.');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const user = await userRepository.createUser({ email, full_name, password_hash });

        return user;
    },
    async loginUser({ email, password }) {
        const user = await userRepository.findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password!');
        }

        const validPassword = await bcrypt.compare(password, password_hash);
        if (!validPassword) {
            throw new Error('Invalid email or password!');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            config.jwtSecret,
            { expiresIn: '24h'}
        );

        return { 
            token, 
            user: { 
                id: user.id,
                email: user.email,
                full_name: user.full_name 
            }
        };
    }
};
