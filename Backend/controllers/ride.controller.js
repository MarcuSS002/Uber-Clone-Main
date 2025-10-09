const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');


module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType } = req.body;

    try {
        // Ensure authentication middleware attached a user
        if (!req.user || !req.user._id) {
            console.error('createRide: req.user is not set');
            return res.status(401).json({ message: 'Unauthorized: user not authenticated' });
        }

        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });
        // Send success response early so the client doesn't wait for notifications
        res.status(201).json(ride);

        // Notification work should not crash the request-response flow. Wrap it separately.
        try {
            const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

            // Defensive check: ensure coordinates are valid before using them
            if (!pickupCoordinates || typeof pickupCoordinates.lat !== 'number' || typeof pickupCoordinates.lng !== 'number') {
                console.warn(`Could not get valid coordinates for pickup: ${pickup}. Skipping captain notification.`);
                return;
            }

            const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.lat, pickupCoordinates.lng, 2);

            // Make OTP blank for notifications
            ride.otp = "";

            // Fetch the newly created ride and populate the 'user' field (include fullname, email and socketId)
            const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user', 'fullname email socketId');

            // optional debug log to confirm event payload
            console.log(`Sending new-ride event to ${Array.isArray(captainsInRadius) ? captainsInRadius.length : 0} captains. rideId=${ride._id}`);

            // Only send to captains that have socketId
            (captainsInRadius || []).filter(c => c && c.socketId).forEach(captain => {
                sendMessageToSocketId(captain.socketId, {
                    event: 'new-ride',
                    data: rideWithUser
                });
            });
        } catch (notifyErr) {
            // Log notification errors but do not attempt to modify the already-sent response
            console.error('createRide: error while notifying captains:', notifyErr);
        }

    } catch (err) {
        // If the response was already sent to the client, just log the error
        console.error('SERVER-SIDE CRITICAL FAILURE in createRide:', err);
        if (!res.headersSent) {
            return res.status(500).json({ message: 'Internal server error during ride creation.' });
        }
    }

};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })



        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    } s
}