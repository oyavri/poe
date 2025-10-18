import express from 'express';
import { config } from './config.js';
import { logger } from './logger.js';
import { db } from './db.js';

const app = express();

app.get('/health', async (req, res) => {
    res.status(200).send('OK');
})

app.listen(config.port, () => {
    logger.info(`Example app listening on ${config.hostname}:${config.port}`);
});
