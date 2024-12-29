const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Stream = require('../../entity/Stream');
const Participant = require('../../entity/Participant');
const BannedParticipant = require('../../entity/BannedParticipants');
const { checkStreamStatus } = require('../../middleware/streamMiddleware');

// Import các route mới tách
const streamAuthRouter = require('./streamAuth');
const streamCompleteRouter = require('./streamComplete');
const endStreamRouter = require('./endStream');

// Middleware kiểm tra người dùng bị ban
router.use('/viewer/join/:streamKey', async (req, res, next) => {
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

        const ip_address = req.headers['x-forwarded-for'] ||
                          req.connection.remoteAddress ||
                          req.socket.remoteAddress ||
                          req.ip;

        // Kiểm tra ban theo IP và thời gian
        const bannedParticipant = await BannedParticipant.findOne({
            where: {
                stream_id: stream.id,
                ip_address: ip_address,
                [Op.or]: [
                    { ban_end_time: { [Op.gt]: new Date() } }, // Chưa hết hạn
                    { ban_end_time: null } // Ban vĩnh viễn
                ]
            },
            order: [['banned_at', 'DESC']] // Lấy ban record mới nhất
        });

        if (bannedParticipant) {
            // Kiểm tra loại ban
            if (bannedParticipant.ban_end_time === null) {
                return res.status(403).json({
                    success: false,
                    error: "You are permanently banned from this stream",
                    status: 403
                });
            } else {
                return res.status(403).json({
                    success: false,
                    error: `You are banned until ${bannedParticipant.ban_end_time}`,
                    status: 403
                });
            }
        }

        next();
    } catch (error) {
        console.error('Error checking ban status:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
});

// Sử dụng các route mới
router.use('/', streamAuthRouter);
router.use('/', streamCompleteRouter);
router.use('/', endStreamRouter);

module.exports = router;
