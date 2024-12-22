const express = require('express');
const cors = require('cors');
const streamRoutes = require('./routes/streamRoutes');
const mediaServer = require('./services/mediaService');
const chatService = require('./services/chatService');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/streams', streamRoutes);

const server = app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Khởi động media server
mediaServer.run();

// Khởi động socket.io cho chat
chatService(server);
