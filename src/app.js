require('dotenv').config()

const express = require('express')

const app = express();
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/health', (req, res) => {
    res.status(200).send('Healthy');
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});
