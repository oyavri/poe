function getEnvVariable(name) {
    const val = process.env[name];
    if (!val) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return val;
}

export const dbConfig = {
    // Database config
    databaseUrl: getEnvVariable('DATABASE_URL'),
    databasePoolSize: getEnvVariable('DATABASE_POOL_SIZE'),
}
