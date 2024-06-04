import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from "../firebase/firebase"

export default function FTSummary() {
    
    const [FTSessions, setFTSessions] = useState();




    const getFTSession = async () => {
        const querySnapshot = await getDocs(collection(db, "ftsessions"));
        const sessions = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data()}))
        setFTSessions(sessions)
    }




    
    

    useEffect(() => {
        getFTSession();
        console.log(FTSessions)
    }, [])

    
    return (
        <div className="bg-gray-100 min-h-screen p-4">
            <h1 className="text-4xl font-bold underline text-center mb-8">Free Throw Summary</h1>
            {FTSessions && FTSessions.length > 0 ? (
                FTSessions.map(ftSession => (
                    <div key={ftSession.id} className="bg-white p-6 mb-4 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-2">{ftSession.hikeName}</h2>
                        <p className="text-gray-700 mb-1">Date: {ftSession.date}</p>
                        <p className="text-gray-700 mb-1">FT Made: {ftSession.ftMade}</p>
                        <p className="text-gray-700 mb-1">FT Attempted: {ftSession.ftAttempted}</p>
                        <p className="text-gray-700 mb-4">Session Type: {ftSession.sessionType}</p>
                        
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-700">No hikes available</p>
            )}
        </div>

    );
}
