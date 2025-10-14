import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import { useEffect, useContext } from 'react'
import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CapatainContext'
import axios from 'axios'

const CaptainHome = () => {

    const [ ridePopupPanel, setRidePopupPanel ] = useState(false)
    const [ confirmRidePopupPanel, setConfirmRidePopupPanel ] = useState(false)

    const ridePopupPanelRef = useRef(null)
    const [ ride, setRide ] = useState(null)
    const [ isConfirming, setIsConfirming ] = useState(false)

    const { socket } = useContext(SocketContext)
    const { captain } = useContext(CaptainDataContext)

    useEffect(() => {
        if (!socket || !captain || !captain._id) return;

        socket.emit('join', {
            userId: captain._id,
            userType: 'captain'
        })

        const updateLocation = () => {
            // CORRECTION: For development/testing we send a hardcoded location
            // near the user's logged pickup point so captains are considered "nearby".
            const hardcodedLocation = {
                lat: 28.630000,
                lng: 77.210000
            };

            console.log(`Hardcoded location emitted for captain ${captain._id}:`, hardcodedLocation.lat, hardcodedLocation.lng);

            socket.emit('update-location-captain', {
                userId: captain._id,
                location: hardcodedLocation
            });
        }

        updateLocation()
        const locationInterval = setInterval(updateLocation, 10000)

        return () => clearInterval(locationInterval)
    }, [socket, captain])

    // Register socket listener inside useEffect with cleanup to ensure it fires reliably
    useEffect(() => {
        if (!socket) return;

        const handleNewRide = (data) => {
            console.debug('Socket event: new-ride', data)
            setRide(data)
            // Show the ride popup panel on new-ride arrival so captain can review and Accept
            setRidePopupPanel(true)
            setConfirmRidePopupPanel(false)
        }

        socket.on('new-ride', handleNewRide)

        return () => {
            socket.off('new-ride', handleNewRide)
        }
    }, [socket])

    async function confirmRide() {
        if (!ride) return;
        setIsConfirming(true)
        try {
            const token = localStorage.getItem('captain-token')
            if (!token) {
                alert('You must be logged in as a captain to accept rides')
                return
            }

            await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
                rideId: ride._id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            // Open confirm ride popup so captain can enter OTP to start the ride
            setRidePopupPanel(false)
            setConfirmRidePopupPanel(true)
        } catch (err) {
            console.error('Error confirming ride:', err)
            alert('Failed to accept ride. Please try again.')
        } finally {
            setIsConfirming(false)
        }
    }


    useGSAP(function () {
        const target = ridePopupPanelRef.current;
        if (!target) return;

        if (ridePopupPanel) {
            gsap.to(target, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(target, {
                transform: 'translateY(100%)'
            })
        }
    }, [ ridePopupPanel ])

    return (
        <div className='h-screen'>
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                <Link to='/captain-home' className=' h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>
            <div className='h-3/5'>
                <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />

            </div>
            <div className='h-2/5 p-6'>
                <CaptainDetails />
            </div>
            <div ref={ridePopupPanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                    isConfirming={isConfirming}
                />
            </div>
            {ride && confirmRidePopupPanel && (
                <ConfirmRidePopUp
                    ride={ride}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    setRidePopupPanel={setRidePopupPanel} />
            )}
        </div>
    )
}

export default CaptainHome