const express = require('express');
const router = express.Router();
const Stream = require('../../entity/Stream');
const Participant = require('../../entity/Participant');

router.post('/end/:streamKey', async (req, res) => {
    try {
        const ip_address = req.headers['x-forwarded-for'] ||
                            req.connection.remoteAddress ||
                            req.socket.remoteAddress ||
                            req.ip;

        const viewerId = req.headers['x-viewer-id'];

        // If request comes from viewer
        if (viewerId) {
            return res.status(403).json({
                success: false,
                error: "Only the streamer can end this live stream"
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

        const streamer = await Participant.findOne({
            where: {
                stream_id: stream.id,
                role: 'streamer',
                ip_address: ip_address
            }
        });

        if (!streamer) {
            return res.status(403).json({
                success: false,
                error: "Only the streamer can end this live stream"
            });
        }

        await stream.update({
            status: 'inactive'
        });

        res.json({
            success: true,
            message: "Stream ended successfully",
            data: {
                stream_id: stream.id,
                title: stream.title,
                streamer_name: stream.streamer_name,
                status: 'inactive'
            }
        });

    } catch (error) {
        console.error('Error ending stream:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
});

module.exports = router;
