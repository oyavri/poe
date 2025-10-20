import express from 'express';
import { apiConfig } from '../common/apiConfig.js';
import { logger } from '../common/logger.js';

import { validateLogin, validateRegister } from '../validators/userValidator.js';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authentication.js';
import { validateCall } from '../validators/callValidator.js';
import { callController } from '../controllers/callController.js';
import { transcriptionQueue } from '../common/transcriptionQueue.js';

const app = express();
app.use(express.json());

app.post('/auth/register', validateRegister, userController.register);
app.post('/auth/login', validateLogin, userController.login);
app.get('/auth/me', authenticate, userController.getMe);
app.post('/calls', validateCall, authenticate, callController.createCall);
app.get('/calls', authenticate, callController.getCalls);
app.get('/calls/:id', authenticate, callController.getCallDetails);
app.delete('/calls/:id', authenticate, callController.deleteCall);
app.get('/calls/:id/transcription', authenticate, callController.getCallTranscription);

app.get('/health', async (req, res) => {
    res.status(200).send('OK');
})

app.listen(apiConfig.port, () => {
    logger.info(`Example app listening on ${apiConfig.hostname}:${apiConfig.port}`);
});

const shutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully.`);

  app.close(async (err) => {
    if (err) {
      logger.error('Error closing HTTP server: ', err);
      process.exit(1);
    }

    try {
        await transcriptionQueue.close();
        logger.info('Queue connection closed.');

        await db.end();
        logger.info('Database pool closed.');
    
    } catch (error) {
        logger.error('Error during shutdown: ', error);
        process.exit(1);
    }

    logger.info('Server shutdown complete.');
    process.exit(0);
  });
};


process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
