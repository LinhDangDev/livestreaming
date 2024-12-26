const express = require('express');
const router = express.Router();
const Stream = require('../../entity/Stream');

router.post('/auth', async (req, res) => {
    try {
        // Lấy stream key từ body.name
        const stream_key = req.body.name;

        console.log('Auth request received:', {
            body: req.body,
            streamKey: stream_key
        });

        if (!stream_key) {
            console.error('No stream key provided');
            return res.status(403).json({
                success: false,
                error: "No stream key provided"
            });
        }

        const stream = await Stream.findOne({
            where: { stream_key }
        });

        if (!stream) {
            console.error('Invalid stream key:', stream_key);
            return res.status(403).json({
                success: false,
                error: "Invalid stream key"
            });
        }

        // Update stream status to 'live'
        await stream.update({ status: 'active' });

        console.log('Stream authenticated successfully:', {
            streamId: stream.id,
            streamKey: stream_key
        });

        return res.status(200).send('OK');  // NGINX RTMP cần response đơn giản

    } catch (error) {
        console.error('Error authenticating stream:', error);
        return res.status(500).send('Error');  // NGINX RTMP cần response đơn giản
    }
});

module.exports = router;
