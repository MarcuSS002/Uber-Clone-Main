// Simple test script to verify Geocoding service using backend env
require('dotenv').config({ path: __dirname + '/../.env' });
const mapService = require('../services/maps.service');

const address = process.argv.slice(2).join(' ') || '1600 Amphitheatre Parkway, Mountain View, CA';

(async () => {
  try {
    console.log('Testing geocode for address:', address);
    const coords = await mapService.getAddressCoordinate(address);
    console.log('Coordinates:', coords);
  } catch (err) {
    console.error('Geocode test failed:', err.message || err);
    if (err.response) console.error('Response data:', err.response.data);
    process.exitCode = 1;
  }
})();
