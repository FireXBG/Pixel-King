const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');
const adminService = require('./services/adminServices');
const { initializeDrive } = require('./config/googleDrive');
const { initializeIO } = require('./config/socket');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Middleware to block unauthorized access
// app.use((req, res, next) => {
//     const allowedOrigins = [process.env.CORS_ORIGIN];
//     const origin = req.headers.origin || req.headers.referer;
//
//     if (allowedOrigins.includes(origin)) {
//         next();
//     } else {
//         res.status(403).json({ message: 'Forbidden: You are not allowed to access this resource.' });
//     }
// });

// API Routes
app.use('/api', routes);

const server = http.createServer(app);

const io = initializeIO(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    mongoose.connect(process.env.MONGO_CONNECTION_STRING)
        .then(() => {
            console.log('Connected to MongoDB');
            adminService.setInitialAdminUser()
                .then(() => {
                    console.log('Admin user initialized');
                })
                .catch(err => {
                    console.error('Error initializing admin user:', err);
                });
        })
        .catch(err => {
            console.error('Error connecting to MongoDB:', err);
        });
    initializeDrive()
        .then(() => {
            console.log('Google Drive initialized');
        })
        .catch(err => {
            console.error('Error initializing Google Drive:', err);
        });
});

module.exports = io;
