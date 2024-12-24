const express = require('express');
const router = express.Router();
const Stream = require('../../entity/Stream');
const Participant = require('../../entity/Participant');
const BannedParticipant = require('../../entity/BannedParticipants');
const { Op } = require('sequelize');

// API ban/kick participant
router.post('/kick/:streamKey', async (req, res) => {
    try {
        const { participant_id, duration, reason } = req.body;

        if (!participant_id) {
            return res.status(400).json({
                success: false,
                error: "Participant ID is required"
            });
        }

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

        // Kiểm tra streamer
        const streamer = await Participant.findOne({
            where: {
                stream_id: stream.id,
                ip_address: ip_address,
                role: 'streamer'
            }
        });

        if (!streamer) {
            return res.status(403).json({
                success: false,
                error: "Only streamer can ban participants"
            });
        }

        // Tìm participant cần ban
        const participantToBan = await Participant.findOne({
            where: {
                id: parseInt(participant_id), // Convert to integer
                stream_id: stream.id
            },
            include: [{
                model: BannedParticipant,
                required: false,
                where: {
                    stream_id: stream.id
                }
            }]
        });

        if (!participantToBan) {
            return res.status(404).json({
                success: false,
                error: "Participant not found"
            });
        }

        if (participantToBan.role === 'streamer') {
            return res.status(403).json({
                success: false,
                error: "Cannot ban the streamer"
            });
        }

        // Kiểm tra xem đã bị ban chưa
        if (participantToBan.BannedParticipant) {
            return res.status(400).json({
                success: false,
                error: "Participant is already banned"
            });
        }

        // Tạo ban record
        const banEndTime = duration ? new Date(Date.now() + duration * 1000) : null;

        const bannedRecord = await BannedParticipant.create({
            stream_id: stream.id,
            participant_id: parseInt(participant_id),
            ip_address: participantToBan.ip_address,
            reason: reason || 'No reason provided',
            ban_duration: duration || null,
            banned_at: new Date(),
            banned_by: streamer.id,
            ban_end_time: banEndTime
        });

        // Cập nhật trạng thái participant
        await participantToBan.update({
            status: 'banned'
        });

        res.json({
            success: true,
            data: {
                banned_participant: {
                    id: participantToBan.id,
                    display_name: participantToBan.display_name
                },
                duration: duration ? `${duration} seconds` : 'permanent',
                reason: reason || 'No reason provided',
                ban_end_time: banEndTime
            }
        });

    } catch (error) {
        console.error('Error banning participant:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
});

// API unban participant
router.post('/unban/:streamKey', async (req, res) => {
    try {
        const { participant_id } = req.body;

        if (!participant_id) {
            return res.status(400).json({
                success: false,
                error: "Participant ID is required"
            });
        }

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
                ip_address: ip_address,
                role: 'streamer'
            }
        });

        if (!streamer) {
            return res.status(403).json({
                success: false,
                error: "Only streamer can unban participants"
            });
        }

        const bannedParticipant = await BannedParticipant.findOne({
            where: {
                stream_id: stream.id,
                participant_id: participant_id
            }
        });

        if (!bannedParticipant) {
            return res.status(404).json({
                success: false,
                error: "Banned participant not found"
            });
        }

        // Xóa ban record
        await bannedParticipant.destroy();

        // Cập nhật trạng thái participant
        await Participant.update(
            { status: 'active' },
            {
                where: {
                    id: participant_id,
                    stream_id: stream.id
                }
            }
        );

        res.json({
            success: true,
            message: "Participant unbanned successfully"
        });

    } catch (error) {
        console.error('Error unbanning participant:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: error.message
        });
    }
});

module.exports = router;
