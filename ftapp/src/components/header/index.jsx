import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import { doSignOut } from '../firebase/auth'

const Header = () => {
    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()
    return (
        <nav className="flex justify-between items-center w-full z-20 fixed top-0 left-0 h-16 border-b bg-gray-200 px-4 shadow-md">
            <div className="flex items-center space-x-4">
                <Link to="/" className="text-lg font-semibold text-gray-700 hover:text-gray-900">Home</Link>
                
            </div>
            <div className="flex items-center space-x-4">
                {userLoggedIn ? (
                    <>
                        <Link to="/addFTSession" className="text-lg font-semibold text-gray-700 hover:text-gray-900">Add FT Session</Link>
                        <Link to="/FTSummary" className="text-lg font-semibold text-gray-700 hover:text-gray-900">Free Throw Summary</Link>
                        <button
                            onClick={() => {
                                doSignOut().then(() => {
                                    navigate('/login');
                                });
                            }}
                            className="text-sm text-blue-600 hover:underline focus:outline-none"
                        >
                            Logout
                        </button>
                    </>
                    
                ) : (
                    <>
                        <Link className="text-sm text-blue-600 hover:underline" to="/login">Login</Link>
                        <Link className="text-sm text-blue-600 hover:underline" to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Header