import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { CaptainDataContext } from '../context/CapatainContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CaptainProtectWrapper = ({
    children
}) => {

    const navigate = useNavigate()
    const { captain, setCaptain } = useContext(CaptainDataContext)
    const [ isLoading, setIsLoading ] = useState(true)




    useEffect(() => {
        // Prefer captain-token, but fall back to generic token if present (helps when tokens were stored under 'token')
        const rawToken = localStorage.getItem('captain-token') || localStorage.getItem('token')

        if (!rawToken) {
            navigate('/captain-login')
            return
        }

        const mask = (t) => t ? `${t.slice(0,6)}...${t.slice(-6)}` : null
        console.log('CaptainProtectWrapper: using token', mask(rawToken))

        axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
            headers: {
                Authorization: `Bearer ${rawToken}`
            }
        }).then(response => {
            if (response.status === 200) {
                setCaptain(response.data.captain)
                setIsLoading(false)
            }
        })
            .catch((err) => {
                console.warn('CaptainProtectWrapper: profile fetch failed', err.response?.status, err.response?.data)
                // Clear the captain-specific token on auth failure
                localStorage.removeItem('captain-token')
                navigate('/captain-login')
            })
    }, [ navigate, setCaptain ])

    

    if (isLoading) {
        return (
            <div>Loading...</div>
        )
    }



    return (
        <>
            {children}
        </>
    )
}

export default CaptainProtectWrapper

CaptainProtectWrapper.propTypes = {
    children: PropTypes.node
}