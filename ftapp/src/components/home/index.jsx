import React from 'react'
import { useAuth } from '../contexts/authContext'
import { Link } from 'react-router-dom'

const Home = () => {
    const { currentUser } = useAuth()
    console.log(currentUser)
    return (
        <>

            <div className="container mx-auto p-6">
            <div className="text-2xl font-bold pt-14">
                Welcome {currentUser.displayName ? currentUser.displayName : currentUser.email}!
            </div>
            <img 
                src="https://www.carlswebgraphics.com/basketball-graphics/free-throw-animation-2018.gif" 
                alt="man shooting a free throw"  
                width="400"
            />

            
            </div>

        </>
        
    )
}

export default Home