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

    const getFTPercentage = (sessions) => {
        let totalAttempted = 0;
        let totalMade = 0;
        for (var i = 0; i < sessions.length; i++) {
            totalAttempted += sessions[i].ftAttempted;
            totalMade += sessions[i].ftMade;
        }
        return (totalMade/totalAttempted)*100
    }




    
    

    useEffect(() => {
        setFTSessions(getFTSession());

        setFreeThrowPercentage(getFTPercentage(getFTSession()));
        console.log(FTSessions)
    }, [])

    
    return (
        
        <div className="bg-gray-100 min-h-screen p-4">
            {FTSessions && FTSessions.length > 0  && freeThrowPercentage ? (
                
                <h1>{freeThrowPercentage}%</h1>
            ) : (
                <p>Not Available</p>
            )
        }
        </div>

    );
}
