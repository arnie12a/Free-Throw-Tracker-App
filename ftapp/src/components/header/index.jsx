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
                <Link to="/home" className="text-lg font-semibold text-gray-700 hover:text-gray-900">Home</Link>
                
            </div>
            <div className="flex items-center space-x-4">
                {userLoggedIn ? (
                    <>
                        <Link to="/addFTSession" className="text-lg font-semibold text-gray-700 hover:text-gray-900">Add</Link>
                        <Link to="/FTLog" className="text-lg font-semibold text-gray-700 hover:text-gray-900">Log</Link>
                        <Link to="/leaderboard" className="text-lg font-semibold text-gray-700 hover:text-gray-900">Leaderboard</Link>

                        <Link to="/FTSummary" className="text-lg font-semibold text-gray-700 hover:text-gray-900">Statistics</Link>

                        <button
                            onClick={() => {
                                doSignOut().then(() => {
                                    navigate('/login');
                                });
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ease-in-out duration-150"
                        >
                            Logout
                        </button>

                    </>
                    
                ) : (
                    <>
                        <Link
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                            to="/login"
                            >
                            Login
                        </Link>
                        <Link
                            className="px-4 py-2 ml-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
                            to="/register"
                            >
                            Register
                        </Link>

                    </>
                )}
            </div>
        </nav>
    )
}

export default Header