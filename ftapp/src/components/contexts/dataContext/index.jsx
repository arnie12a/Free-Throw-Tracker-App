import React, { createContext, useState, useEffect }from 'react'
import { getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from "../firebase/firebase"
import { useAuth } from '../authContext';

const DataContext = createContext();


export const DataProvider = ({ children }) => {
    const [data, setData] = useState([]);
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
/*
    const specificUID = currentUser.uid;
        const q = query(collection(db, "ftsessions"), where("uid", "==", specificUID));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
*/

    const fetchData = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "ftsessions"), where("uid", "==", specificUID));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    useEffect(() => {
        fetchData();

    }, []);

    return (
        <DataContext.Provider value={{ data, fetchData }}>
        {children}
        </DataContext.Provider>
    );

}



