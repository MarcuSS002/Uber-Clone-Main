import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import PropTypes from 'prop-types'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const defaultCenter = { lat: 28.6139, lng: 77.2090 }

const FitBounds = ({ points }) => {
    const map = useMap()

    useEffect(() => {
        if (!Array.isArray(points) || points.length === 0) return
        const bounds = L.latLngBounds(points)
        map.fitBounds(bounds, { padding: [40, 40] })
    }, [map, points])

    return null
}

FitBounds.propTypes = {
    points: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
}

const CaptainPickupMap = ({ pickupAddress }) => {
    const [captainPosition, setCaptainPosition] = useState(defaultCenter)
    const [pickupPosition, setPickupPosition] = useState(null)
    const [routePath, setRoutePath] = useState([])

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCaptainPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                })
            },
            () => {},
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }, [])

    useEffect(() => {
        if (!pickupAddress) {
            setPickupPosition(null)
            setRoutePath([])
            return
        }

        const geocodePickup = async () => {
            try {
                const q = encodeURIComponent(pickupAddress)
                const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
                const response = await fetch(url)
                const data = await response.json()

                if (Array.isArray(data) && data.length > 0) {
                    setPickupPosition({
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon),
                    })
                } else {
                    setPickupPosition(null)
                }
            } catch (err) {
                console.warn('CaptainPickupMap geocoding failed:', err)
                setPickupPosition(null)
            }
        }

        geocodePickup()
    }, [pickupAddress])

    useEffect(() => {
        if (!pickupPosition) {
            setRoutePath([])
            return
        }

        const getRouteFromOsrm = async () => {
            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${captainPosition.lng},${captainPosition.lat};${pickupPosition.lng},${pickupPosition.lat}?overview=full&geometries=geojson`
                const response = await fetch(url)
                const data = await response.json()
                const coords = data?.routes?.[0]?.geometry?.coordinates

                if (Array.isArray(coords)) {
                    const latLngPath = coords.map(([lng, lat]) => [lat, lng])
                    setRoutePath(latLngPath)
                } else {
                    setRoutePath([])
                }
            } catch (err) {
                console.warn('CaptainPickupMap OSRM route failed:', err)
                setRoutePath([])
            }
        }

        getRouteFromOsrm()
    }, [captainPosition, pickupPosition])

    const fitPoints = useMemo(() => {
        const points = [[captainPosition.lat, captainPosition.lng]]
        if (pickupPosition) points.push([pickupPosition.lat, pickupPosition.lng])
        if (routePath.length > 0) return routePath
        return points
    }, [captainPosition, pickupPosition, routePath])

    return (
        <MapContainer
            style={{ width: '100%', height: '100%' }}
            center={[captainPosition.lat, captainPosition.lng]}
            zoom={13}
            scrollWheelZoom
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            <FitBounds points={fitPoints} />
            <Marker position={[captainPosition.lat, captainPosition.lng]} />
            {pickupPosition && <Marker position={[pickupPosition.lat, pickupPosition.lng]} />}
            {routePath.length > 0 && <Polyline positions={routePath} pathOptions={{ color: '#111827', weight: 5 }} />}
        </MapContainer>
    )
}

CaptainPickupMap.propTypes = {
    pickupAddress: PropTypes.string,
}

export default CaptainPickupMap
