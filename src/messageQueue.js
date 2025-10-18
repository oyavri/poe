import { Queue } from "bullmq";
import { config } from "./config.js";

export const transcriptionQueue = (async () => {
    const queue = new Queue(
        "transcription", 
        { 
            connection: { 
                host: config.bullMqHost, 
                port: config.bullMqPort 
            },
            defaultJobOptions: {
                attempts: config.transcriptionMaxRetryCount,
                removeOnComplete: 1000, 
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
            }
        });
    
    await queue.setGlobalConcurrency(config.bullMqGlobalConcurrency);

    return queue;
})();
