const mongoose = require('mongoose');

let cachedConnectionPromise = null;

function connectToDb() {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve(mongoose.connection);
    }

    if (cachedConnectionPromise) {
        return cachedConnectionPromise;
    }

    cachedConnectionPromise = mongoose.connect(process.env.DB_CONNECT)
        .then((connection) => {
            console.log('Connected to DB');
            return connection;
        })
        .catch((err) => {
            cachedConnectionPromise = null;
            throw err;
        });

    return cachedConnectionPromise;
}

module.exports = connectToDb;
