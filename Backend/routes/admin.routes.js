const express = require('express');
const router = express.Router();
const captainModel = require('../models/captain.model');

// GET /admin/active-captains
// Returns captains that have a socketId (connected) and status active
router.get('/active-captains', async (req, res) => {
    try {
        const captains = await captainModel.find({ socketId: { $exists: true, $ne: '' }, status: 'active' }).select('fullname email socketId location status');
        return res.status(200).json({ count: captains.length, captains });
    } catch (err) {
        console.error('admin: failed to fetch active captains', err);
        return res.status(500).json({ message: 'Failed to fetch active captains' });
    }
});

module.exports = router;
