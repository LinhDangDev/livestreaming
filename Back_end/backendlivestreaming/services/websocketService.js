const WebSocket = require('ws');
const Chat = require('../entity/chat');
const Participant = require('../entity/Participant');
const BannedParticipant = require('../entity/BannedParticipants');

class WebSocketService {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.streams = new Map(); // Map để lưu các stream và các client của nó
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            const streamKey = this.getStreamKeyFromUrl(req.url);
            if (!streamKey) {
                ws.close();
                return;
            }

            // Thêm client vào stream
            if (!this.streams.has(streamKey)) {
                this.streams.set(streamKey, new Set());
            }
            this.streams.get(streamKey).add(ws);

            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);

                    switch(data.type) {
                        case 'chat':
                            await this.handleChat(streamKey, data, ws);
                            break;
                        case 'ban':
                            await this.handleBan(streamKey, data);
                            break;
                        case 'unban':
                            await this.handleUnban(streamKey, data);
                            break;
                    }
                } catch (error) {
                    console.error('WebSocket error:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: error.message
                    }));
                }
            });

            ws.on('close', () => {
                if (this.streams.has(streamKey)) {
                    this.streams.get(streamKey).delete(ws);
                    if (this.streams.get(streamKey).size === 0) {
                        this.streams.delete(streamKey);
                    }
                }
            });
        });
    }

    async handleChat(streamKey, data, ws) {
        const { participant_id, message } = data;

        // Kiểm tra người dùng có bị ban không
        const isBanned = await BannedParticipant.findOne({
            where: {
                participant_id: participant_id
            }
        });

        if (isBanned) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'You are banned from this stream'
            }));
            return;
        }

        // Lưu chat vào database
        const chat = await Chat.create({
            stream_id: data.stream_id,
            participant_id: participant_id,
            message: message
        });

        // Lấy thông tin người gửi
        const sender = await Participant.findByPk(participant_id);

        // Broadcast tin nhắn đến tất cả client trong stream
        this.broadcast(streamKey, {
            type: 'chat',
            data: {
                id: chat.id,
                message: message,
                sent_time: chat.sent_time,
                sender: {
                    id: sender.id,
                    display_name: sender.display_name
                }
            }
        });
    }

    async handleBan(streamKey, data) {
        const { participant_id, streamer_id, reason, duration } = data;

        // Tạo ban record
        await BannedParticipant.create({
            stream_id: data.stream_id,
            participant_id: participant_id,
            banned_by: streamer_id,
            reason: reason,
            ban_duration: duration
        });

        // Broadcast thông báo ban
        this.broadcast(streamKey, {
            type: 'ban',
            data: {
                participant_id,
                reason
            }
        });
    }

    broadcast(streamKey, message) {
        if (this.streams.has(streamKey)) {
            this.streams.get(streamKey).forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                }
            });
        }
    }

    getStreamKeyFromUrl(url) {
        const match = url.match(/\/ws\/stream\/([^\/]+)/);
        return match ? match[1] : null;
    }
}

module.exports = WebSocketService;
