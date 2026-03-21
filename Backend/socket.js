const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

let io;
const activeCaptainSockets = new Map();
const captainRooms = new Map();

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join", async (data) => {
      const { userId, userType } = data;
      const roomName = `${userType}:${userId}`;

      socket.data.userId = String(userId);
      socket.data.userType = userType;
      socket.join(roomName);

      if (userType === "user") {
        await userModel.findByIdAndUpdate(
          userId,
          { socketId: socket.id },
          { new: true },
        );
        console.log(
          `User ${userId} joined with socketId=${socket.id} room=${roomName}`,
        );
      } else if (userType === "captain") {
        await captainModel.findByIdAndUpdate(
          userId,
          { socketId: socket.id, status: "active" },
          { new: true },
        );
        activeCaptainSockets.set(String(userId), socket.id);
        captainRooms.set(String(userId), roomName);
        console.log(
          `Captain ${userId} joined with socketId=${socket.id} room=${roomName} (status set to active)`,
        );
      }

      socket.emit("join:ack", {
        ok: true,
        socketId: socket.id,
        room: roomName,
        userType,
        userId,
      });
    });

    socket.on("update-location-captain", async (data) => {
      const { userId, location } = data;

      if (
        !location ||
        !Number.isFinite(Number(location.lat)) ||
        !Number.isFinite(Number(location.lng))
      ) {
        return socket.emit("error", { message: "Invalid location data" });
      }

      // Use $set to only update the location field
      await captainModel.findByIdAndUpdate(userId, {
        $set: {
          "location.lat": location.lat,
          "location.lng": location.lng,
        },
      });
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Attempt to clear any user/captain that had this socket
      (async () => {
        try {
          const { userId, userType } = socket.data || {};
          let u = null;
          let c = null;

          if (userType === "user" && userId) {
            u = await userModel.findByIdAndUpdate(
              userId,
              { $unset: { socketId: "" } },
              { new: true },
            );
          } else if (userType === "captain" && userId) {
            c = await captainModel.findByIdAndUpdate(
              userId,
              { $unset: { socketId: "" }, $set: { status: "inactive" } },
              { new: true },
            );
          } else {
            u = await userModel.findOneAndUpdate(
              { socketId: socket.id },
              { $unset: { socketId: "" } },
              { new: true },
            );
            c = await captainModel.findOneAndUpdate(
              { socketId: socket.id },
              { $unset: { socketId: "" }, $set: { status: "inactive" } },
              { new: true },
            );
          }

          if (c) {
            activeCaptainSockets.delete(String(c._id));
            captainRooms.delete(String(c._id));
            console.log(
              `Cleared socketId and set inactive for captain ${c._id}`,
            );
          }
          if (u) console.log(`Cleared socketId for user ${u._id}`);
        } catch (err) {
          console.error("Error clearing socketId on disconnect:", err);
        }
      })();
    });
  });
}

const sendMessageToSocketId = (socketId, messageObject) => {
  console.log(messageObject);

  if (io) {
    if (!socketId) {
      console.warn(
        "sendMessageToSocketId called with empty socketId, skipping emit",
        messageObject.event,
      );
      return;
    }
    console.log(
      `Emitting event '${messageObject.event}' to socketId=${socketId}`,
    );
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized.");
  }
};

const getActiveCaptainSocketIds = () => Array.from(activeCaptainSockets.values()).filter(Boolean);
const getCaptainRoomName = (captainId) => captainRooms.get(String(captainId)) || `captain:${captainId}`;

const sendMessageToRoom = (roomName, messageObject) => {
  if (!io || !roomName) {
    return;
  }

  console.log(`Emitting event '${messageObject.event}' to room=${roomName}`);
  io.to(roomName).emit(messageObject.event, messageObject.data);
};

module.exports = {
  initializeSocket,
  sendMessageToSocketId,
  sendMessageToRoom,
  getActiveCaptainSocketIds,
  getCaptainRoomName,
};
