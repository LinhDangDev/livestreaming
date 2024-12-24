const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const sequelize = require('./config/database');
const chatService = require('./services/chatService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Kiểm tra port đã được sử dụng chưa
const checkPort = (port) => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port)
            .on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    server.close();
                    resolve(false);
                } else {
                    reject(err);
                }
            })
            .on('listening', () => {
                server.close();
                resolve(true);
            });
    });
};

// Tìm port khả dụng và khởi động server
async function startServer() {
    try {
        // Thay đổi force: true thành alter: true để không xóa dữ liệu cũ
        await sequelize.sync({ alter: true });
        console.log('Database synchronized');

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

startServer();
