import React, { useEffect, useState } from 'react'
import { collection, getDocs, doc, deleteDoc, orderBy, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"

export default function Leaderboard() {

    const [totalSessions, setTotalSessions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = totalSessions.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getLeaderboardInfo = async () => {
        const q = query(collection(db, "users"), orderBy("ftPercentage", "desc"));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(usersData)
        setTotalSessions(usersData);
        return 
    }

    useEffect(() => {
        getLeaderboardInfo()
    }, [])

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Leaderboard</h1>
            <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-6 p-4 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                    <div key={user.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-gray-500 p-4">
                        <h2 className="text-xl font-semibold text-white">{user.firstName} {user.lastName}</h2>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-700 mb-2"><span className="font-semibold">Email:</span> {user.email}</p>
                        <p className="text-gray-700 mb-2"><span className="font-semibold">Position:</span> {user.position}</p>
                        <p className="text-gray-700 mb-2"><span className="font-semibold">FT Percentage:</span> {user.ftPercentage}%</p>
                    </div>
                    </div>
                ))
                ) : (
                <p className="text-gray-700 text-center">No users found</p>
                )}
            </div>
            </div>

    )
}
