import { Worker, Queue } from 'bullmq';
import { logger } from '../common/logger.js';
import { db } from '../common/db.js';
import { bullMqConfig } from '../common/bullMqConfig.js';

const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent mattis luctus ex, ac tristique metus congue vitae. Donec faucibus ex arcu, id pharetra purus rhoncus sed. Cras faucibus vitae lorem eu varius. Cras auctor tempus nisi a ullamcorper. Suspendisse aliquam, sapien hendrerit molestie lobortis, risus lectus aliquam tellus, et tempor mi metus sed erat. Proin eget libero odio. Donec interdum varius augue ac hendrerit. Vestibulum eget aliquet libero. Suspendisse bibendum placerat ex. Nunc vestibulum sapien id sapien tincidunt molestie. Aliquam in vulputate lacus, id dapibus neque. Morbi tempus, ligula quis interdum aliquet, libero eros pellentesque arcu, non facilisis justo risus non ligula. Suspendisse potenti. Donec ut imperdiet mi, eu posuere nulla. Nunc mi ipsum, posuere sed lectus eu, viverra bibendum lacus.";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateProcess() {
    // t seconds for processing where 2 < t < 10 
    const intervalMilliseconds = Math.floor(Math.random() * 8 + 2) * 1000;
    const isGoingToFail = (Math.random() < 0.05);

    
    if (isGoingToFail) {        
        // will throw error within the interval
        await sleep(intervalMilliseconds);
        throw new Error("Failed to transcribe");
    }

    await sleep(intervalMilliseconds);

    const textLength = Math.random() * (loremIpsum.length - 100) + 100;
    const text = loremIpsum.substring(0, textLength);

    return text;
}

const worker = new Worker(
    bullMqConfig.transcriptionQueue, 
    async (job) => { 
        logger.info(`Processing job with id: ${job.id}, data: `, job.data);
        const callId = job.data.callId;

        // Transcription process should also have a updated_at field for retries.
        const setFailedQuery = `
            UPDATE transcriptions t
            SET status = 'failed'
            FROM calls c
            WHERE t.call_id = $1
                AND c.id = t.call_id
                AND c.active = false
            RETURNING t.id;`;
        
        const isActiveCall = await db.query(setFailedQuery, [callId]);
        if (isActiveCall.rowCount === 0) {
            logger.error(`Call ${callId} is not active anymore.`);
            return;
        }

        const setProcessingQuery = `
            UPDATE transcriptions
            SET status = 'processing', initiated_at = NOW()
            WHERE call_id = $1;`;

        // set status as processing
        await db.query(setProcessingQuery, [callId]); 

        try {
            logger.info(`Transcription of call ${callId} is started.`);
            const transcription = await simulateProcess();
        
            const setCompletedQuery = `
                UPDATE transcriptions
                SET status = 'completed', transcription = $2
                WHERE call_id = $1;`;
        
            await db.query(setCompletedQuery, [callId, transcription]); 
            logger.info(`Transcription of ${callId} is completed.`);
        } catch (err) {
            logger.error(`Job ${job.id} failed:`, err.message);
            throw err;
        }
    },
    bullMqConfig.bullMqConfig
);

worker.on('completed', (job) => {
    logger.info(`Job ${job.id} marked as completed.`);
});

worker.on('failed', (job, err) => {
    logger.info(`Job ${job.id} failed on attempt ${job.attemptsMade}: ${err.message}`);

    if (job.attemptsMade === job.opts.attempts) {
        // set status as failed after retry attempts
        const query = `
            UPDATE transcriptions
            SET status = 'failed'
            WHERE call_id = $1;`;
        const callId = job.data.callId;

        db.query(query, [callId]);

        logger.error(`Job ${job.id} failed after all attempts, transcription status updated as 'failed'.`);
    }   
});

worker.on('error', err => {
    logger.error(`An error occurred: ${err}`);
})

logger.info("Worker started running on the background...");

const shutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down worker gracefully...`);

  try {
    await worker.close();
    logger.info('Worker closed.');

    } catch (err) {
        logger.error('Error during worker shutdown:', err);
        process.exit(1);
    }

    logger.info('Worker shutdown complete.');
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
