import React, { useEffect, useState } from 'react';
import { collection, setDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { useAuth } from '../contexts/authContext';
import FTChart from '../FTChart';
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

    const ss = require('simple-statistics');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const calculateShootingPercentage = (made, attempted) => (made / attempted) * 100;

    const tTest = (sessions) => {
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

        const tValue = ss.tTestTwoSample(practiceSessions, gameSessions, { variance: 'unequal' });
        const degreesOfFreedom = practiceSessions.length + gameSessions.length - 2;
        const criticalValue = ss.probit(0.975); // 95% confidence interval
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

    const getLast5Sessions = (arr) => {
        if(arr.length >= 5) {
            return arr.slice(1).slice(-5);
        }
        return arr;
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
            setUserShootingPercentage(user, percentage)
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
                                                onClick={() => settTestModal(true)} 
                                                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-600 focus:outline-none"
                                            >
                                                See T-Test Statistics
                                        </button>
                                        {tTestModal && (
                                                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                                                    <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
                                                        <div className="mt-3 text-center">
                                                            <h1>T-Test</h1>
                                                            <button 
                                                                onClick={() => settTestModal(false)} 
                                                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-red-600 focus:outline-none"
                                                            >
                                                                Close
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}                                        <h1 className={`${difference >= 0 ? 'text-green-500' : 'text-red-500'} text-3xl font-bold`}>
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
                                            
                                            <p className="text-lg text-gray-800">
                                                <span className="font-semibold">Total Made:</span> {totalFTMade} <span className="mx-3"></span> <span className="font-semibold">Total Attempted:</span> {totalFTAttempted}
                                            </p>
                                            <div className="text-lg text-gray-800">
                                                <h4 className="font-semibold">
                                                    Worst Session: <span className="text-red-600">{worstPercentage}%</span>
                                                </h4>
                                                <p>
                                                    <span className="font-semibold">Made:</span> {worstMade} <span className="mx-3"></span> <span className="font-semibold">Attempts:</span> {worstAttempted}
                                                </p>
                                            </div>
                                            <div className="text-lg text-gray-800">
                                                <h4 className="font-semibold">
                                                    Best Session: <span className="text-green-600">{bestPercentage}%</span>
                                                </h4>
                                                <p>
                                                    <span className="font-semibold">Made:</span> {bestMade} <span className="mx-3"></span> <span className="font-semibold">Attempts:</span> {bestAttempted}
                                                </p>
                                                
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
            </div>
        </div>
    );
}
