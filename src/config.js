function getEnvVariable(name) {
    const val = process.env[name];
    if (!val) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return val;
}

export const config = {
    // Database config
    databaseUrl: getEnvVariable('DATABASE_URL'),
    databasePoolSize: getEnvVariable('DATABASE_POOL_SIZE'),
    // Service config
    hostname: getEnvVariable('CALL_MANAGEMENT_HOSTNAME'),
    port: getEnvVariable('CALL_MANAGEMENT_PORT'),
    jwtSecret: getEnvVariable('JWT_SECRET'),
}
