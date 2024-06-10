import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"
import { useAuth } from '../contexts/authContext';

export default function FTSummary() {
    
    const [FTSessions, setFTSessions] = useState();
    const { currentUser } = useAuth()
    let [freeThrowPercentage, setFreeThrowPercentage] = useState(0);


    const [activeTab, setActiveTab] = useState('Tab1');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const getFTSession = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "ftsessions"), where("uid", "==", specificUID));

        const querySnapshot = await getDocs(q);

        const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        //const querySnapshot = await getDocs(collection(db, "ftsessions"));
        //const sessions = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data()}))
        return sessions
    }

    const getFTPercentage = async (sessions, sessionType) => {
        let totalAttempted = 0;
        let totalMade = 0;
        const result = await sessions;
        
        result.forEach(item => {
            totalAttempted += item['ftAttempted'];
            totalMade += item['ftMade'];
        })
        return((totalMade/totalAttempted)*100)
    }
    
    

    useEffect(() => {
        setFTSessions(getFTSession());

        getFTPercentage(getFTSession(), activeTab).then(result => {
            setFreeThrowPercentage(Math.round(result))
        })


        
    }, [activeTab])

    
    return (
        
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="text-center border-b border-gray-200">
                <div className="flex space-x-1 justify-center">
                    <button
                        className={`py-2 px-4 w-1/3 focus:outline-none ${activeTab === 'Tab1' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'} rounded-t-lg`}
                        onClick={() => handleTabClick('Tab1')}
                    >
                        All Sessions
                    </button>
                    <button
                        className={`py-2 px-4 w-1/3 focus:outline-none ${activeTab === 'Tab2' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'} rounded-t-lg`}
                        onClick={() => handleTabClick('Tab2')}
                    >
                        Practice
                    </button>
                    <button
                        className={`py-2 px-4 w-1/3 focus:outline-none ${activeTab === 'Tab3' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'} rounded-t-lg`}
                        onClick={() => handleTabClick('Tab3')}
                    >
                        Game
                    </button>
                </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-b-lg">
                {activeTab === 'Tab1' && (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">All</h2>
                        {freeThrowPercentage ? (
                            <h1 className="text-4xl font-bold text-blue-600">
                                Free Throw Percentage: {freeThrowPercentage}%
                            </h1>
                        ) : (
                            <p className="text-lg text-gray-600">Not Available</p>
                        )}
                    </div>
                )}
                {activeTab === 'Tab2' && (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Practice</h2>
                        {freeThrowPercentage ? (
                            <h1 className="text-4xl font-bold text-blue-600">
                                Free Throw Percentage: {freeThrowPercentage}%
                            </h1>
                        ) : (
                            <p className="text-lg text-gray-600">Not Available</p>
                        )}
                    </div>
                )}
                {activeTab === 'Tab3' && (
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Game</h2>
                        {freeThrowPercentage ? (
                            <h1 className="text-4xl font-bold text-blue-600">
                                Free Throw Percentage: {freeThrowPercentage}%
                            </h1>
                        ) : (
                            <p className="text-lg text-gray-600">Not Available</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
    


    );
}
