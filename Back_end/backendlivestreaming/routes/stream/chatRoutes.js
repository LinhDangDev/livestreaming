const express = require('express');
const router = express.Router();
const Chat = require('../../entity/chat');
const Attachment = require('../../entity/attachments');
const Stream = require('../../entity/Stream');
const Participant = require('../../entity/Participant');
const BannedParticipant = require('../../entity/BannedParticipants');
const upload = require('../../services/fileService');

// API gửi tin nhắn
router.post('/:streamKey', upload.single('file'), async (req, res) => {
    try {
        const { message } = req.body;
        const file = req.file;
        const ip_address = req.headers['x-forwarded-for'] ||
                          req.connection.remoteAddress ||
                          req.socket.remoteAddress ||
                          req.ip;

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

        // Kiểm tra người gửi tin nhắn
        const participant = await Participant.findOne({
            where: {
                stream_id: stream.id,
                ip_address: ip_address
            }
        });

        if (!participant) {
            return res.status(403).json({
                success: false,
                error: "You must join the stream to chat"
            });
        }

        // Kiểm tra xem người dùng có bị ban không
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
            has_attachment: !!file
        });

        // Nếu có file, lưu attachment
        let attachment = null;
        if (file) {
            attachment = await Attachment.create({
                chat_id: chat.id,
                file_url: file.path,
                file_type: file.mimetype
            });
        }

        res.json({
            success: true,
            data: {
                chat: {
                    id: chat.id,
                    message: chat.message,
                    sent_time: chat.sent_time,
                    sender: {
                        id: participant.id,
                        display_name: participant.display_name
                    },
                    attachment: attachment ? {
                        url: attachment.file_url,
                        type: attachment.file_type
                    } : null
                }
            }
        });

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
            include: [
                {
                    model: Participant,
                    attributes: ['display_name']
                },
                {
                    model: Attachment,
                    attributes: ['file_url', 'file_type']
                }
            ],
            order: [['sent_time', 'DESC']],
            limit: 100
        });

        res.json({
            success: true,
            data: chats.map(chat => ({
                id: chat.id,
                message: chat.message,
                sent_time: chat.sent_time,
                sender: {
                    display_name: chat.Participant.display_name
                },
                attachment: chat.Attachment ? {
                    url: chat.Attachment.file_url,
                    type: chat.Attachment.file_type
                } : null
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

module.exports = router;
