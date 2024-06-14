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
    const [bestMade, setBestMade] = useState(0);
    const [bestAttempted, setBestAttempted] = useState(0);
    const [bestPercentage, setBestPercentage] = useState(0);
    const [worstMade, setWorstMade] = useState(0);
    const [worstAttempted, setWorstAttempted] = useState(0);
    const [worstPercentage, setWorstPercentage] = useState(0);

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

    const getBestWorstSessions = async (result, tab) => {
        const sessions = await result;
        let bestMade = -12;
        let bestAttempted = -12;
        let bestPercentage = -12;
        let worstMade = 112;
        let worstAttempted = 112;
        let worstPercentage = 112;
        if(tab === 'all'){
            console.log("We are in the all")
            for(let i=0;i<sessions.length;i++) {
                const percentage = (parseInt(sessions[i].ftMade) / parseInt(sessions[i].ftAttempted)) * 100;
                if(parseInt(bestPercentage) < parseInt(percentage)) {
                    bestPercentage = percentage;
                    bestMade = sessions[i].ftMade;
                    bestAttempted = sessions[i].ftAttempted;
                }
                if(parseInt(worstPercentage) > parseInt(percentage)) {
                    worstAttempted = sessions[i].ftAttempted;
                    worstMade = sessions[i].ftMade;
                    worstPercentage = percentage;
                }
                    
            }
        }
        else {
            for(let i=0;i<sessions.length;i++) {
                if(sessions[i].sessionType === tab) {
                    
                    const percentage = calculateShootingPercentage(sessions[i].ftMade, sessions[i].ftAttempted);
                    if(parseInt(bestPercentage) < parseInt(percentage)) {
                        bestPercentage = percentage;
                        bestMade = sessions[i].ftMade;
                        bestAttempted = sessions[i].ftAttempted;
                    }
                    if(parseInt(worstPercentage) > parseInt(percentage)) {
                        worstAttempted = sessions[i].ftAttempted;
                        worstMade = sessions[i].ftMade;
                        worstPercentage = percentage;
                    }
                    
                }
                
            }
        }
        setBestMade(Math.round(bestMade));
        setBestAttempted(Math.round(bestAttempted));
        setBestPercentage(Math.round(bestPercentage));
        setWorstMade(Math.round(worstMade));
        setWorstAttempted(Math.round(worstAttempted));
        setWorstPercentage(Math.round(worstPercentage));

        return ([bestMade, bestAttempted, bestPercentage, worstMade, worstAttempted, worstPercentage]);
    }

    const getFTSession = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "ftsessions"), where("uid", "==", specificUID));

        const querySnapshot = await getDocs(q);

        const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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
        <div className="bg-gray-100  flex items-center justify-center p-4">
            <div className="w-full max-w-5xl mx-auto bg-white shadow-2xl rounded-lgn" style={{ height: '80vh' }}>
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

                <div className="p-10 bg-gray-50 rounded-b-lg h-full">
                    {activeTab === 'all' && (
                        <div className="space-y-6">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">All Sessions</h2>
                        {freeThrowPercentage && totalFTAttempted && totalFTMade && worstPercentage && bestPercentage && worstMade && worstAttempted && bestMade && bestAttempted ? (
                            <div className="space-y-6">
                            <h1 className="text-5xl font-bold text-blue-600">
                                Free Throw Percentage: {freeThrowPercentage}%
                            </h1>
                            <p className="text-lg">
                                <span className="font-semibold">Total Made:</span> {totalFTMade} <span className="mx-3">|||</span> <span className="font-semibold">Total Attempted:</span> {totalFTAttempted}
                            </p>
                            <div className="text-lg">
                                <h4 className="font-semibold">
                                Worst Session: <span className="text-red-600">{worstPercentage}%</span>
                                </h4>
                                <p>
                                <span className="font-semibold">Made:</span> {worstMade} <span className="mx-3">|||</span> <span className="font-semibold">Attempts:</span> {worstAttempted}
                                </p>
                            </div>
                            <div className="text-lg">
                                <h4 className="font-semibold">
                                Best Session: <span className="text-green-600">{bestPercentage}%</span>
                                </h4>
                                <p>
                                <span className="font-semibold">Made:</span> {bestMade} <span className="mx-3">|||</span> <span className="font-semibold">Attempts:</span> {bestAttempted}
                                </p>
                            </div>
                            <FTChart />
                            </div>
                        ) : (
                            <p className="text-xl text-gray-600">Not Available</p>
                        )}
                        </div>
                    )}
                    {activeTab === 'practice' && (
                        <div className="space-y-6">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">Practice Sessions</h2>
                        {freeThrowPercentage && totalFTAttempted && totalFTMade && worstPercentage && bestPercentage && worstMade && worstAttempted && bestMade && bestAttempted ? (
                            <div className="space-y-6">
                            <h1 className="text-5xl font-bold text-blue-600">
                                Free Throw Percentage: {freeThrowPercentage}%
                            </h1>
                            <p className="text-lg">
                                <span className="font-semibold">Total Made:</span> {totalFTMade} <span className="mx-3">|||</span> <span className="font-semibold">Total Attempted:</span> {totalFTAttempted}
                            </p>
                            <div className="text-lg">
                                <h4 className="font-semibold">
                                Worst Session: <span className="text-red-600">{worstPercentage}%</span>
                                </h4>
                                <p>
                                <span className="font-semibold">Made:</span> {worstMade} <span className="mx-3">|||</span> <span className="font-semibold">Attempts:</span> {worstAttempted}
                                </p>
                            </div>
                            <div className="text-lg">
                                <h4 className="font-semibold">
                                Best Session: <span className="text-green-600">{bestPercentage}%</span>
                                </h4>
                                <p>
                                <span className="font-semibold">Made:</span> {bestMade} <span className="mx-3">|||</span> <span className="font-semibold">Attempts:</span> {bestAttempted}
                                </p>
                            </div>
                            <FTChart />
                            </div>
                        ) : (
                            <p className="text-xl text-gray-600">Not Available</p>
                        )}
                        </div>
                    )}
                    {activeTab === 'game' && (
                        <div className="space-y-6">
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">Game Sessions</h2>
                        {freeThrowPercentage && totalFTAttempted && totalFTMade && worstPercentage && bestPercentage && worstMade && worstAttempted && bestMade && bestAttempted ? (
                            <div className="space-y-6">
                            <h1 className="text-5xl font-bold text-blue-600">
                                Free Throw Percentage: {freeThrowPercentage}%
                            </h1>
                            <p className="text-lg">
                                <span className="font-semibold">Total Made:</span> {totalFTMade} <span className="mx-3">|||</span> <span className="font-semibold">Total Attempted:</span> {totalFTAttempted}
                            </p>
                            <div className="text-lg">
                                <h4 className="font-semibold">
                                Worst Session: <span className="text-red-600">{worstPercentage}%</span>
                                </h4>
                                <p>
                                <span className="font-semibold">Made:</span> {worstMade} <span className="mx-3">|||</span> <span className="font-semibold">Attempts:</span> {worstAttempted}
                                </p>
                            </div>
                            <div className="text-lg">
                                <h4 className="font-semibold">
                                Best Session: <span className="text-green-600">{bestPercentage}%</span>
                                </h4>
                                <p>
                                <span className="font-semibold">Made:</span> {bestMade} <span className="mx-3">|||</span> <span className="font-semibold">Attempts:</span> {bestAttempted}
                                </p>
                            </div>
                            <FTChart />
                            </div>
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
