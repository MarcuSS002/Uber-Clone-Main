/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react'
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'

const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: -3.745,
    lng: -38.523
};

const LiveTracking = ({ pickup, destination }) => {
    const [ currentPosition, setCurrentPosition ] = useState(center);
    const [ directions, setDirections ] = useState(null)
    const mapRef = useRef(null)

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        });

        const watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    useEffect(() => {
        const updatePosition = () => {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;

                setCurrentPosition({
                    lat: latitude,
                    lng: longitude
                });
            });
        };

        updatePosition(); // Initial position update

        const watcher = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({ lat: latitude, lng: longitude })
        })

        return () => navigator.geolocation.clearWatch(watcher)

    }, []);

    useEffect(() => {
        // Request directions when both pickup and destination are simple address strings
        if (!pickup || !destination) return
        if (!window.google || !window.google.maps) return

        const directionsService = new window.google.maps.DirectionsService()
        directionsService.route({
            origin: pickup,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                setDirections(result)
            } else {
                setDirections(null)
            }
        })
    }, [pickup, destination])

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPosition}
            zoom={15}
            onLoad={map => (mapRef.current = map)}
        >
            <Marker position={currentPosition} />
            {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
    )
}

export default LiveTracking