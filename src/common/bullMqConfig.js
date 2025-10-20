function getEnvVariable(name) {
    const val = process.env[name];
    if (!val) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return val;
}

export const bullMqConfig = {
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
    transcriptionQueue: "transcription",
};
