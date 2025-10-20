import { Queue } from "bullmq";
import { bullMqConfig } from "./bullMqConfig.js";

// I am sure this is not a good idea to pass the queue around.
export const transcriptionQueue = await (async () => {
    const queue = new Queue(
        "transcription", 
        bullMqConfig.bullMqConfig,
    );
    
    await queue.setGlobalConcurrency(bullMqConfig.bullMqGlobalConcurrency);

    return queue;
})();
