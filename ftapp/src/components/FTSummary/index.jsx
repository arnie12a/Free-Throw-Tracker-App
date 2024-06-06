import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"
import { useAuth } from '../contexts/authContext';


export default function FTSummary() {
    
    const [FTSessions, setFTSessions] = useState();
    const { currentUser } = useAuth()
    let [freeThrowPercentage, setFreeThrowPercentage] = useState(0);




    const getFTSession = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "ftsessions"), where("uid", "==", specificUID));

        const querySnapshot = await getDocs(q);

        const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        //const querySnapshot = await getDocs(collection(db, "ftsessions"));
        //const sessions = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data()}))
        return sessions
    }

    const getFTPercentage = async (sessions) => {
        let totalAttempted = 0;
        let totalMade = 0;
        const result = await sessions;
        result.forEach(item => {
            totalAttempted += item['ftAttempted'];
            totalMade += item['ftMade'];
        })
        return((totalMade/totalAttempted)*100)
    }




    
    

    useEffect(() => {
        setFTSessions(getFTSession());

        getFTPercentage(getFTSession()).then(result => {
            setFreeThrowPercentage(Math.round(result))
        })
        
    }, [])

    
    return (
        
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                {freeThrowPercentage ? (
                    <h1 className="text-4xl font-bold text-blue-500">
                        Free Throw Percentage: {freeThrowPercentage}%
                    </h1>
                ) : (
                    <p className="text-lg text-gray-600">
                        Not Available
                    </p>
                )}
            </div>
        </div>


    );
}
