const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: [ 'GET', 'POST' ]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);


        socket.on('join', async (data) => {
            const { userId, userType } = data;

            if (userType === 'user') {
                const updated = await userModel.findByIdAndUpdate(userId, { socketId: socket.id }, { new: true });
                console.log(`User ${userId} joined with socketId=${socket.id}`);
            } else if (userType === 'captain') {
                const updated = await captainModel.findByIdAndUpdate(userId, { socketId: socket.id, status: 'active' }, { new: true });
                console.log(`Captain ${userId} joined with socketId=${socket.id} (status set to active)`);
            }
        });


        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;

            if (!location || !location.lat || !location.lng) {
                return socket.emit('error', { message: 'Invalid location data' });
            }

            // Use $set to only update the location field
            await captainModel.findByIdAndUpdate(userId, {
                $set: {
                    'location.lat': location.lat,
                    'location.lng': location.lng
                }
            });
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
            // Attempt to clear any user/captain that had this socket
            (async () => {
                try {
                    const u = await userModel.findOneAndUpdate({ socketId: socket.id }, { $unset: { socketId: '' } }, { new: true });
                    if (u) console.log(`Cleared socketId for user ${u._id}`);
                    const c = await captainModel.findOneAndUpdate({ socketId: socket.id }, { $unset: { socketId: '' }, $set: { status: 'inactive' } }, { new: true });
                    if (c) console.log(`Cleared socketId and set inactive for captain ${c._id}`);
                } catch (err) {
                    console.error('Error clearing socketId on disconnect:', err);
                }
            })();
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {

console.log(messageObject);

    if (io) {
        if (!socketId) {
            console.warn('sendMessageToSocketId called with empty socketId, skipping emit', messageObject.event);
            return;
        }
        console.log(`Emitting event '${messageObject.event}' to socketId=${socketId}`);
        io.to(socketId).emit(messageObject.event, messageObject.data);
    } else {
        console.log('Socket.io not initialized.');
    }
}

module.exports = { initializeSocket, sendMessageToSocketId };