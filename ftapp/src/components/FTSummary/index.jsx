import React, { useEffect, useState } from 'react';
import { collection, setDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from "../firebase/firebase";
import { useAuth } from '../contexts/authContext';
import FTChart from '../FTChart';
import Last5LineChart from '../Last5LineChart';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, Typography } from '@mui/material';

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
    const [activeTab, setActiveTab] = useState(0);
    const [last5Sessions, setLast5Sessions] = useState([]);
    const [totalNumberOfSessions, setTotalNumberOfSessions] = useState(0);
    const [showMoreDetailsButton, setShowMoreDetailsButton] = useState(true);

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
        const q = query(
            collection(db, "ftsessions"),
            where("uid", "==", specificUID),
            orderBy("date", "desc") // Sort by date in descending order
        );
        
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

    const checkUniqueSessions = (arr) => {
        let temp1 = arr.filter(session => session.sessionType === 'practice')
        let temp2 = arr.filter(session => session.sessionType === 'game')
        if (temp1.length == arr.length || temp2.length == arr.length) {
            return false;
        }
        return true;
    }

    useEffect(() => {
        const fetchDataLoad = async () => {
            const sessions = await getFTSession();
            const user = await getCurrentUser();
            setFTSessions(sessions);
            const percentage = await getFTPercentage(sessions);
            setUserShootingPercentage(user, percentage.toFixed(2));
            setActiveTab(0);  // Default to 'All'
            setShowMoreDetailsButton(checkUniqueSessions(sessions));
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
        };

        fetchData();
    }, [FTSessions]);

    useEffect(() => {
        const fetchNewTabData = async (activeTab) => {
            let tempSessions = []

            if (activeTab === 0) {
                tempSessions = FTSessions;
            } else {
                tempSessions = FTSessions.filter(session => session.sessionType === (activeTab === 1 ? 'practice' : 'game'));
            }
            const percentage = await getFTPercentage(tempSessions);
            setFreeThrowPercentage(Math.round(percentage));
            getBestWorstSessions(tempSessions);
            const tempLast5 = getLast5Sessions(tempSessions);
            setLast5Sessions(tempLast5);
            setTotalNumberOfSessions(tempSessions.length);
        }

        fetchNewTabData(activeTab);
    }, [activeTab]);

    return (
        <div className="bg-gray-50 flex items-center justify-center min-h-screen py-10 px-4">
            <div className="w-full max-w-6xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
                <div className="flex justify-center items-center h-full bg-gray-100 overflow-y-auto p-6 md:p-10">
                    <div className="space-y-8 bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-5xl">
                        {FTSessions.length > 0 && freeThrowPercentage && (
                            <div className="space-y-8 text-center">
                                <Typography variant="h3" color="primary">
                                    Free Throw Percentage: {freeThrowPercentage}%
                                </Typography>

                                <div className="rounded-lg overflow-hidden shadow-lg bg-gray-50 p-4 md:p-6">
                                    <FTChart data={FTSessions} />
                                </div>

                                {showMoreDetailsButton && (
                                    <Button
                                        onClick={() => setIsModalOpen(true)}
                                        variant="contained"
                                        color="primary"
                                        className="mt-6"
                                    >
                                        View More Details
                                    </Button>
                                )}

                                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                                    <DialogTitle>More Details</DialogTitle>
                                    <DialogContent>
                                        <Tabs
                                            value={activeTab}
                                            onChange={(event, newValue) => setActiveTab(newValue)}
                                            indicatorColor="primary"
                                            textColor="primary"
                                            variant="fullWidth"
                                        >
                                            <Tab label="All" />
                                            <Tab label="Practice" />
                                            <Tab label="Game" />
                                        </Tabs>

                                        <div className="mt-6 text-center">
                                            <Typography variant="h5">Session Percentage: {freeThrowPercentage}%</Typography>
                                            <Typography variant="body1">Total Sessions: {totalNumberOfSessions}</Typography>

                                            {FTSessions.length === 0 ? (
                                                <Typography variant="body1" color="textSecondary" className="mt-6">
                                                    No sessions recorded.
                                                </Typography>
                                            ) : (
                                                <div className="mt-10 space-y-6">
                                                    <div className="p-4 bg-blue-50 rounded-lg">
                                                        <Typography variant="body1">
                                                            <strong>Total Made:</strong> {totalFTMade} | <strong>Total Attempted:</strong> {totalFTAttempted}
                                                        </Typography>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="p-4 bg-green-50 rounded-lg">
                                                            <Typography variant="h6">Best Session</Typography>
                                                            <Typography variant="body1">
                                                                <strong>Made:</strong> {bestMade}<br />
                                                                <strong>Attempted:</strong> {bestAttempted}<br />
                                                                <strong>Percentage:</strong> {bestPercentage}%
                                                            </Typography>
                                                        </div>

                                                        <div className="p-4 bg-red-50 rounded-lg">
                                                            <Typography variant="h6">Worst Session</Typography>
                                                            <Typography variant="body1">
                                                                <strong>Made:</strong> {worstMade}<br />
                                                                <strong>Attempted:</strong> {worstAttempted}<br />
                                                                <strong>Percentage:</strong> {worstPercentage}%
                                                            </Typography>
                                                        </div>
                                                    </div>

                                                    <div className="mt-10">
                                                        <Typography variant="h6">Last 5 Sessions</Typography>
                                                        <Last5LineChart data={last5Sessions} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setIsModalOpen(false)} color="secondary">
                                            Close
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
