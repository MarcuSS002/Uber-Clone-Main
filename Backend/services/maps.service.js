const axios = require('axios');
const captainModel = require('../models/captain.model');

module.exports.getAddressCoordinate = async (address) => {
    const apiKey = process.env.GOOGLE_MAPS_API;
    if (!apiKey) throw new Error('Google Maps API key not configured (GOOGLE_MAPS_API)');

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        // helpful debug info when things fail
        if (!response || !response.data) {
            console.error('No response data from Geocode API', response && response.status);
            throw new Error('No response from Google Geocode API');
        }

        if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            // return normalized keys and keep legacy 'ltd' property for backward compatibility
            return {
                lat: location.lat,
                ltd: location.lat,
                lng: location.lng
            };
        } else {
            // include Google error_message if present
            const errMsg = response.data.error_message || `Google Geocode status: ${response.data.status}`;
            console.error('Geocode API error:', errMsg, 'response:', response.data);
            throw new Error(`Unable to fetch coordinates: ${errMsg}`);
        }
    } catch (error) {
        console.error('Error while fetching address coordinate:', error.message || error, error.response && error.response.data ? error.response.data : 'no response body');
        throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {


        const response = await axios.get(url);
        if (response.data.status === 'OK') {

            if (response.data.rows[ 0 ].elements[ 0 ].status === 'ZERO_RESULTS') {
                throw new Error('No routes found');
            }

            return response.data.rows[ 0 ].elements[ 0 ];
        } else {
            throw new Error('Unable to fetch distance and time');
        }

    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            return response.data.predictions.map(prediction => prediction.description).filter(value => value);
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async (ltd, lng, radius) => {

    // radius in km


    const captains = await captainModel.find({
        location: {
            $geoWithin: {
                $centerSphere: [ [ ltd, lng ], radius / 6371 ]
            }
        }
    });

    return captains;


}