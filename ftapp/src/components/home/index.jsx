import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/authContext'
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"

const Home = () => {
    const { currentUser } = useAuth()
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [fullName, setFullName] = useState('');
    useEffect(() => {
        getUserInfo();
    }, [])

    

    const getUserInfo = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "users"), where("uid", "==", specificUID));

        const querySnapshot = await getDocs(q);

        const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        //const querySnapshot = await getDocs(collection(db, "ftsessions"));
        //const sessions = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data()}))
        setFullName(userData[0].firstName + " " + userData[0].lastName);
        return 
    }

    return (
        <>

            <div className="container mx-auto p-6">
            <div className="text-2xl font-bold pt-14">
                Welcome {currentUser.displayName ? currentUser.displayName : currentUser.email}!
            </div>
            { fullName ? (
            <>
                <h1>{fullName}</h1>
            </>
            ):(
                <h1>Nada</h1>
            )
            }
            <img 
                src="https://www.carlswebgraphics.com/basketball-graphics/free-throw-animation-2018.gif" 
                alt="man shooting a free throw"  
                width="400"
            />

            
            </div>

        </>
        
    )
}

export default Home