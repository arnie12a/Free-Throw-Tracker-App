import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';

import { db } from '../firebase/firebase';

import { collection, addDoc } from "firebase/firestore";

export default function AddFTSession() {
    const [date, setDate] = useState('');
    const [ftMade, setFTMade] = useState(0);
    const [ftAttempted, setFTAttempted] = useState(0);
    const [sessionType, setSessionType] = useState('');

    const { currentUser } = useAuth()
    const navigate = useNavigate();


    const handleRadioChange = (e) => {
        setSessionType(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Here you can handle the form submission
        const FTData = {
            ftMade, 
            ftAttempted,
            date,
            sessionType
        };

        if(ftMade > ftAttempted) {
            console.log('impossible try again')
            return
        }
        
        try {
            await addDoc(collection(db, 'ftsessions'), {
                ftMade: ftMade,
                ftAttempted: ftAttempted,
                date: date,
                sessionType: sessionType,
                uid: currentUser.uid
            });
            navigate('/FTSummary')

            
        } catch (error) {
            console.log(error)
        }
        

    };

    return (
        <div className="bg-gray-100 flex justify-center items-center min-h-screen">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Add Free Throw Session Data</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date:</label>
                        <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="ftMade" className="block text-sm font-medium text-gray-700">Free Throws Made:</label>
                        <input type="number" id="ftMade" value={ftMade} onChange={(e) => setFTMade(parseInt(e.target.value))} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="ftAttempted" className="block text-sm font-medium text-gray-700">Free Throws Attempted:</label>
                        <input type="number" id="ftAttempted" value={ftAttempted} onChange={(e) => setFTAttempted(parseInt(e.target.value))} required className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>

                    <div className="mt-4">
                        <span className="block text-sm font-medium text-gray-700">Session Type:</span>
                        <div className="mt-1">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="sessionType"
                                    value="game"
                                    checked={sessionType === 'game'}
                                    onChange={handleRadioChange}
                                    className="form-radio text-indigo-600"
                                />
                                <span className="ml-2">Game</span>
                            </label>
                            <label className="inline-flex items-center ml-6">
                                <input
                                    type="radio"
                                    name="sessionType"
                                    value="practice"
                                    checked={sessionType === 'practice'}
                                    onChange={handleRadioChange}
                                    className="form-radio text-indigo-600"
                                />
                                <span className="ml-2">Practice</span>
                            </label>
                        </div>
                    </div>

                    <div className="text-center">
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Submit</button>
                    </div>

                    
                </form>
            </div>
        </div>
    );
}
