import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"
import { useAuth } from '../contexts/authContext';

export default function FTSummary() {
    
    const [FTSessions, setFTSessions] = useState();
    const { currentUser } = useAuth()
    let [freeThrowPercentage, setFreeThrowPercentage] = useState(0);
    const [totalFTMade, setTotalFTMade] = useState(0);
    const [totalFTAttempted, setTotalFTAttempted] = useState(0);


    const [activeTab, setActiveTab] = useState('all');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        console.log(activeTab)
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
        let result = await sessions;

        if(sessionType === 'practice' || sessionType === 'game'){
            result = result.filter(element => element.sessionType === sessionType);
        }
        
        result.forEach(item => {
            totalAttempted += item['ftAttempted'];
            totalMade += item['ftMade'];
        })

        setTotalFTMade(totalMade);
        setTotalFTAttempted(totalAttempted);
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
            <div className="w-full max-w-5xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden" style={{ height: '80vh' }}>
                <div className="text-center border-b border-gray-200">
                    <div className="flex space-x-1 justify-center">
                        <button
                            className={`py-3 px-6 w-1/3 focus:outline-none ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'} rounded-t-lg`}
                            onClick={() => handleTabClick('all')}
                        >
                            All Sessions
                        </button>
                        <button
                            className={`py-3 px-6 w-1/3 focus:outline-none ${activeTab === 'practice' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'} rounded-t-lg`}
                            onClick={() => handleTabClick('practice')}
                        >
                            Practice
                        </button>
                        <button
                            className={`py-3 px-6 w-1/3 focus:outline-none ${activeTab === 'game' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'} rounded-t-lg`}
                            onClick={() => handleTabClick('game')}
                        >
                            Game
                        </button>
                    </div>
                </div>
                <div className="p-10 bg-gray-50 rounded-b-lg h-full overflow-y-auto">
                    {activeTab === 'all' && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">All</h2>
                            {freeThrowPercentage && totalFTAttempted && totalFTMade ? (
                                <>
                                    <h1 className="text-5xl font-bold text-blue-600">
                                        Free Throw Percentage: {freeThrowPercentage}%
                                    </h1>
                                    <p>
                                        {totalFTMade} / {totalFTAttempted}
                                    </p>
                                </>
                                
                                
                            ) : (
                                <p className="text-xl text-gray-600">Not Available</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'practice' && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Practice</h2>
                            {freeThrowPercentage && totalFTAttempted && totalFTMade ? (
                                <>
                                    <h1 className="text-5xl font-bold text-blue-600">
                                        Free Throw Percentage: {freeThrowPercentage}%
                                    </h1>
                                    <p>
                                        {totalFTMade} / {totalFTAttempted}
                                    </p>
                                </>
                                
                                
                            ) : (
                                <p className="text-xl text-gray-600">Not Available</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'game' && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Game</h2>
                            {freeThrowPercentage && totalFTAttempted && totalFTMade ? (
                                <>
                                    <h1 className="text-5xl font-bold text-blue-600">
                                        Free Throw Percentage: {freeThrowPercentage}%
                                    </h1>
                                    <p>
                                        {totalFTMade} / {totalFTAttempted}
                                    </p>
                                </>
                                
                                
                            ) : (
                                <p className="text-xl text-gray-600">Not Available</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
    </div>


    


    );
}
