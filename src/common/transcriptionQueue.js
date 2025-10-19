import { Queue } from "bullmq";
import { bullMqConfig } from "./bullMqConfig.js";

export const transcriptionQueue = (async () => {
    const queue = new Queue(
        "transcription", 
        bullMqConfig.bullMqConfig,
    );
    
    await queue.setGlobalConcurrency(config.bullMqGlobalConcurrency);

    return queue;
})();
