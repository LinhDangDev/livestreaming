const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Stream = require('../entity/Stream');
const Participant = require('../entity/Participant');

router.post('/create', async (req, res) => {
    try {
        const { title, description } = req.body;
        const stream_key = uuidv4();

        const stream = await Stream.create({
            title,
            description,
            stream_key,
            status: 'inactive'
        });

        res.json({
            success: true,
            data: stream
        });
    } catch (error) {
        console.error('Error creating stream:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

// GET /api/streams/:streamKey
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

        res.json({
            success: true,
            data: stream
        });
    } catch (error) {
        console.error('Error fetching stream:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

// POST /api/streams/join/:streamKey
router.post('/join/:streamKey', async (req, res) => {
    try {
        const { display_name, role = 'viewer' } = req.body;
        const ip_address = req.ip;

        // Tìm stream theo streamKey
        const stream = await Stream.findOne({
            where: { stream_key: req.params.streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        // Kiểm tra xem participant đã tồn tại chưa (dựa trên IP và stream_id)
        let participant = await Participant.findOne({
            where: {
                stream_id: stream.id,
                ip_address: ip_address
            }
        });

        // Nếu chưa tồn tại, tạo participant mới
        if (!participant) {
            participant = await Participant.create({
                stream_id: stream.id,
                ip_address: ip_address,
                display_name: display_name,
                role: role
            });
        }

        res.json({
            success: true,
            data: {
                stream: {
                    id: stream.id,
                    title: stream.title,
                    status: stream.status,
                    stream_key: stream.stream_key
                },
                participant: {
                    id: participant.id,
                    display_name: participant.display_name,
                    role: participant.role
                }
            }
        });

    } catch (error) {
        console.error('Error joining stream:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

// POST /api/streams/end/:streamKey
router.post('/end/:streamKey', async (req, res) => {
    try {
        // Lấy IP từ các header khác nhau để đảm bảo lấy đúng IP thật
        const ip_address = req.headers['x-forwarded-for'] ||
                          req.connection.remoteAddress ||
                          req.socket.remoteAddress ||
                          req.ip;

        console.log('Current IP:', ip_address); // Log để debug

        // Tìm stream theo streamKey
        const stream = await Stream.findOne({
            where: { stream_key: req.params.streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        // Log để debug
        console.log('Stream found:', stream.id);

        // Kiểm tra xem người gọi API có phải là streamer không
        const streamer = await Participant.findOne({
            where: {
                stream_id: stream.id,
                role: 'streamer'
            }
        });

        // Log để debug
        console.log('Streamer found:', streamer);
        console.log('Streamer IP:', streamer ? streamer.ip_address : 'No streamer');
        console.log('Request IP:', ip_address);

        if (!streamer) {
            return res.status(403).json({
                success: false,
                error: "No streamer found for this stream"
            });
        }

        // Tạm thời bỏ qua việc kiểm tra IP
        // if (streamer.ip_address !== ip_address) {
        //     return res.status(403).json({
        //         success: false,
        //         error: "Only streamer can end the stream"
        //     });
        // }

        // Cập nhật trạng thái stream
        await stream.update({
            status: 'inactive'
        });

        res.json({
            success: true,
            message: "Stream ended successfully",
            data: {
                stream_id: stream.id,
                title: stream.title,
                status: 'inactive'
            }
        });

    } catch (error) {
        console.error('Error ending stream:', error);
        console.error('Error details:', error.stack); // Log chi tiết lỗi
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

module.exports = router;
