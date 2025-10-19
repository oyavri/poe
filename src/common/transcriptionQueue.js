import { Queue } from "bullmq";
import { config } from "./config.js";

export const transcriptionQueue = (async () => {
    const queue = new Queue(
        "transcription", 
        config.bullMqConfig,
    );
    
    await queue.setGlobalConcurrency(config.bullMqGlobalConcurrency);

    return queue;
})();
