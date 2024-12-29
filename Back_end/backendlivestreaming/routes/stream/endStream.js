const express = require('express');
const router = express.Router();
const Stream = require('../../entity/Stream');
const StreamRecording = require('../../entity/StreamRecording');
const rtmpService = require('../../services/rtmpService');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const cors = require('cors');

// Thêm CORS middleware
router.use(cors({
    origin: 'http://localhost:5173', // Frontend URL
    credentials: true
}));

router.post('/end/:streamKey', async (req, res) => {
    try {
        const { streamKey } = req.params;
        console.log('Attempting to end stream:', streamKey);

        // 1. Kiểm tra stream tồn tại
        const stream = await Stream.findOne({
            where: { stream_key: streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        // 2. Dừng recording nếu đang ghi
        const activeRecording = await StreamRecording.findOne({
            where: {
                stream_id: stream.id,
                status: 'recording'
            }
        });

        if (activeRecording) {
            try {
                // Cập nhật trạng thái recording
                await activeRecording.update({
                    status: 'completed',
                    ended_at: new Date()
                });
                console.log('Recording marked as completed');
            } catch (error) {
                console.error('Error updating recording status:', error);
            }
        }

        // 3. Ngắt kết nối RTMP
        try {
            // Sử dụng process kill thay vì nginx reload
            const { stdout, stderr } = await execAsync('ps aux | grep ffmpeg');
            const processes = stdout.split('\n');

            for (const process of processes) {
                if (process.includes(streamKey)) {
                    const pid = process.split(/\s+/)[1];
                    try {
                        await execAsync(`kill -9 ${pid}`);
                        console.log(`Killed RTMP process: ${pid}`);
                    } catch (error) {
                        console.error(`Error killing process ${pid}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error('Error terminating RTMP:', error);
        }

        // 4. Cập nhật trạng thái stream
        await stream.update({
            status: 'inactive' // Sử dụng 'inactive' thay vì 'ended'
        });

        res.json({
            success: true,
            message: "Stream ended successfully",
            data: {
                stream_id: stream.id,
                status: 'inactive',
                recording: activeRecording ? {
                    id: activeRecording.id,
                    file_url: activeRecording.file_path,
                    status: 'completed'
                } : null
            }
        });

    } catch (error) {
        console.error('Detailed error in end stream:', error);
        res.status(500).json({
            success: false,
            error: "Could not end stream",
            details: error.message
        });
    }
});

module.exports = router;
