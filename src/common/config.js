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
    bullMqConfig: {
        connection: {
            host: getEnvVariable('BULLMQ_HOST'),
            port: getEnvVariable('BULLMQ_PORT'),
            password: getEnvVariable('BULLMQ_PASSWORD'),
        },
        defaultJobOptions: {
            attempts: parseInt(getEnvVariable('TRANSCRIPTION_MAX_RETRY_COUNT')) || 5,
            removeOnComplete: 1000,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        },
    },
    bullMqGlobalConcurrency: getEnvVariable('BULLMQ_GLOBAL_CONCURRENCY'),

    // Transcription config
    transcriptionQueue: "generateTranscription",
}
