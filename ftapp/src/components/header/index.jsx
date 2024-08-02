import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import { doSignOut } from '../firebase/auth'

const Header = () => {
    const navigate = useNavigate()
    const { userLoggedIn } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        
        

        <nav className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 fixed w-full">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                {userLoggedIn ? (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="https://media.tenor.com/NlIpPfwJ3qgAAAAi/miss-airball.gif" className="w-16 h-16" alt="Flowbite Logo" />
                        <Link to="/home" className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Home</Link>

                    </div>
                ) : (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <img src="https://media.tenor.com/NlIpPfwJ3qgAAAAi/miss-airball.gif" className="w-16 h-16" alt="Flowbite Logo" />
                        <Link to="/" className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                            Free Throw Percentage Tracker
                        </Link>
                    </div>
                
                )}
                
                <button
                    onClick={toggleMobileMenu}
                    type="button"
                    className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    aria-controls="navbar-dropdown"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span className="sr-only">Open main menu</span>
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
                    </svg>
                </button>
                <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="navbar-dropdown">
                    <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            
                    {userLoggedIn ? (
                <>
                <li>
                <Link to="/addFTSession" className="text-lg font-semibold text-white hover:text-gray-200">Add</Link>

                </li>
                <li>
                <Link to="/FTLog" className="text-lg font-semibold text-white hover:text-gray-200">Log</Link>

                </li>
                <li>
                <Link to="/leaderboard" className="text-lg font-semibold text-white hover:text-gray-200">Leaderboard</Link>

                </li>
                <li>
                <Link to="/FTSummary" className="text-lg font-semibold text-white hover:text-gray-200">Statistics</Link>

                </li>
                    <button
                    onClick={() => {
                        doSignOut().then(() => {
                        navigate('/login');
                        });
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    >
                    Logout
                    </button>
                </>
                ) : (
                <>
                <li>
                <Link
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    to="/login"
                    >
                    Login
                    </Link>
                </li>
                <li>
                <Link
                    className="px-4 py-2 ml-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-150 ease-in-out"
                    to="/register"
                    >
                    Register
                    </Link>
                </li>
                    
                </>
                )}
                    </ul>
                </div>
            </div>
        </nav>

    )
}

export default Header