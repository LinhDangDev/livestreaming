const socketIO = require('socket.io');
const chatService = require('./chatService');

module.exports = (server) => {
  const io = socketIO(server);

  io.on('connection', (socket) => {
    socket.on('join-stream', async (data) => {
      const { streamId, participantId } = data;
      socket.join(`stream-${streamId}`);

      // Gửi lịch sử chat
      const chatHistory = await chatService.getChatHistory(streamId);
      socket.emit('chat-history', chatHistory);
    });

    socket.on('chat-message', async (data) => {
      const { streamId, participantId, message, hasAttachment } = data;

      const chatMessage = await chatService.saveChat({
        stream_id: streamId,
        participant_id: participantId,
        message,
        has_attachment: hasAttachment
      });

      if (hasAttachment) {
        // Xử lý file đính kèm
        await handleAttachment(chatMessage.id, data.file);
      }

      io.to(`stream-${streamId}`).emit('new-message', {
        ...chatMessage,
        participant: await chatService.getParticipantInfo(participantId)
      });
    });
  });
};
