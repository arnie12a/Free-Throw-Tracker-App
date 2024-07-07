import React, { useEffect, useState } from 'react';
import { collection, setDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { useAuth } from '../contexts/authContext';
import FTChart from '../FTChart';
import Last5LineChart from '../Last5LineChart';
import { active } from 'd3';

export default function FTSummary() {
    const [FTSessions, setFTSessions] = useState([]);
    const { currentUser } = useAuth();
    const [freeThrowPercentage, setFreeThrowPercentage] = useState(0);
    const [totalFTMade, setTotalFTMade] = useState(0);
    const [totalFTAttempted, setTotalFTAttempted] = useState(0);
    const [bestMade, setBestMade] = useState(0);
    const [bestAttempted, setBestAttempted] = useState(0);
    const [bestPercentage, setBestPercentage] = useState(0);
    const [worstMade, setWorstMade] = useState(0);
    const [worstAttempted, setWorstAttempted] = useState(0);
    const [worstPercentage, setWorstPercentage] = useState(0);
    const [activeTab, setActiveTab] = useState('12');
    //const [userData, setUserData] = useState(null);
    const [last5SessionsPercentage, setLast5SessionPercentage] = useState(0);
    const [totalSessions, setTotalSessions] = useState('');
    const [difference, setDifference] = useState(0);
    const [Last5Modal, setLast5Modal] = useState(false);
    const [tTestModal, settTestModal] = useState(false);
    const [last5Sessions, setLast5Sessions] = useState([]);
    const [tValue, setTValue] = useState(0);
    const [isSignificant, setIsSignificant] = useState(false);
    const [degreesOfFreedom, setDegreesOfFreedom] = useState(0);
    const [criticalValue, setCriticalValue] = useState(0);

    const ss = require('simple-statistics');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const calculateShootingPercentage = (made, attempted) => (made / attempted) * 100;

    const calculateTValue = (practiceSessions, gameSessions) => {
        // Calculate means
        const mean1 = practiceSessions.reduce((sum, value) => sum + value, 0) / practiceSessions.length;
        const mean2 = gameSessions.reduce((sum, value) => sum + value, 0) / gameSessions.length;
    
        // Calculate variances
        const variance1 = practiceSessions.reduce((sum, value) => sum + Math.pow(value - mean1, 2), 0) / (practiceSessions.length - 1);
        const variance2 = gameSessions.reduce((sum, value) => sum + Math.pow(value - mean2, 2), 0) / (gameSessions.length - 1);
    
        // Calculate pooled variance
        const pooledVariance = Math.sqrt((variance1 / practiceSessions.length) + (variance2 / gameSessions.length));
    
        // Calculate t-value
        const tValue = (mean1 - mean2) / pooledVariance;
    
        return tValue;
    };

    const tTest = (sessions) => {
        settTestModal(true)
        const practiceSessions = [];
        const gameSessions = [];
        for (let i = 0; i < sessions.length; i++) {
            const percentage = calculateShootingPercentage(sessions[i].ftMade, sessions[i].ftAttempted);
            if (sessions[i].sessionType === 'practice') {
                practiceSessions.push(percentage);
            } else if (sessions[i].sessionType === 'game') {
                gameSessions.push(percentage);
            }
        }
        
        const tValue = calculateTValue(practiceSessions, gameSessions)
        const degreesOfFreedom = practiceSessions.length + gameSessions.length - 2;
        const criticalValue = ss.probit(0.975); // 95% confidence interval
        setTValue(tValue);
        setDegreesOfFreedom(degreesOfFreedom);
        setCriticalValue(criticalValue);
        setIsSignificant(Math.abs(tValue) > criticalValue);
        return {
            tValue,
            degreesOfFreedom,
            criticalValue,
            isSignificant: Math.abs(tValue) > criticalValue
        };
    };

    const getBestWorstSessions = (sessions, tab) => {
        let bestMade = -1;
        let bestAttempted = -1;
        let bestPercentage = -1;
        let worstMade = 101;
        let worstAttempted = 101;
        let worstPercentage = 101;

        sessions.forEach(session => {
            const percentage = calculateShootingPercentage(session.ftMade, session.ftAttempted);
            if (tab === 'all' || session.sessionType === tab) {
                if (percentage > bestPercentage) {
                    bestPercentage = percentage;
                    bestMade = session.ftMade;
                    bestAttempted = session.ftAttempted;
                }
                if (percentage < worstPercentage) {
                    worstPercentage = percentage;
                    worstMade = session.ftMade;
                    worstAttempted = session.ftAttempted;
                }
            }
        });

        setBestMade(Math.round(bestMade));
        setBestAttempted(Math.round(bestAttempted));
        setBestPercentage(Math.round(bestPercentage));
        setWorstMade(Math.round(worstMade));
        setWorstAttempted(Math.round(worstAttempted));
        setWorstPercentage(Math.round(worstPercentage));
    };

    const getFTSession = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "ftsessions"), where("uid", "==", specificUID));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const getCurrentUser = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, 'users'), where('uid', '==', specificUID));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    const getFTPercentage = async (sessions, sessionType='all') => {
        let totalAttempted = 0;
        let totalMade = 0;
        let result = sessions;

        if (sessionType === 'practice' || sessionType === 'game') {
            result = result.filter(element => element.sessionType === sessionType);
        }

        result.forEach(item => {
            totalAttempted += item['ftAttempted'];
            totalMade += item['ftMade'];
        });

        setTotalFTMade(totalMade);
        setTotalFTAttempted(totalAttempted);
        return (totalMade / totalAttempted) * 100;
    };

    const getLast5Sessions = (arr, tab) => {

        let result = arr;

        if (tab === 'practice' || tab === 'game') {
            result = result.filter(element => element.sessionType === tab);
        }

        if(result.length >= 5) {
            return result.slice(1).slice(-5);
        }
        return result;
    }

    const setUserShootingPercentage = async (user, percentage) => {
        await setDoc(doc(db, 'users', currentUser.uid), {
            firstName: user[0].firstName,
            lastName: user[0].lastName,
            email: user[0].email,
            uid: user[0].uid,
            ftGoalPercentage: user[0].ftGoalPercentage,
            position: user[0].position,
            ftPercentage: percentage
        });
    }

    useEffect(() => {
        const fetchDataLoad = async () => {
            const sessions = await getFTSession();
            const user = await getCurrentUser();
            setFTSessions(sessions);
            const percentage = await getFTPercentage(sessions)
            setUserShootingPercentage(user, percentage.toFixed(2))
            if(percentage && user){
                setDifference((percentage - user[0].ftGoalPercentage).toFixed(2))
            }
        };

        fetchDataLoad();
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            
            const percentage = await getFTPercentage(FTSessions, activeTab);
            setFreeThrowPercentage(Math.round(percentage));
            getBestWorstSessions(FTSessions, activeTab);
            const temp = getLast5Sessions(FTSessions, activeTab)
            setLast5Sessions(temp)
            const last5 = await getFTPercentage(getLast5Sessions(FTSessions), activeTab);
            setLast5SessionPercentage(Math.round(last5))
            setTotalSessions(FTSessions.length);
        };


        fetchData();
    }, [activeTab]);

    return (
        <div className="bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
            <div className="text-center border-b border-gray-200">
                <div className="flex space-x-1 justify-center">
                    <button
                        className={`py-3 px-6 w-1/3 focus:outline-none ${activeTab === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'} rounded-t-lg border border-gray-300 transition-all duration-150 ease-in-out transform ${activeTab === 'all' ? 'scale-105' : 'scale-100'}`}
                        onClick={() => handleTabClick('all')}
                    >
                        All Sessions
                    </button>
                    <button
                        className={`py-3 px-6 w-1/3 focus:outline-none ${activeTab === 'practice' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'} rounded-t-lg border border-gray-300 transition-all duration-150 ease-in-out transform ${activeTab === 'practice' ? 'scale-105' : 'scale-100'}`}
                        onClick={() => handleTabClick('practice')}
                    >
                        Practice
                    </button>
                    <button
                        className={`py-3 px-6 w-1/3 focus:outline-none ${activeTab === 'game' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'} rounded-t-lg border border-gray-300 transition-all duration-150 ease-in-out transform ${activeTab === 'game' ? 'scale-105' : 'scale-100'}`}
                        onClick={() => handleTabClick('game')}
                    >
                        Game
                    </button>
                </div>
            </div>


                {activeTab === '12' ? (
                    <div className="flex justify-center items-center h-full bg-gray-50 overflow-y-auto p-10">
                        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
                            <div className="text-center">
                                <h2 className="text-lg font-medium text-gray-800">Please click on a tab to proceed!</h2>
                            </div>
                        </div>
                    </div>
                    ) : (
                <div className="flex justify-center items-center h-full bg-gray-50 overflow-y-auto p-10">
                    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
                        {FTSessions.length > 0 && freeThrowPercentage && (
                            <div className="space-y-6 text-center">
                                {activeTab == 'all' ? (
                                    <>
                                        <h1 className="text-5xl font-bold text-blue-600">
                                            Free Throw Percentage: {freeThrowPercentage}%
                                        </h1>
                                        <button 
                                                onClick={() => tTest(FTSessions)} 
                                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-600 focus:outline-none"
                                            >
                                                See T-Test Statistics
                                        </button>
                                        {tTestModal && (
                                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                                                <div className="relative mx-auto p-6 border w-1/2 max-w-lg shadow-lg rounded-md bg-white">
                                                    <div className="text-center">
                                                        <h1 className="text-2xl font-semibold mb-4">T-Test Results</h1>
                                                        <div className="mb-4">
                                                            <p className="text-lg"><span className="font-medium">T-Value:</span> {tValue}</p>
                                                            <p className="text-lg"><span className="font-medium">Degrees of Freedom:</span> {degreesOfFreedom}</p>
                                                            <p className="text-lg"><span className="font-medium">Critical Value:</span> {criticalValue}</p>
                                                            <p className="text-lg">
                                                                <span className="font-medium">Significance:</span> 
                                                                {isSignificant ? 
                                                                    " The user shoots game and practice free throws differently." : 
                                                                    " The user shoots game and practice free throws the same."}
                                                            </p>                                                        
                                                        </div>
                                                        <button 
                                                            onClick={() => settTestModal(false)} 
                                                            className="mt-6 bg-red-500 text-white px-6 py-2 rounded-md shadow-sm hover:bg-red-600 focus:outline-none"
                                                        >
                                                            Close
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            )}                                        
                                        <h1 className={`${difference >= 0 ? 'text-green-500' : 'text-red-500'} text-3xl font-bold`}>
                                            {difference}
                                        </h1>
                                        <h5 className="mt-2 text-lg font-medium text-gray-700">
                                            Total Shooting Sessions: {totalSessions}
                                        </h5>


                                        <FTChart data={FTSessions}/>

                                    </>
                                    ): (
                                        <>
                                            <h1 className="text-5xl font-bold text-blue-600">
                                                Free Throw Percentage: {freeThrowPercentage}%
                                            </h1>
                                            <button 
                                                onClick={() => setLast5Modal(true)} 
                                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-600 focus:outline-none"
                                            >
                                                See Last 5 Session Statistics
                                            </button>
                                            {Last5Modal && (
                                                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                                                    <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
                                                        <div className="mt-3 text-center">
                                                            <h4 className={`mt-2 text-lg font-medium ${last5SessionsPercentage >= freeThrowPercentage ? 'text-green-500' : 'text-red-500'}`}>
                                                                Past 5 Sessions Average Percentage: {last5SessionsPercentage}%
                                                            </h4>
                                                            <Last5LineChart data={last5Sessions} />

                                                            <button 
                                                                onClick={() => setLast5Modal(false)} 
                                                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-600 focus:outline-none"
                                                            >
                                                                Close
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
                                                <div className="bg-blue-50 p-6 rounded-lg shadow-md transform transition duration-500 hover:scale-105">
                                                    <p className="text-lg text-gray-800">
                                                        <span className="font-semibold">Total Made:</span> {totalFTMade}
                                                        <span className="mx-3"></span>
                                                        <span className="font-semibold">Total Attempted:</span> {totalFTAttempted}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid gap-6 sm:grid-cols-2">
                                                <div className="bg-green-50 p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Best Session</h3>
                                                    <div className="text-gray-700">
                                                        <p><span className="font-medium">FT Made:</span> {bestMade}</p>
                                                        <p><span className="font-medium">FT Attempted:</span> {bestAttempted}</p>
                                                        <p><span className="font-medium">Percentage:</span> {bestPercentage}%</p>
                                                    </div>
                                                </div>
                                                <div className="bg-red-50 p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Worst Session</h3>
                                                    <div className="text-gray-700">
                                                        <p><span className="font-medium">FT Made:</span> {worstMade}</p>
                                                        <p><span className="font-medium">FT Attempted:</span> {worstAttempted}</p>
                                                        <p><span className="font-medium">Percentage:</span> {worstPercentage}%</p>
                                                    </div>
                                                </div>
                                            </div>


                                        </>
                                    )}
                    
                            </div>
                        )}
                        {FTSessions.length === 0 && (
                            <p className="text-xl text-gray-600">Not Available</p>
                        )}
                    </div>
                </div>
                    )}

                
            </div>
        </div>
    );
}
