const express = require('express');
const router = express.Router();
const Stream = require('../../entity/Stream');
const StreamRecording = require('../../entity/StreamRecording');
const Participant = require('../../entity/Participant');
const path = require('path');
const fs = require('fs');

// API bắt đầu ghi hình
router.post('/recording/start/:streamKey', async (req, res) => {
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

        // Tạo thư mục recordings nếu chưa tồn tại
        const recordingsDir = path.join(__dirname, '../../../recordings');
        if (!fs.existsSync(recordingsDir)) {
            fs.mkdirSync(recordingsDir, { recursive: true });
        }

        // Tạo file name độc nhất
        const fileName = `stream_${stream.id}_${Date.now()}.mp4`;
        const filePath = path.join(recordingsDir, fileName);

        // Tạo recording record trong database
        const recording = await StreamRecording.create({
            stream_id: stream.id,
            file_url: `/recordings/${fileName}`,
            status: 'recording'
        });

        res.json({
            success: true,
            data: {
                recording_id: recording.id,
                file_url: recording.file_url,
                status: recording.status
            }
        });

    } catch (error) {
        console.error('Error starting recording:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
});

// API dừng ghi hình
router.post('/recording/stop/:streamKey', async (req, res) => {
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

        // Tìm và cập nhật recording record
        const recording = await StreamRecording.findOne({
            where: {
                stream_id: stream.id,
                status: 'recording'
            }
        });

        if (!recording) {
            return res.status(404).json({
                success: false,
                error: "No active recording found"
            });
        }

        // Cập nhật trạng thái recording
        await recording.update({
            status: 'completed',
            ended_at: new Date()
        });

        res.json({
            success: true,
            data: {
                recording_id: recording.id,
                status: 'completed',
                ended_at: recording.ended_at
            }
        });

    } catch (error) {
        console.error('Error stopping recording:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
});

// Get recordings list
router.get('/recordings/:streamKey', async (req, res) => {
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

        const recordings = await StreamRecording.findAll({
            where: {
                stream_id: stream.id
            },
            order: [['started_at', 'DESC']]
        });

        res.json({
            success: true,
            data: recordings
        });

    } catch (error) {
        console.error('Error fetching recordings:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
});

module.exports = router;
