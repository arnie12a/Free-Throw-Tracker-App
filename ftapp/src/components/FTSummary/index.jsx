import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"
import { useAuth } from '../contexts/authContext';
import FTChart from '../FTChart';

export default function FTSummary() {
    
    const [FTSessions, setFTSessions] = useState();
    const { currentUser } = useAuth()
    let [freeThrowPercentage, setFreeThrowPercentage] = useState(0);
    const [totalFTMade, setTotalFTMade] = useState(0);
    const [totalFTAttempted, setTotalFTAttempted] = useState(0);
    const ss = require('simple-statistics');
    const [bestSession, setBestSession] = useState([]);
    const [worstSession, setWorstSession] = useState([]);
    const [activeTab, setActiveTab] = useState('all');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        console.log(activeTab)
    };

    const calculateShootingPercentage = (made, attempted) => (made/attempted) * 100;

    const tTest = (sessions) => {
        const practiceSessions = []
        const gameSessions = []
        for (let i = 0; i < sessions.length; i++) {
            const percentage = calculateShootingPercentage(sessions[i].ftMade, sessions[i].ftAttempted);
            if (sessions[i].sessionType === 'practice') {
                practiceSessions.push(percentage);
            }
            else if (sessions[i].sessionType === 'game') {
                gameSessions.push(percentage);
            }
        }

        const tValue = ss.tTestTwoSample(practiceSessions, gameSessions, { variance: 'unequal' });
        const degreesOfFreedom = practiceSessions.length + gameSessions.length - 2;
        const criticalValue = ss.probit(0.975); // 95% confidence interval
        console.log(tValue, degreesOfFreedom, criticalValue);
        return {
            tValue, 
            degreesOfFreedom, 
            criticalValue, 
            isSignificant: Math.abs(tValue) > criticalValue
        }
    }

    const getBestWorstSessions = (sessions, tab) => {
        let bestMade = 0;
        let bestAttempted = 0;
        let bestPercentage = 0;
        let worstMade = 100;
        let worstAttempted = 100;
        let worstPercentage = 100;
        if(tab === 'all'){
            for(let i=0;i<sessions.length;i++) {
                const percentage = calculateShootingPercentage(sessions[i].ftMade, sessions[i].ftAttempted);
                if(bestPercentage < percentage) {
                    bestPercentage = percentage;
                    bestMade = sessions[i].ftMade;
                    bestAttempted = sessions[i].ftAttempted;
                }
                if(worstPercentage > percentage) {
                    worstAttempted = sessions[i].ftAttempted;
                    worstMade = sessions[i].ftMade;
                    worstPercentage = percentage;
                }
            }
        }
        else {
            for(let i=0;i<sessions.length;i++) {
                if(sessions.sessionType === tab) {
                    const percentage = calculateShootingPercentage(sessions[i].ftMade, sessions[i].ftAttempted);
                    if(bestPercentage < percentage) {
                        bestPercentage = percentage;
                        bestMade = sessions[i].ftMade;
                        bestAttempted = sessions[i].ftAttempted;
                    }
                    if(worstPercentage > percentage) {
                        worstAttempted = sessions[i].ftAttempted;
                        worstMade = sessions[i].ftMade;
                        worstPercentage = percentage;
                    }
                }
                
            }
        }
       
        setBestSession([bestMade, bestAttempted, bestPercentage]);
        setWorstSession([worstMade, worstAttempted, worstPercentage]);
        return;
    }

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
        const tempFTSessions = getFTSession();
        setFTSessions(tempFTSessions);

        getFTPercentage(getFTSession(), activeTab).then(result => {
            setFreeThrowPercentage(Math.round(result))
        })

        if(activeTab === 'all'){
            tTest(tempFTSessions);
        }

        getBestWorstSessions(tempFTSessions, activeTab);


        
    }, [activeTab])

    
    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-5xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden" style={{ height: '80vh' }}>
                <div className="text-center border-b border-gray-200">
                    <div className="flex space-x-1 justify-center">
                        <button
                            className={`py-3 px-6 w-1/3 focus:outline-none ${activeTab === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'} rounded-t-lg border border-gray-300 transition ease-in-out duration-150`}
                            onClick={() => handleTabClick('all')}
                        >
                            All Sessions
                        </button>
                        <button
                            className={`py-3 px-6 w-1/3 focus:outline-none ${activeTab === 'practice' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'} rounded-t-lg border border-gray-300 transition ease-in-out duration-150`}
                            onClick={() => handleTabClick('practice')}
                        >
                            Practice
                        </button>
                        <button
                            className={`py-3 px-6 w-1/3 focus:outline-none ${activeTab === 'game' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'} rounded-t-lg border border-gray-300 transition ease-in-out duration-150`}
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
                            {freeThrowPercentage && totalFTAttempted && totalFTMade && worstSession && bestSession ? (
                                <>
                                    <h1 className="text-5xl font-bold text-blue-600">
                                        Free Throw Percentage: {freeThrowPercentage}%
                                    </h1>
                                    <p>
                                    Total Made: {totalFTMade} |||  Total Attempted: {totalFTAttempted}
                                    </p>
                                    <h4>
                                        { worstSession[2] } |||  {bestSession[2]}
                                    </h4>
                                    <FTChart />
                                </>
                                
                                
                            ) : (
                                <p className="text-xl text-gray-600">Not Available</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'practice' && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Practice</h2>
                            {freeThrowPercentage && totalFTAttempted && totalFTMade && worstSession && bestSession ? (
                                <>
                                    <h1 className="text-5xl font-bold text-blue-600">
                                        Free Throw Percentage: {freeThrowPercentage}%
                                    </h1>
                                    <p>
                                    Total Made: {totalFTMade} |||  Total Attempted: {totalFTAttempted}
                                    </p>
                                    <h4>
                                        { worstSession } |||  {bestSession}
                                    </h4>
                                    <FTChart />

                                </>
                                
                                
                            ) : (
                                <p className="text-xl text-gray-600">Not Available</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'game' && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Game</h2>
                            {freeThrowPercentage && totalFTAttempted && totalFTMade && worstSession && bestSession ? (
                                <>
                                    <h1 className="text-5xl font-bold text-blue-600">
                                        Free Throw Percentage: {freeThrowPercentage}%
                                    </h1>
                                    <p>
                                        Total Made: {totalFTMade} |||  Total Attempted: {totalFTAttempted}
                                    </p>
                                    <h4>
                                        { worstSession } |||  {bestSession}
                                    </h4>
                                    <FTChart />

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
