/* eslint-disable react/prop-types */
import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

/**
 * 1. Create and export the Context object.
 * It's good practice to provide a default value for the context,
 * especially for autocompletion in IDEs, though it's not strictly
 * required for the provider to work.
 */
export const UserDataContext = createContext(null) // Using null as a default

/**
 * 2. Define the Provider Component.
 * It manages the state and provides it to all children.
 */
const UserContext = ({ children }) => {

    const [user, setUser] = useState(null)

    // Try to restore user profile from token on mount
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        (async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (res?.data?.user) setUser(res.data.user)
            } catch (err) {
                console.warn('UserContext: failed to restore user', err?.response?.status)
                // remove stale token on 401
                if (err?.response?.status === 401) localStorage.removeItem('token')
            }
        })()
    }, [])

    // Create the value object once, or define it inside the return.
    // The key here is to pass the state (user) and the setter function (setUser).
    const contextValue = { user, setUser }

    return (
        // 3. Remove the redundant <div> and wrap children directly.
        <UserDataContext.Provider value={contextValue}>
            {children}
        </UserDataContext.Provider>
    )
}

/**
 * 4. Export the Provider Component.
 */
export default UserContext