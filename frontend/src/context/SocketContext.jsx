
import React, { createContext, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

// Use a socket.io client with some sensible reconnect options and better error logging
const socket = io(`${import.meta.env.VITE_BASE_URL}`, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
}); // Replace with your server URL

const SocketProvider = ({ children }) => {
    useEffect(() => {
        // Basic connection logic
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connect_error:', err && err.message ? err.message : err);
        });

        socket.io.on('reconnect_failed', () => {
            console.error('Socket reconnection failed');
        });

    }, []);



    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;