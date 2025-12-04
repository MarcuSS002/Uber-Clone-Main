import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { apiBaseUrl } from '../utils/api-config'

const ConfirmRidePopUp = (props) => {
    const [ otp, setOtp ] = useState('')
    const navigate = useNavigate()

    const [ isStarting, setIsStarting ] = useState(false)

    const submitHander = async (e) => {
        e.preventDefault()
        if (isStarting) return
        setIsStarting(true)

        const token = localStorage.getItem('captain-token')
        if (!token) {
            alert('You must be logged in as a captain to start a ride')
            setIsStarting(false)
            return
        }

        try {
            const response = await axios.get(`${apiBaseUrl}/rides/start-ride`, {
                params: {
                    rideId: props.ride._id,
                    otp: otp
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.status === 200) {
                props.setConfirmRidePopupPanel(false)
                props.setRidePopupPanel(false)
                // Navigate the captain to their riding page
                navigate('/captain-riding', { state: { ride: response.data } })
            }
        } catch (err) {
            console.error('Error starting ride:', err)
            alert(err.response?.data?.message || 'Failed to start ride. Check OTP and try again.')
        } finally {
            setIsStarting(false)
        }
    }
    const rootRef = useRef(null)

    useEffect(() => {
        const el = rootRef.current
        if (!el) return
        // animate in
        gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 0.4, ease: 'power2.out' })
        return () => {
            // animate out (optional)
            try {
                gsap.to(el, { yPercent: 100, duration: 0.3, ease: 'power2.in' })
            } catch {
                // ignore if unmounted
            }
        }
    }, [])

    return (
        <div ref={rootRef} className='fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                props.setRidePopupPanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Confirm this ride to Start</h3>
            <div className='flex items-center justify-between p-3 border-2 border-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                    <img className='h-12 rounded-full object-cover w-12' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="" />
                    <h2 className='text-lg font-medium capitalize'>{props.ride?.user.fullname.firstname}</h2>
                </div>
                <h5 className='text-lg font-semibold'>2.2 KM</h5>
            </div>
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.ride?.pickup}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.ride?.pickup}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>{props.ride?.destination}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{props.ride?.destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{props.ride?.fare} </h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
                        </div>
                    </div>
                </div>

                <div className='mt-6 w-full'>
                    <form onSubmit={submitHander}>
                        <input value={otp} onChange={(e) => setOtp(e.target.value)} type="text" className='bg-[#eee] px-6 py-4 font-mono text-lg rounded-lg w-full mt-3' placeholder='Enter OTP' />

                        <button className='w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg'>Confirm</button>
                        <button onClick={() => {
                            props.setConfirmRidePopupPanel(false)
                            props.setRidePopupPanel(false)

                        }} className='w-full mt-2 bg-red-600 text-lg text-white font-semibold p-3 rounded-lg'>Cancel</button>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default ConfirmRidePopUp

ConfirmRidePopUp.propTypes = {
    ride: PropTypes.object.isRequired,
    setConfirmRidePopupPanel: PropTypes.func.isRequired,
    setRidePopupPanel: PropTypes.func.isRequired
}