const express = require('express');
const router = express.Router();
const Stream = require('../../entity/Stream');
const StreamRecording = require('../../entity/StreamRecording');
const RecordingService = require('../../services/recordingService');

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

        // Update recording status and metadata
        const activeRecording = await StreamRecording.findOne({
            where: {
                stream_id: stream.id,
                status: 'recording'
            }
        });

        if (activeRecording) {
            await RecordingService.updateRecordingMetadata(activeRecording.id);
        }

        res.json({
            success: true,
            data: {
                stream_id: stream.id,
                status: 'completed',
                ended_at: stream.ended_at,
                recording: activeRecording ? {
                    id: activeRecording.id,
                    file_url: activeRecording.file_url,
                    status: 'completed'
                } : null
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
