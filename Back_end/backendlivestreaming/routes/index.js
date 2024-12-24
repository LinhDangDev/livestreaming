const express = require('express');
const router = express.Router();

const createStream = require('./stream/createStream');
const endStream = require('./stream/endStream');
const joinStream = require('./stream/joinStream');
const banParticipant = require('./stream/banParticipant');
const chatRoutes = require('./stream/chatRoutes');
const participantRoutes = require('./stream/participants');

router.use('/streams', createStream);
router.use('/streams', endStream);
router.use('/streams', joinStream);
router.use('/streams', banParticipant);
router.use('/streams/chat', chatRoutes);
router.use('/streams/participants', participantRoutes);

module.exports = router;
