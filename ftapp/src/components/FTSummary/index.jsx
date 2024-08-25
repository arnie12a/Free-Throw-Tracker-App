import React, { useEffect, useState } from 'react';
import { collection, setDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { useAuth } from '../contexts/authContext';
import FTChart from '../FTChart';
import Last5LineChart from '../Last5LineChart';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Game");
    const [last5SessionsPercentage, setLast5SessionPercentage] = useState(0);
    const [last5Sessions, setLast5Sessions] = useState([]);
    const [difference, setDifference] = useState(0);

    const ss = require('simple-statistics');

    const calculateShootingPercentage = (made, attempted) => (made / attempted) * 100;

    const getBestWorstSessions = (sessions) => {
        let bestMade = -1;
        let bestAttempted = -1;
        let bestPercentage = -1;
        let worstMade = 101;
        let worstAttempted = 101;
        let worstPercentage = 101;

        sessions.forEach(session => {
            const percentage = calculateShootingPercentage(session.ftMade, session.ftAttempted);
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
    };

    const getFTPercentage = async (sessions) => {
        let totalAttempted = 0;
        let totalMade = 0;

        sessions.forEach(item => {
            totalAttempted += item['ftAttempted'];
            totalMade += item['ftMade'];
        });

        setTotalFTMade(totalMade);
        setTotalFTAttempted(totalAttempted);
        return (totalMade / totalAttempted) * 100;
    };

    const getLast5Sessions = (arr) => {
        return arr.length >= 5 ? arr.slice(-5) : arr;
    };

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
    };

    useEffect(() => {
        const fetchDataLoad = async () => {
            const sessions = await getFTSession();
            const user = await getCurrentUser();
            setFTSessions(sessions);
            const percentage = await getFTPercentage(sessions);
            setUserShootingPercentage(user, percentage.toFixed(2));
            if (percentage && user) {
                setDifference((percentage - user[0].ftGoalPercentage).toFixed(2));
            }
        };

        fetchDataLoad();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const percentage = await getFTPercentage(FTSessions);
            setFreeThrowPercentage(Math.round(percentage));
            getBestWorstSessions(FTSessions);
            const temp = getLast5Sessions(FTSessions);
            setLast5Sessions(temp);
            const last5 = await getFTPercentage(getLast5Sessions(FTSessions));
            setLast5SessionPercentage(Math.round(last5));
        };

        fetchData();
    }, [FTSessions]);

    const getTabData = () => {
        return FTSessions.filter(session => session.sessionType === activeTab.toLowerCase());
    };

    const tabData = getTabData();

    return (
        <div className="bg-gray-100 flex items-center justify-center p-4 pt-24">
            <div className="w-full max-w-5xl mx-auto bg-gray-100 shadow-2xl rounded-lg overflow-hidden">
                <div className="flex justify-center items-center h-full bg-gray-100 overflow-y-auto p-4 md:p-10">
                    <div className="space-y-6 bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-5xl">
                        {FTSessions.length > 0 && freeThrowPercentage && (
                            <div className="space-y-6 text-center">
                                <h1 className="text-4xl md:text-5xl font-bold text-blue-600">
                                    Free Throw Percentage: {freeThrowPercentage}%
                                </h1>
                                <h5 className="mt-2 text-md md:text-lg font-medium text-gray-700">
                                    Total Shooting Sessions: {FTSessions.length}
                                </h5>
                                <FTChart data={FTSessions} />
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none"
                                >
                                    More Details
                                </button>

                                {isModalOpen && (
                                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white rounded-lg p-4 md:p-8 w-full max-w-lg md:max-w-3xl shadow-lg overflow-y-auto max-h-full">
                                            <div className="flex justify-between items-center">
                                                <button
                                                    onClick={() => setIsModalOpen(false)}
                                                    className="text-gray-600 hover:text-gray-900 text-2xl"
                                                >
                                                    &times;
                                                </button>
                                                <button
                                                    onClick={() => setIsModalOpen(false)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    Hide Details
                                                </button>
                                            </div>
                                            <div className="mt-4">
                                                <div className="mt-4 flex justify-center space-x-2 md:space-x-4">
                                                    <button
                                                        onClick={() => setActiveTab("Game")}
                                                        className={`px-3 md:px-4 py-2 rounded-md shadow-sm ${activeTab === "Game" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"} hover:bg-blue-600 focus:outline-none`}
                                                    >
                                                        Game
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveTab("Practice")}
                                                        className={`px-3 md:px-4 py-2 rounded-md shadow-sm ${activeTab === "Practice" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"} hover:bg-blue-600 focus:outline-none`}
                                                    >
                                                        Practice
                                                    </button>
                                                </div>

                                                <div className="mt-8">
                                                    <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
                                                        {activeTab} Sessions
                                                    </h2>
                                                    {tabData.length === 0 ? (
                                                        <p className="text-md md:text-lg text-gray-600 mt-4">
                                                            You have not shot any {activeTab.toLowerCase()} sessions.
                                                        </p>
                                                    ) : (
                                                        <div id="metrics" className="grid gap-4 md:gap-12 pt-8">
                                                            <div className="bg-blue-50 p-4 md:p-6 rounded-lg shadow-md transform transition duration-500 hover:scale-105">
                                                                <p className="text-md md:text-lg text-gray-800">
                                                                    <span className="font-semibold">Total Made:</span> {totalFTMade}
                                                                    <span className="mx-2 md:mx-3"></span>
                                                                    <span className="font-semibold">Total Attempted:</span> {totalFTAttempted}
                                                                </p>
                                                            </div>

                                                            <div className="grid gap-4 md:gap-12 sm:grid-cols-1 md:grid-cols-2 pt-1 mt-8">
                                                                <div className="bg-green-50 p-4 md:p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
                                                                    <h3 className="font-semibold text-xl md:text-2xl text-green-700 mb-2">Best Session</h3>
                                                                    <p className="text-md md:text-lg text-gray-800">
                                                                        <span className="font-semibold">Made:</span> {bestMade} <br />
                                                                        <span className="font-semibold">Attempted:</span> {bestAttempted} <br />
                                                                        <span className="font-semibold">Percentage:</span> {bestPercentage}%
                                                                    </p>
                                                                </div>

                                                                <div className="bg-red-50 p-4 md:p-6 rounded-lg shadow-lg transform transition duration-500 hover:scale-105">
                                                                    <h3 className="font-semibold text-xl md:text-2xl text-red-700 mb-2">Worst Session</h3>
                                                                    <p className="text-md md:text-lg text-gray-800">
                                                                        <span className="font-semibold">Made:</span> {worstMade} <br />
                                                                        <span className="font-semibold">Attempted:</span> {worstAttempted} <br />
                                                                        <span className="font-semibold">Percentage:</span> {worstPercentage}%
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Include Last 5 Sessions Line Chart */}
                                                            <div className="mt-8">
                                                                <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
                                                                    Last 5 Sessions
                                                                </h2>
                                                                <Last5LineChart data={last5Sessions} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
