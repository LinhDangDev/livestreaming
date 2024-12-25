const express = require('express');
const router = express.Router();
const { sequelize } = require('../entity/Stream');

router.get('/', async (req, res) => {
    try {
        await sequelize.authenticate();

        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
