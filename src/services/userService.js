import bcrypt from 'bcrypt';

export const userService = {
    async registerUser({ email, full_name, password }) {
        const existingUser = await userRepository.findUserByEmail(email);
        if (existingUser) {
            throw new Error('Email is already registered.');
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const user = await userRepository.createUser({ email, full_name, password_hash, salt });

        return user;
    }
};
