// socket.js
const { Server } = require('socket.io');
let io;

function initializeIO(server) {
    io = new Server(server, {
        cors: {
            origin: `${process.env.SERVER_IP}:3000`, // Adjust this to your client URL
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}

module.exports = { initializeIO, getIO };
