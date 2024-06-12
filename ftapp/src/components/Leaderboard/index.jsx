import React, { useEffect, useState } from 'react'
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"

export default function Leaderboard() {

    const [totalSessions, setTotalSessions] = useState([]);

    const getLeaderboardInfo = async () => {
        const q = query(collection(db, "users"));

        const querySnapshot = await getDocs(q);

        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        //const querySnapshot = await getDocs(collection(db, "ftsessions"));
        //const sessions = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data()}))
        setTotalSessions(usersData);
        return 
    }

    useEffect(() => {
        getLeaderboardInfo()
    }, [])

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
            <div className="grid gap-6">
                {totalSessions.map(user => (
                    <div key={user.id} className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-2">{user.firstName} {user.lastName}</h2>
                        <p className="text-gray-700 mb-1"><strong>Email:</strong> {user.email}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
