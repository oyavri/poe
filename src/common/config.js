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

    // BullMQ config
    bullMqHost: getEnvVariable('BULLMQ_HOST'),
    bullMqPort: getEnvVariable('BULLMQ_PORT'),
    bullMqPassword: getEnvVariable('BULLMQ_PASSWORD'),
    bullMqGlobalConcurrency: getEnvVariable('BULLMQ_GLOBAL_CONCURRENCY'),

    // Transcription config
    transcriptionMaxRetryCount: parseInt(getEnvVariable('TRANSCRIPTION_MAX_RETRY_COUNT')),
}
