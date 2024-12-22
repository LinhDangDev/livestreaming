const express = require('express');
const router = express.Router();
const streamService = require('../services/streamService'); // Import services

// API endpoints (ví dụ):
router.post('/create', streamService.createStream);
router.get('/:streamKey', streamService.getStream);
// ... (Các API khác)

module.exports = router;
