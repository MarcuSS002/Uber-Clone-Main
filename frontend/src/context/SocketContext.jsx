import { createContext, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { io } from "socket.io-client";
import { UserDataContext } from "./UserContext";
import { apiBaseUrl } from "../utils/api-config";

export const SocketContext = createContext();

// This opens connection from frontend to backend socket server.
const socket = io(`${apiBaseUrl}`, {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"],
}); 

const SocketProvider = ({ children }) => {
  const { setRide } = useContext(UserDataContext);

  useEffect(() => {
    // Basic connection logic
    const handleConnect = () => {
      console.log("Connected to server");
    };

    const handleDisconnect = () => {
      console.log("Disconnected from server");
    };

    const handleConnectError = (err) => {
      console.error(
        "Socket connect_error:",
        err && err.message ? err.message : err,
      );
    };

    const handleReconnectFailed = () => {
      console.error("Socket reconnection failed");
    };

    // Listen for ride lifecycle events and update global ride state
    const handleRideConfirmed = (r) => {
      console.debug("Socket event (global): ride-confirmed", r);
      if (typeof setRide === "function") setRide(r);
      // Also emit a DOM event so non-React listeners can pick it up if needed
      try {
        window.dispatchEvent(new CustomEvent("ride-confirmed", { detail: r }));
      } catch (e) {
        console.warn("ride-confirmed DOM dispatch failed", e);
      }
    };

    const handleRideStarted = (r) => {
      console.debug("Socket event (global): ride-started", r);
      if (typeof setRide === "function") setRide(r);
      try {
        window.dispatchEvent(new CustomEvent("ride-started", { detail: r }));
      } catch (e) {
        console.warn("ride-started DOM dispatch failed", e);
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect_failed", handleReconnectFailed);
    socket.on("ride-confirmed", handleRideConfirmed);
    socket.on("ride-started", handleRideStarted);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect_failed", handleReconnectFailed);
      socket.off("ride-confirmed", handleRideConfirmed);
      socket.off("ride-started", handleRideStarted);
    };
  }, [setRide]);

  return (

    // Now any child can access socket with useContext(SocketContext).
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;

SocketProvider.propTypes = {
  children: PropTypes.node,
};
