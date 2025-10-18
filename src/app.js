import express from 'express';
import { config } from './config.js';
import { logger } from './logger.js';

import { validateRegister } from './validators/userValidator.js';
import { userController } from './controllers/userController.js';

const app = express();
app.use(express.json());

app.post('/auth/register', validateRegister, userController.register);
// app.post('/auth/login');
// app.get('/auth/me');
// app.post('/calls');
// app.get('/calls');
// app.get('/calls/:id');
// app.delete('/calls/:id');
// app.get('/calls/:id/transcription');

app.get('/health', async (req, res) => {
    res.status(200).send('OK');
})

app.listen(config.port, () => {
    logger.info(`Example app listening on ${config.hostname}:${config.port}`);
});
