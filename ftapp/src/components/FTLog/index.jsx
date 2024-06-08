import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"
import { useAuth } from '../contexts/authContext';


export default function FTLog() {
    
    const [FTSessions, setFTSessions] = useState();
    const { currentUser } = useAuth()




    const getFTSession = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "ftsessions"), where("uid", "==", specificUID));

        const querySnapshot = await getDocs(q);

        const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        //const querySnapshot = await getDocs(collection(db, "ftsessions"));
        //const sessions = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data()}))
        setFTSessions(sessions)
    }

    const handleDelete = (id) => {
        deleteDoc(doc(db, 'ftsessions', id));
        const ftCopy = FTSessions.filter(ft => ft.id !== id);
        setFTSessions(ftCopy);
        getFTSession()
    }




    
    

    useEffect(() => {
        getFTSession();
        console.log(FTSessions)
    }, [])

    
    return (
        
        <div className="bg-gray-100 min-h-screen p-4">
            

            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <h1 className="text-4xl font-bold underline text-center mb-8">Free Throw Log</h1>

                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="px-6 py-3">
                                Date
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Free Throws Made
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Free Throws Attempted
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Session Type
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                    {FTSessions && FTSessions.length > 0 ? (
                            FTSessions.map(ftSession => (
                                
                                <tr key={ftSession.id} class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                                    <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {ftSession.date}
                                    </th>
                                    <td class="px-6 py-4">
                                    {ftSession.ftMade}
                                    </td>
                                    <td class="px-6 py-4">
                                    {ftSession.ftAttempted}
                                    </td>
                                    <td class="px-6 py-4">
                                    {ftSession.sessionType}
                                    </td>
                                    <td class="px-6 py-4">
    
                                        <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</button>
                                        <span> | </span>
                                        <button onClick={() => handleDelete(ftSession.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                    </td>

                                </tr>
                                
                            ))
                        ) : (
                            <p className="text-center text-gray-700">No hikes available</p>
                        )}
                        
                        
                        
                    </tbody>
                </table>
            </div>

        </div>

    );
}
