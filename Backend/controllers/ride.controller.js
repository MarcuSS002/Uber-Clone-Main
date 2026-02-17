const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');
const captainModel = require('../models/captain.model');


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
            // Make OTP blank for notifications
            ride.otp = "";

            // Fetch the newly created ride and populate the 'user' field (include fullname, email and socketId)
            const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user', 'fullname email socketId');

            // Always notify online captains so captain-home receives rides immediately in dev/prod.
            const onlineCaptains = await captainModel.find({
                socketId: { $exists: true, $ne: '' },
                status: 'active'
            }).select('socketId');

            // Keep nearby captains first when geocoding succeeds, but do not block overall delivery.
            let captainsInRadius = [];
            try {
                const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
                if (pickupCoordinates && typeof pickupCoordinates.lat === 'number' && typeof pickupCoordinates.lng === 'number') {
                    captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.lat, pickupCoordinates.lng, 2);
                }
            } catch (geoErr) {
                console.warn('createRide: geocode/radius lookup failed, continuing with online captains only:', geoErr.message);
            }

            const captainSocketIds = new Set([
                ...(captainsInRadius || []).map(c => c?.socketId).filter(Boolean),
                ...(onlineCaptains || []).map(c => c?.socketId).filter(Boolean)
            ]);

            console.log(`Sending new-ride event to ${captainSocketIds.size} captains. rideId=${ride._id}`);

            captainSocketIds.forEach((socketId) => {
                sendMessageToSocketId(socketId, {
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
