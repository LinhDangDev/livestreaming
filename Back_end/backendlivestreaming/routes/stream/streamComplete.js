const express = require('express');
const router = express.Router();
const Stream = require('../../entity/Stream');
const StreamRecording = require('../../entity/StreamRecording');

// API xử lý khi stream kết thúc
router.post('/complete', async (req, res) => {
    try {
        const { stream_key } = req.body;

        const stream = await Stream.findOne({
            where: { stream_key }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        // Update stream status
        await stream.update({
            status: 'completed',
            ended_at: new Date()
        });

        // Optional: Update any active recordings
        await StreamRecording.update(
            {
                status: 'completed',
                ended_at: new Date()
            },
            {
                where: {
                    stream_id: stream.id,
                    status: 'recording'
                }
            }
        );

        res.json({
            success: true,
            data: {
                stream_id: stream.id,
                status: 'completed',
                ended_at: stream.ended_at
            }
        });

    } catch (error) {
        console.error('Error completing stream:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
});

module.exports = router; 
