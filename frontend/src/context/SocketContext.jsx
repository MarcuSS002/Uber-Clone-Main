
import { createContext, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { UserDataContext } from './UserContext';
import { apiBaseUrl } from '../utils/api-config';

export const SocketContext = createContext();

// Use a socket.io client with some sensible reconnect options and better error logging
const socket = io(`${apiBaseUrl}`, {
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
}); // Replace with your server URL

const SocketProvider = ({ children }) => {
    const { setRide } = useContext(UserDataContext)

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

        // Listen for ride lifecycle events and update global ride state
        const handleRideConfirmed = (r) => {
            console.debug('Socket event (global): ride-confirmed', r)
            if (typeof setRide === 'function') setRide(r)
            // Also emit a DOM event so non-React listeners can pick it up if needed
            try { window.dispatchEvent(new CustomEvent('ride-confirmed', { detail: r })) } catch (e) { console.warn('ride-confirmed DOM dispatch failed', e) }
        }

        const handleRideStarted = (r) => {
            console.debug('Socket event (global): ride-started', r)
            if (typeof setRide === 'function') setRide(r)
            try { window.dispatchEvent(new CustomEvent('ride-started', { detail: r })) } catch (e) { console.warn('ride-started DOM dispatch failed', e) }
        }

        socket.on('ride-confirmed', handleRideConfirmed)
        socket.on('ride-started', handleRideStarted)

        return () => {
            socket.off('ride-confirmed', handleRideConfirmed)
            socket.off('ride-started', handleRideStarted)
        }

    }, [setRide]);



    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketProvider;

SocketProvider.propTypes = {
    children: PropTypes.node
}