import { useEffect, useRef, useState, useContext, lazy, Suspense } from 'react'
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const LiveTracking = lazy(() => import('../components/LiveTracking'));

const Home = () => {
    const [ pickup, setPickup ] = useState('')
    const [ destination, setDestination ] = useState('')
    const [ panelOpen, setPanelOpen ] = useState(false)
    const vehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const waitingForDriverRef = useRef(null)
    // NOTE: panelRef was removed — animation is controlled by classes/state.
    const panelCloseRef = useRef(null)
    const [ vehiclePanel, setVehiclePanel ] = useState(false)
    const [ confirmRidePanel, setConfirmRidePanel ] = useState(false)
    const [ vehicleFound, setVehicleFound ] = useState(false)
    const [ waitingForDriver, setWaitingForDriver ] = useState(false)
    const [ pickupSuggestions, setPickupSuggestions ] = useState([])
    const [ destinationSuggestions, setDestinationSuggestions ] = useState([])
    const [ activeField, setActiveField ] = useState(null)
    const [ fare, setFare ] = useState({})
    const [ vehicleType, setVehicleType ] = useState(null)
    const [ ride, setRide ] = useState(null)

    const navigate = useNavigate()

    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserDataContext)


    useEffect(() => {
        if (socket && user) socket.emit("join", { userType: "user", userId: user._id })
    }, [ socket, user ])

    useEffect(() => {
        if (!socket) return;

        const handleRideConfirmed = (ride) => {
            setVehicleFound(false)
            setWaitingForDriver(true)
            setRide(ride)
        }

        const handleRideStarted = (ride) => {
            console.log('ride')
            setWaitingForDriver(false)
            navigate('/riding', { state: { ride } }) // Updated navigate to include ride data
        }

        socket.on('ride-confirmed', handleRideConfirmed)
        socket.on('ride-started', handleRideStarted)

        return () => {
            socket.off('ride-confirmed', handleRideConfirmed)
            socket.off('ride-started', handleRideStarted)
        }
    }, [socket, navigate])


    const handlePickupChange = async (e) => {
        const val = e.target.value
        setPickup(val)
        if (!val) {
            setPickupSuggestions([])
            // Close panel if input is empty
            setPanelOpen(false) 
            return
        }
        // Check for minimum length to avoid 400 Bad Request
        if (val.length < 3) return;

        // Always use backend suggestions service
        try {
            const token = localStorage.getItem('token')
            console.log('Token sent for pickup suggestions:', token)
            if (!token) {
                console.warn('No auth token found when requesting pickup suggestions')
                // Optionally redirect to login
                navigate('/login')
                return
            }

            const resp = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: val },
                headers: { Authorization: `Bearer ${token}` }
            })
            setPickupSuggestions(resp.data)
            setPanelOpen(true)
        } catch {
            console.error('Failed to fetch pickup suggestions')
            setPickupSuggestions([])
        }
    }

    const handleDestinationChange = async (e) => {
        const val = e.target.value
        setDestination(val)
        if (!val) {
            setDestinationSuggestions([])
            // Close panel if input is empty
            setPanelOpen(false)
            return
        }
        // Check for minimum length to avoid 400 Bad Request
        if (val.length < 3) return;

        // Always use backend suggestions service
        try {
            const token = localStorage.getItem('token')
            console.log('Token sent for destination suggestions:', token)
            if (!token) {
                console.warn('No auth token found when requesting destination suggestions')
                navigate('/login')
                return
            }

            const resp = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: val },
                headers: { Authorization: `Bearer ${token}` }
            })
            setDestinationSuggestions(resp.data)
            setPanelOpen(true)
        } catch {
            console.error('Failed to fetch destination suggestions')
            setDestinationSuggestions([])
        }
    }

    const submitHandler = (e) => {
        e.preventDefault()
    }

    useGSAP(function () {
        if (panelOpen) {
            // NOTE: Removed height and padding GSAP. 
            // The full-screen appearance is now handled by h-screen and flex classes in JSX.
            gsap.to(panelCloseRef.current, {
                opacity: 1
            })
        } else {
            gsap.to(panelCloseRef.current, {
                opacity: 0
            })
        }
    }, [ panelOpen ])


    useGSAP(function () {
        if (vehiclePanel) {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ vehiclePanel ])

    useGSAP(function () {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ confirmRidePanel ])

    useGSAP(function () {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ vehicleFound ])

    useGSAP(function () {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ waitingForDriver ])


    async function findTrip() {
        setVehiclePanel(true)
        // This sets the panelOpen state to false, triggering the GSAP close and class change.
        setPanelOpen(false) 
        try { 
            const token = localStorage.getItem('token')
            console.log('Token sent for get-fare:', token)
            if (!token) {
                console.warn('No auth token found when requesting fare')
                navigate('/login')
                return
            }

            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
                params: { pickup, destination },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setFare(response.data)
        } catch (err) {
            console.error("Error finding trip/fare:", err);
            alert("Error finding trip/fare. Please check locations.");
            
            setVehiclePanel(false); 
            setPanelOpen(true); 
            return; 
        }
    }

   // ... existing code ...

    async function createRide() {
        try {
            const token = localStorage.getItem('token')
            console.log('Token sent for createRide:', token)
            if (!token) {
                console.warn('No auth token found when creating ride')
                alert('You must be logged in to create a ride')
                navigate('/login')
                return
            }

            await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
                pickup,
                destination,
                vehicleType
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            // No need to do anything here on success, as the server should emit a 
            // socket event that your useEffect listener handles.

        } catch (err) {
            console.error("Error creating ride:", err);
            
            // Handle the error state in the UI
            // 1. Alert the user
            alert("Failed to create ride. Please try again.");

            // 2. Optionally, reset state to an earlier step 
            // (e.g., close LookingForDriver and show ConfirmRide/VehiclePanel)
            setVehicleFound(false);
            setConfirmRidePanel(true); // Go back to the confirm ride panel

            // NOTE: If the server is sending an actual 500 error, 
            // the root fix must still be on the server-side! 
            // This client-side change prevents the user interface from being stuck.
        }
    }



    return (
        <div className='flex flex-col h-screen w-screen relative overflow-hidden'> 
            
            {/* Logo/Header (Fixed at top for visibility) */}
            <img className='w-16 absolute right-5 top-5 z-20' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
            
            {/* 1. MAP CONTAINER (TOP 70% of screen height) */}
            <div className='h-[70%] w-full relative z-10'> 
                <Suspense fallback={<div className='h-full w-full bg-gray-100' /> }>
                    <LiveTracking pickup={pickup} destination={destination} />
                </Suspense>
            </div>

            {/* 2. INPUT/SEARCH PANEL CONTAINER (bottom by default, fixed-top when active) */}
            <div className={`${panelOpen 
                ? 'fixed top-0 left-0 right-0 h-screen z-40 shadow-lg bg-white flex flex-col' // KEY CHANGE: h-screen & flex flex-col
                : 'h-[30%] w-full bg-white relative z-20'}`}>
                
                {/* HEADER/INPUTS SECTION (Fixed Height) */}
                <div className='p-6 flex-shrink-0'> {/* KEY CHANGE: flex-shrink-0 */}
                    <h5 ref={panelCloseRef} onClick={() => {
                        setPanelOpen(false) // Closes panel, triggering return to map
                    }} className='absolute opacity-0 right-6 top-6 text-2xl'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    
                    <form className='relative py-3' onSubmit={(e) => {
                        submitHandler(e)
                    }}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
                        <input
                            onFocus={() => { 
                                setPanelOpen(true)
                                setActiveField('pickup')
                            }}
                            value={pickup}
                            onChange={handlePickupChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full'
                            type="text"
                            placeholder='Add a pick-up location'
                        />
                        <input
                            onFocus={() => { 
                                setPanelOpen(true)
                                setActiveField('destination')
                            }}
                            value={destination}
                            onChange={handleDestinationChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full  mt-3'
                            type="text"
                            placeholder='Enter your destination' />
                    </form>
                    
                    <button
                        onClick={findTrip}
                        className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full'>
                        Find Trip
                    </button>

                    
                </div>
                
                {/* LOCATION SUGGESTIONS PANEL (Takes Remaining Height) */}
                {panelOpen && (
                    <div className='flex-grow overflow-y-auto p-6 pt-0'> {/* KEY CHANGE: flex-grow & overflow-y-auto */}
                        <LocationSearchPanel
                            suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                            setPanelOpen={setPanelOpen}
                            setPickup={setPickup}
                            setDestination={setDestination}
                            activeField={activeField}
                        />
                    </div>
                )}
            </div>
            
            {/* Overlay panels (Vehicle Selection, etc.) remain fixed at the bottom */}


            <div ref={vehiclePanelRef} className='fixed w-full z-40 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <VehiclePanel
                    selectVehicle={setVehicleType}
                    fare={fare} setConfirmRidePanel={setConfirmRidePanel} setVehiclePanel={setVehiclePanel} />
            </div>
            <div ref={confirmRidePanelRef} className='fixed w-full z-40 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <ConfirmRide
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}

                    setConfirmRidePanel={setConfirmRidePanel} setVehicleFound={setVehicleFound} />
            </div>
            <div ref={vehicleFoundRef} className='fixed w-full z-40 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
                <LookingForDriver
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound} />
            </div>
            <div ref={waitingForDriverRef} className='fixed w-full z-40 bottom-0 bg-white px-3 py-6 pt-12'>
                <WaitingForDriver
                    ride={ride}
                    setVehicleFound={setVehicleFound}
                    setWaitingForDriver={setWaitingForDriver}
                    waitingForDriver={waitingForDriver} />
            </div>
        </div>
    )
}

export default Home