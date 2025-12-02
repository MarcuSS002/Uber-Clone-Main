const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blacklistToken.model.js');
const captainModel = require('../models/captain.model');


module.exports.authUser = async (req, res, next) => {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    const maskToken = (t) => {
        if (!t) return null;
        return `${t.slice(0, 6)}...${t.slice(-6)}`;
    }

    if (!token) {
        console.warn('authUser: no authorization token provided');
        return res.status(401).json({ message: 'Authorization token not found.' });
    }

    console.log('authUser: token received:', maskToken(token));

    try {
        const isBlacklisted = await blackListTokenModel.findOne({ token: token });
        if (isBlacklisted) {
            console.warn('authUser: token is blacklisted');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (verifyErr) {
            console.warn('authUser: token verification failed:', verifyErr.message);
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        const user = await userModel.findById(decoded._id);
        if (!user) {
            console.warn('authUser: user not found for decoded token id:', decoded._id);
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;
        return next();
    } catch (err) {
        console.error('authUser: unexpected error:', err);
        return res.status(500).json({ message: 'Internal auth error' });
    }
}

module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    const maskToken = (t) => {
        if (!t) return null;
        return `${t.slice(0, 6)}...${t.slice(-6)}`;
    }

    if (!token) {
        console.warn('authCaptain: no authorization token provided');
        return res.status(401).json({ message: 'Authorization token not found.' });
    }

    console.log('authCaptain: token received:', maskToken(token));

    try {
        const isBlacklisted = await blackListTokenModel.findOne({ token: token });
        if (isBlacklisted) {
            console.warn('authCaptain: token is blacklisted');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (verifyErr) {
            console.warn('authCaptain: token verification failed:', verifyErr.message);
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        const captain = await captainModel.findById(decoded._id);
        if (!captain) {
            console.warn('authCaptain: captain not found for decoded token id:', decoded._id);
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.captain = captain;
        return next();
    } catch (err) {
        console.error('authCaptain: unexpected error:', err);
        return res.status(500).json({ message: 'Internal auth error' });
    }
}