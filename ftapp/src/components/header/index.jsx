import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { doSignOut } from '../firebase/auth';

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700 fixed w-full shadow-lg">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="https://media.tenor.com/NlIpPfwJ3qgAAAAi/miss-airball.gif"
            className="w-16 h-16"
            alt="Flowbite Logo"
          />
          <Link
            to={userLoggedIn ? '/home' : '/'}
            className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white"
          >
            {userLoggedIn ? 'Home' : 'Free Throw Tracker'}
          </Link>
        </div>

        <button
          onClick={toggleMobileMenu}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 transition-all"
          aria-controls="navbar-dropdown"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-6 h-6"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        <div
          className={`${
            isMobileMenuOpen ? 'block' : 'hidden'
          } w-full md:block md:w-auto transition-all duration-300 ease-in-out`}
          id="navbar-dropdown"
        >
          <ul className="flex flex-col font-medium p-4 mt-4 border border-gray-200 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-transparent dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700 space-y-4 md:space-y-0 md:space-x-4">
            {userLoggedIn ? (
              <>
                <li>
                  <Link
                    to="/addFTSession"
                    className="text-lg font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-400"
                  >
                    Add
                  </Link>
                </li>
                <li>
                  <Link
                    to="/FTLog"
                    className="text-lg font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-400"
                  >
                    Log
                  </Link>
                </li>
                <li>
                  <Link
                    to="/leaderboard"
                    className="text-lg font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-400"
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/FTSummary"
                    className="text-lg font-medium text-gray-900 hover:text-gray-700 dark:text-white dark:hover:text-gray-400"
                  >
                    Statistics
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => {
                      doSignOut().then(() => {
                        navigate('/login');
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition duration-150 ease-in-out"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <ul className="flex items-center space-x-4">
                  <li>
                    <Link
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-150 ease-in-out"
                      to="/login"
                    >
                      Log In
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 transition duration-150 ease-in-out"
                      to="/register"
                    >
                      Register
                    </Link>
                  </li>
                </ul>

              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
