const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');
const { initializeDrive } = require('./config/googleDrive');
const { initializeIO } = require('./config/socket');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(routes);

const io = initializeIO(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    mongoose.connect(process.env.MONGO_CONNECTION_STRING).then(() => {
        console.log('Connected to MongoDB');
    });
    initializeDrive().then(() => {
        console.log('Google Drive initialized');
    }).catch(err => {
        console.error('Error initializing Google Drive:', err);
    });
});

module.exports = io;
