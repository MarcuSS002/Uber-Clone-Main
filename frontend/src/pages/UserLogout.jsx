import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { clearStoredUser } from '../utils/auth-storage'

export const UserLogout = () => {

    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    axios.get(`${import.meta.env.VITE_API_URL}/users/logout`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then((response) => {
        if (response.status === 200) {
            localStorage.removeItem('token')
            clearStoredUser()
            navigate('/login')
        }
    })

    return (
        <div>UserLogout</div>
    )
}

export default UserLogout
