const express = require('express');
const router = express.Router();
const Stream = require('../../entity/Stream');
const Participant = require('../../entity/Participant');
const BannedParticipant = require('../../entity/BannedParticipants');

// API ban/kick participant
router.post('/kick/:streamKey', async (req, res) => {
    try {
        const { participant_id, duration, reason } = req.body;

        // Parse participant_id to number if it's a string
        const parsedParticipantId = parseInt(participant_id);

        // Tìm stream
        const stream = await Stream.findOne({
            where: { stream_key: req.params.streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        // Tìm streamer (người thực hiện ban)
        const streamer = await Participant.findOne({
            where: {
                stream_id: stream.id,
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
                id: parsedParticipantId,
                stream_id: stream.id
            }
        });

        if (!participantToBan) {
            return res.status(404).json({
                success: false,
                error: "Participant not found"
            });
        }

        // Kiểm tra đã bị ban chưa
        const existingBan = await BannedParticipant.findOne({
            where: {
                stream_id: stream.id,
                participant_id: parsedParticipantId
            }
        });

        if (existingBan) {
            return res.status(400).json({
                success: false,
                error: "Participant is already banned"
            });
        }

        // Tạo ban record
        const banEndTime = duration ? new Date(Date.now() + duration * 1000) : null;

        const bannedRecord = await BannedParticipant.create({
            stream_id: stream.id,
            participant_id: parsedParticipantId,
            banned_by: streamer.id,
            ip_address: participantToBan.ip_address,
            reason: reason || 'No reason provided',
            ban_duration: duration || null,
            banned_at: new Date(),
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

        // Xóa tất cả ban records của participant
        await BannedParticipant.destroy({
            where: {
                stream_id: stream.id,
                participant_id: participant_id
            }
        });

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
            message: "Participant unbanned successfully",
            data: {
                participant: {
                    id: participant_id,
                    status: 'active'
                }
            },
            status: 200
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

// API ban participant
router.post('/ban/:streamKey', async (req, res) => {
    try {
        const { participant_id, reason } = req.body;

        const stream = await Stream.findOne({
            where: { stream_key: req.params.streamKey }
        });

        if (!stream) {
            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });
        }

        // Tìm streamer
        const streamer = await Participant.findOne({
            where: {
                stream_id: stream.id,
                role: 'streamer'
            }
        });

        if (!streamer) {
            return res.status(403).json({
                success: false,
                error: "Only streamer can ban participants"
            });
        }

        const participantToBan = await Participant.findOne({
            where: {
                id: participant_id,
                stream_id: stream.id
            }
        });

        if (!participantToBan) {
            return res.status(404).json({
                success: false,
                error: "Participant not found"
            });
        }

        const bannedRecord = await BannedParticipant.create({
            stream_id: stream.id,
            participant_id: participantToBan.id,
            banned_by: streamer.id,
            ip_address: participantToBan.ip_address,
            reason: reason || 'No reason provided',
            ban_duration: null,
            banned_at: new Date(),
            ban_end_time: null
        });

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
                duration: 'permanent',
                reason: reason || 'No reason provided',
                ban_end_time: null
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

module.exports = router;
