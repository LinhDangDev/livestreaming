const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Stream = require('../../entity/Stream');
const Participant = require('../../entity/Participant');
const BannedParticipant = require('../../entity/BannedParticipants');

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

        const bannedParticipant = await BannedParticipant.findOne({
            where: {
                stream_id: stream.id,
                ip_address: ip_address,
                ban_end_time: {
                    [Op.or]: [
                        {[Op.gt]: new Date()}, // Chưa hết hạn
                        {[Op.eq]: null}  // Ban vĩnh viễn
                    ]
                }
            }
        });

        if (bannedParticipant) {
            const message = bannedParticipant.ban_end_time
                ? `You are banned until ${bannedParticipant.ban_end_time}`
                : "You are permanently banned from this stream";

            return res.status(403).json({
                success: false,
                error: message
            });
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

module.exports = router;
