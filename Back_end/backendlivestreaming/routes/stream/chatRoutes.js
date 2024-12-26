const express = require('express');
const router = express.Router();
const Chat = require('../../entity/chat');
const Attachment = require('../../entity/attachments');
const Stream = require('../../entity/Stream');
const Participant = require('../../entity/Participant');
const BannedParticipant = require('../../entity/BannedParticipants');
const upload = require('../../services/fileService');

// API gửi tin nhắn
router.post('/:streamKey', async (req, res) => {
    try {
        const { message } = req.body;
        const ip_address = req.ip || req.connection.remoteAddress;

        // Tìm stream
        const stream = await Stream.findOne({
            where: { stream_key: req.params.streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        // Tìm hoặc tạo participant mới
        let participant = await Participant.findOne({
            where: {
                stream_id: stream.id,
                ip_address: ip_address
            }
        });

        if (!participant) {
            participant = await Participant.create({
                stream_id: stream.id,
                ip_address: ip_address,
                display_name: `User_${Math.random().toString(36).substr(2, 6)}`,
                role: 'viewer'
            });
        }

        // Kiểm tra ban
        const isBanned = await BannedParticipant.findOne({
            where: {
                stream_id: stream.id,
                participant_id: participant.id
            }
        });

        if (isBanned) {
            return res.status(403).json({
                success: false,
                error: "You are banned from this stream"
            });
        }

        // Tạo chat message
        const chat = await Chat.create({
            stream_id: stream.id,
            participant_id: participant.id,
            message: message,
            sent_time: new Date()
        });

        // Format response
        const response = {
            success: true,
            data: {
                chat: {
                    id: chat.id,
                    message: chat.message,
                    sent_time: chat.sent_time,
                    sender: {
                        id: participant.id,
                        display_name: participant.display_name
                    }
                }
            }
        };

        // Emit to WebSocket if available
        if (req.app.get('io')) {
            req.app.get('io').to(`stream-${stream.id}`).emit('new-message', response.data.chat);
        }

        res.json(response);

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

// API lấy lịch sử chat
router.get('/:streamKey', async (req, res) => {
    try {
        const stream = await Stream.findOne({
            where: { stream_key: req.params.streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        const chats = await Chat.findAll({
            where: { stream_id: stream.id },
            include: [{
                model: Participant,
                as: 'Sender',
                attributes: ['id', 'display_name']
            }],
            order: [['sent_time', 'ASC']],
            limit: 50
        });

        res.json({
            success: true,
            data: chats.map(chat => ({
                id: chat.id,
                message: chat.message,
                sent_time: chat.sent_time,
                sender: {
                    id: chat.Sender.id,
                    display_name: chat.Sender.display_name
                }
            }))
        });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

// WebSocket connection URL
router.get('/:streamKey/ws', (req, res) => {
    const wsUrl = `ws://${req.headers.host}/ws/chat/${req.params.streamKey}`;
    res.json({
        success: true,
        data: { ws_url: wsUrl }
    });
});

module.exports = router;
