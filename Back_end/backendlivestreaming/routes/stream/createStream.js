const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Stream = require('../../entity/Stream');
const Participant = require('../../entity/Participant');

router.post('/create', async (req, res) => {
    try {
        const { title, streamer_name } = req.body;

        // Add validation
        if (!title) {
            return res.status(400).json({
                success: false,
                error: "Title is required"
            });
        }

        if (!streamer_name) {
            return res.status(400).json({
                success: false,
                error: "Streamer name is required"
            });
        }

        const stream_key = uuidv4();
        const ip_address = req.headers['x-forwarded-for'] ||
                            req.connection.remoteAddress ||
                            req.socket.remoteAddress ||
                            req.ip;

        const stream = await Stream.create({
            title,
            stream_key,
            streamer_name,
            status: 'inactive'
        });

        const streamer = await Participant.create({
            stream_id: stream.id,
            ip_address: ip_address,
            display_name: streamer_name,
            role: 'streamer'
        });

        res.json({
            success: true,
            data: {
                stream: {
                    id: stream.id,
                    title: stream.title,
                    stream_key: stream.stream_key,
                    streamer_name: stream.streamer_name,
                    status: stream.status,
                    created_at: stream.created_at
                },
                streamer: {
                    id: streamer.id,
                    display_name: streamer.display_name,
                    role: streamer.role
                }
            }
        });
    } catch (error) {
        console.error('Error creating stream:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

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

module.exports = router;
