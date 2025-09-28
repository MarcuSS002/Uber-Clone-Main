const axios = require('axios');
const captainModel = require('../models/captain.model');

// Nominatim for Geocoding and Autocomplete (OpenStreetMap)
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

// OpenRouteService (ORS) for Distance/Time (requires API key)
const ORS_API_KEY = process.env.ORS_API_KEY;
const ORS_DIRECTIONS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car';

// NOTE: Add ORS_API_KEY to your Backend/.env if you want distance/time via ORS.

module.exports.getAddressCoordinate = async (address) => {
    // Use Nominatim search endpoint (be mindful of usage policy / rate limits)
    const url = `${NOMINATIM_URL}/search?q=${encodeURIComponent(address)}&format=json&limit=5`;

    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'UberClone/1.0' } });

        if (response.data && response.data.length > 0) {
            const location = response.data[0];
            return {
                lat: parseFloat(location.lat),
                ltd: parseFloat(location.lat), // legacy key
                lng: parseFloat(location.lon)
            };
        } else {
            throw new Error('Coordinates not found via Nominatim');
        }
    } catch (error) {
        // IMPROVED ERROR HANDLING: Catch the Nominatim API error and throw a clear message.
        console.error('Error in getAddressCoordinate (Nominatim):', error.message || error);
        throw new Error('Failed to geocode address.');
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    if (!ORS_API_KEY) {
        throw new Error('OpenRouteService API key not configured (ORS_API_KEY)');
    }

    // Geocode both addresses to coordinates
    const originCoords = await module.exports.getAddressCoordinate(origin);
    const destinationCoords = await module.exports.getAddressCoordinate(destination);

    // ORS requires coordinates in [lon, lat]
    const coords = [
        [originCoords.lng, originCoords.lat],
        [destinationCoords.lng, destinationCoords.lat]
    ];

    // ORS Directions API supports POST with JSON body
    try {
        const response = await axios.post(ORS_DIRECTIONS_URL, {
            coordinates: coords
        }, {
            headers: {
                // Using Bearer Token scheme for Authorization (Fix for 403)
                'Authorization': `Bearer ${ORS_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data && response.data.routes && response.data.routes.length > 0) {
            const segment = response.data.routes[0].segments[0];
            return {
                distance: {
                    text: `${(segment.distance / 1000).toFixed(1)} km`,
                    value: segment.distance
                },
                duration: {
                    text: `${Math.round(segment.duration / 60)} mins`,
                    value: segment.duration
                }
            };
        } else {
            throw new Error('No routes found via ORS');
        }
    } catch (err) {
        // CRITICAL IMPROVED ERROR HANDLING: Catch the ORS API error and throw a clear message.
        console.error('Error in getDistanceTime (ORS API):', err.response?.status, err.response?.data || err.message);
        throw new Error('Failed to calculate distance/time. Please check ORS key and server logs.');
    }
}

module.exports.getAutoCompleteSuggestions = async (input) => {
    if (!input) {
        throw new Error('query is required');
    }

    const url = `${NOMINATIM_URL}/search?q=${encodeURIComponent(input)}&format=json&limit=5`;

    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'UberClone/1.0' } });

        if (response.data) {
            return response.data.map(prediction => prediction.display_name).filter(value => value);
        } else {
            throw new Error('Unable to fetch suggestions');
        }
    } catch (err) {
        // IMPROVED ERROR HANDLING: Catch the Nominatim API error and throw a clear message.
        console.error('Error in getAutoCompleteSuggestions (Nominatim):', err.message || err);
        throw new Error('Failed to fetch auto-suggestions.');
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