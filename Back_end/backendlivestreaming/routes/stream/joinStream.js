const express = require('express');
const router = express.Router();
const Stream = require('../../entity/Stream');
const Participant = require('../../entity/Participant');
const BannedParticipant = require('../../entity/BannedParticipants');
const { Op } = require('sequelize');

// Kiểm tra status stream - GET /api/streams/status/:streamKey
router.get('/status/:streamKey', async (req, res) => {
    try {
        console.log('Checking stream status for key:', req.params.streamKey); // Debug log
        const stream = await Stream.findOne({
            where: { stream_key: req.params.streamKey }
        });

        if (!stream) {
            console.log('Stream not found'); // Debug log
            return res.status(404).json({
                success: false,
                error: "Stream không tồn tại"
            });
        }

        console.log('Stream found:', stream.title); // Debug log
        return res.json({
            success: true,
            data: {
                status: stream.status,
                title: stream.title,
                streamer_name: stream.streamer_name
            }
        });
    } catch (error) {
        console.error('Error checking stream status:', error);
        res.status(500).json({
            success: false,
            error: "Có lỗi xảy ra khi kiểm tra trạng thái stream"
        });
    }
});

// Join stream cho viewer - POST /api/streams/viewer/join/:streamKey
router.post('/viewer/join/:streamKey', async (req, res) => {
    try {
        console.log('Join request received:', req.body); // Debug log
        const { display_name } = req.body;

        if (!display_name) {
            return res.status(400).json({
                success: false,
                error: "Vui lòng nhập tên hiển thị"
            });
        }

        const stream = await Stream.findOne({
            where: { stream_key: req.params.streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream không tồn tại"
            });
        }

        // Tạo participant mới
        const participant = await Participant.create({
            stream_id: stream.id,
            display_name: display_name,
            role: 'viewer',
            ip_address: req.ip
        });

        console.log('Participant created:', participant.id); // Debug log
        return res.json({
            success: true,
            data: {
                participant: {
                    id: participant.id,
                    display_name: participant.display_name,
                    role: participant.role
                },
                stream: {
                    id: stream.id,
                    title: stream.title,
                    status: stream.status
                }
            }
        });
    } catch (error) {
        console.error('Error joining stream:', error);
        res.status(500).json({
            success: false,
            error: "Có lỗi xảy ra khi tham gia stream"
        });
    }
});

module.exports = router;
