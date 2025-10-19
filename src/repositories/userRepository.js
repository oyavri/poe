import { db } from "../common/db.js";

export const userRepository = {
    async createUser({ email, full_name, password_hash }) {
        const query = `
            INSERT INTO users (email, full_name, password_hash)
            VALUES ($1, $2, $3)
            RETURNING id, email, full_name;
        `;

        const values = [email, full_name, password_hash];

        const result = await db.query(query, values);
        return result.rows[0];
    },
    async findUserByEmail(email) {
        const query = `
            SELECT * FROM users WHERE email = $1;
        `
        const values = [email];

        const result = await db.query(query, values);
        return result.rows[0];
    }
};
