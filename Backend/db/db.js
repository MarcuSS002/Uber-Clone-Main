const mongoose = require('mongoose');

function connectToDb() {
    const mongoURI = process.env.MONGODB_URI;
    mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connect error:', err.message);
        process.exit(1);
    });
}

module.exports = connectToDb;