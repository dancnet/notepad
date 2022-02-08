require('dotenv').config();
const express = require('express');
const app = express();
const u = require('./u');

app.use(express.static('client/public'));
app.use('/u/:username', u);

app.listen(process.env.PORT, () => {
    console.log(`notepad is listening on port ${process.env.PORT}`);
});

// https://expressjs.com/en/resources/middleware/cors.html