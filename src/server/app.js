import express from 'express';
import { config } from '../common/config.js';
import { logger } from '../common/logger.js';

import { validateLogin, validateRegister } from '../validators/userValidator.js';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authentication.js';
import { validateCall } from '../validators/callValidator.js';
import { callController } from '../controllers/callController.js';

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

app.listen(config.port, () => {
    logger.info(`Example app listening on ${config.hostname}:${config.port}`);
});
