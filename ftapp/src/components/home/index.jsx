import React from 'react'
import { useAuth } from '../contexts/authContext'
import { Link } from 'react-router-dom'

const Home = () => {
    const { currentUser } = useAuth()
    return (
        <>

            <div className="container mx-auto p-6">
            <div className="text-2xl font-bold pt-14">
                Hello {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.
            </div>
            <div className="mt-6 flex space-x-4">
                <Link 
                to="/addFTSession" 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                >
                Add FT Session
                </Link>
                <Link 
                to="/FTSummary" 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
                >
                FT Summary
                </Link>
            </div>
            </div>

        </>
        
    )
}

export default Home