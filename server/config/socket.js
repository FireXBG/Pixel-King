const { Server } = require('socket.io');
let io;

function initializeIO(server) {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://pixel-king.com', 'http://192.168.1.15:3000'], // Allow both localhost and your domain
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true
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
