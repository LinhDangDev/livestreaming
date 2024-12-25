const express = require('express');
const http = require('http');
const WebSocketService = require('./services/websocketService');
const cors = require('cors');

function createServer(port = 3000) {
    // Create express app
    const app = express();

    // Create HTTP server
    const server = http.createServer(app);

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/api/health', require('./routes/health'));
    app.use('/api', require('./routes/index'));

    // Khởi tạo WebSocket service
    const wsService = new WebSocketService(server);
    app.set('wsService', wsService);

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: err.message
        });
    });

    return { app, server };
}

// Chỉ start server nếu chạy trực tiếp file này và không phải môi trường test
if (require.main === module && process.env.NODE_ENV !== 'test') {
    const { server } = createServer();
    const PORT = process.env.PORT || 3000;

    // Kiểm tra xem server đã listen chưa
    if (!server.listening) {
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
}

module.exports = createServer;
