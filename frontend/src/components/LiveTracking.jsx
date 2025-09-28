/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet' // To fix missing default marker icon

// This fixes a common issue where the default marker icon does not show up
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: -3.745,
    lng: -38.523
};

// Custom hook to automatically re-center the map when position changes
const SetView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.lat && center.lng) {
            map.setView([center.lat, center.lng], map.getZoom() || 15);
        }
    }, [center, map]);
    return null;
}

const LiveTracking = () => {
    const [ currentPosition, setCurrentPosition ] = useState(center);

    useEffect(() => {
        // Initial location fetch (retains existing logic)
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        });

        // Watch position for continuous updates
        const watchId = navigator.geolocation.watchPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return (
        <MapContainer
            style={containerStyle}
            center={[currentPosition.lat, currentPosition.lng]}
            zoom={15}
            scrollWheelZoom={true}
        >
            {/* Use OpenStreetMap tiles */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {currentPosition.lat && currentPosition.lng && (
                <>
                    {/* Automatically pan/zoom to the current location */}
                    <SetView center={currentPosition} />
                    {/* Place a marker at the current location */}
                    <Marker position={[currentPosition.lat, currentPosition.lng]} />
                </>
            )}
        </MapContainer>
    )
}

export default LiveTracking