const express = require('express');
const router = express.Router();

const createStream = require('./stream/createStream');
const endStream = require('./stream/endStream');
const joinStream = require('./stream/joinStream');
const banParticipant = require('./stream/banParticipant');
const chatRoutes = require('./stream/chatRoutes');
const participantRoutes = require('./stream/participants');
const streamRoutes = require('./stream/streamRoutes');
const health = require('./health');
const streamRecordings = require('./stream/streamRecordings');

// Đăng ký các route

// Health check route
router.use('/health', health);

// Stream routes
router.use('/streams', createStream);
router.use('/streams', endStream);
router.use('/streams', joinStream);
router.use('/streams', banParticipant);
router.use('/streams', streamRoutes);
router.use('/streams/chat', chatRoutes);
router.use('/streams/participants', participantRoutes);
router.use('/streams', streamRecordings);

module.exports = router;
