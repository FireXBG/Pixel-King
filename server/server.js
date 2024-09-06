const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');
const adminService = require('./services/adminServices');
const { initializeDrive } = require('./config/googleDrive');
const { initializeIO } = require('./config/socket');
const cron = require('node-cron');
const { runDailyTask } = require('./utils/ResetFreeDownloads');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const paymentsController = require('./controllers/paymentControllers');

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use('/api/stripe', paymentsController)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API Routes
app.use('/api', routes);

const server = http.createServer(app);
const io = initializeIO(server);

app.get('/test-daily-task', (req, res) => {
    runDailyTask();
    res.status(200).json({ message: 'Daily task executed manually for testing' });
});

cron.schedule('0 0 * * *', () => {
    console.log('Running the daily task');
    runDailyTask();
});

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
