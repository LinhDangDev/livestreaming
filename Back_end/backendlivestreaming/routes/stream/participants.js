const express = require('express');
const router = express.Router();
const Stream = require('../../entity/Stream');
const Participant = require('../../entity/Participant');

// API join stream cho viewer
router.post('/viewer/join/:streamKey', async (req, res) => {
    try {
        const { display_name } = req.body;
        const ip_address = req.headers['x-forwarded-for'] ||
                            req.connection.remoteAddress ||
                            req.socket.remoteAddress ||
                            req.ip;

        if (!display_name) {
            return res.status(400).json({
                success: false,
                error: "Display name is required"
            });
        }

        const stream = await Stream.findOne({
            where: { stream_key: req.params.streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        let viewer = await Participant.findOne({
            where: {
                stream_id: stream.id,
                ip_address: ip_address,
                role: 'viewer'
            }
        });

        if (!viewer || viewer.display_name !== display_name) {
            viewer = await Participant.create({
                stream_id: stream.id,
                ip_address: ip_address,
                display_name: display_name,
                role: 'viewer'
            });
        }

        res.json({
            success: true,
            data: {
                stream: {
                    id: stream.id,
                    title: stream.title,
                    status: stream.status,
                    streamer_name: stream.streamer_name
                },
                participant: {
                    id: viewer.id,
                    display_name: viewer.display_name,
                    role: 'viewer'
                }
            }
        });

    } catch (error) {
        console.error('Error joining as viewer:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

// API join stream cho streamer
router.post('/streamer/join/:streamKey', async (req, res) => {
    try {
        const ip_address = req.headers['x-forwarded-for'] ||
                            req.connection.remoteAddress ||
                            req.socket.remoteAddress ||
                            req.ip;

        const stream = await Stream.findOne({
            where: { stream_key: req.params.streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        const streamer = await Participant.findOne({
            where: {
                stream_id: stream.id,
                role: 'streamer'
            }
        });

        if (!streamer) {
            return res.status(403).json({
                success: false,
                error: "You are not the streamer of this stream"
            });
        }

        res.json({
            success: true,
            data: {
                stream: {
                    id: stream.id,
                    title: stream.title,
                    status: stream.status,
                    streamer_name: stream.streamer_name
                },
                participant: {
                    id: streamer.id,
                    display_name: streamer.display_name,
                    role: 'streamer'
                }
            }
        });

    } catch (error) {
        console.error('Error rejoining as streamer:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

module.exports = router;
