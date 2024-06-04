import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from "../firebase/firebase"

export default function FTSummary() {
    
    const [hikes, setHikes] = useState();


    const handleDelete = (id) => {
        deleteDoc(doc(db, "hikes", id));
        const hikeCopy = hikes.filter(hike => hike.id !== id);
        setHikes(hikeCopy);
        getHikes();
    }

 

    const getHikes = async () => {
        const querySnapshot = await getDocs(collection(db, "hikes"));
        const hikes = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data()}))
        setHikes(hikes)
    }




    
    

    useEffect(() => {
        
    }, [])

    
    return (
        <div>
            <h1>FT Summary</h1>
        </div>
    );
}
