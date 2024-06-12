import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/authContext'
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"

const Home = () => {
    const { currentUser } = useAuth()
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [fullName, setFullName] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [height, setHeight] = useState('');
    const [position, setPosition] = useState('');
    const [goal, setGoal] = useState('');
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        getUserInfo();
    }, [])

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setFormVisible(false);
    };
    

    const getUserInfo = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "users"), where("uid", "==", specificUID));

        const querySnapshot = await getDocs(q);

        const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        //const querySnapshot = await getDocs(collection(db, "ftsessions"));
        //const sessions = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data()}))
        setFullName(userData[0].firstName + " " + userData[0].lastName);
        return 
    }

    return (
        <>

<div className="container mx-auto p-6">
            <div className="text-2xl font-bold pt-14">
                Welcome {currentUser.displayName ? currentUser.displayName : currentUser.email}!
            </div>
            { fullName ? (
                <>
                    <h1>{fullName}</h1>
                </>
            ) : (
                <h1>Nada</h1>
            )}
            <img 
                src="https://www.carlswebgraphics.com/basketball-graphics/free-throw-animation-2018.gif" 
                alt="man shooting a free throw"  
                width="400"
            />

            <button 
                onClick={() => setFormVisible(true)} 
                className="bg-blue-500 text-white px-4 py-2 mt-4"
            >
                Add Your Info
            </button>

            {formVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Add Your Info</h2>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700">Height:</label>
                                <input 
                                    type="text" 
                                    value={height} 
                                    onChange={(e) => setHeight(e.target.value)} 
                                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Position:</label>
                                <input 
                                    type="text" 
                                    value={position} 
                                    onChange={(e) => setPosition(e.target.value)} 
                                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Goal for Free Throw Percentage:</label>
                                <input 
                                    type="text" 
                                    value={goal} 
                                    onChange={(e) => setGoal(e.target.value)} 
                                    className="mt-1 p-2 w-full border border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setFormVisible(false)} 
                                    className="bg-gray-500 text-white px-4 py-2 mr-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-green-500 text-white px-4 py-2 rounded"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {submitted && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Your Information</h2>
                    <p><strong>Height:</strong> {height}</p>
                    <p><strong>Position:</strong> {position}</p>
                    <p><strong>Goal for Free Throw Percentage:</strong> {goal}%</p>
                </div>
            )}
        </div>
        </>
        
    )
}

export default Home