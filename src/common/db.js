import { Pool } from "pg";
import { dbConfig } from "./dbConfig.js";
import { logger } from "./logger.js";

export const db = new Pool({
    connectionString: dbConfig.databaseUrl,
    max: parseInt(dbConfig.databasePoolSize) || 30,
});

db.on('error', (err) => {
    logger.error(`Unexpected error on database connection: ${err}`);
    // If pool connection is not established or broken, 
    // it should either try to reconnect or gracefully shut down
    // but I will just halt the process.
    process.exit(1); 
});
