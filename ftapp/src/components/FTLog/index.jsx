import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"
import { useAuth } from '../contexts/authContext';


export default function FTLog() {
    
    const [FTSessions, setFTSessions] = useState();
    const { currentUser } = useAuth()
    const [deleteModalState, setDeleteModalState] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [editModalState, setEditModalState] = useState(false);
    const [editFTMade, setEditFTMade] = useState(0);
    const [editFTAttempted, setEditFTAttempted] = useState(0);
    const [editSessionType, setEditSessionType] = useState('');
    const [currentSession, setCurrentSession] = useState(null);

    const getFTSession = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "ftsessions"), where("uid", "==", specificUID));

        const querySnapshot = await getDocs(q);

        const sessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        //const querySnapshot = await getDocs(collection(db, "ftsessions"));
        //const sessions = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data()}))
        setFTSessions(sessions)
    }

    const handleRadioChange = (e) => {
        setEditSessionType(e.target.value);
    };

    const handleDelete = (id) => {
        deleteDoc(doc(db, 'ftsessions', id));
        const ftCopy = FTSessions.filter(ft => ft.id !== id);
        setDeleteModalState(false);
        setFTSessions(ftCopy);
        getFTSession();
    }

    function openEditModal(id, data){
        console.log(data)
        setCurrentSession(data);
        
        setEditModalState(true);
    }

    function openDeleteModal(id) {
        setDeleteModalState(true);
        setDeleteId(id);
    }

    function closeDeleteModal() {
        setDeleteModalState(false);
        setDeleteId('');
    }


    function closeEditModal() {
        setEditModalState(false);
    }

    const handleEditSubmit = async () => {
        if(editFTAttempted >= editFTMade){
            await setDoc(doc(db, 'ftsessions', currentSession.id), {
                date: currentSession.date,
                ftAttempted: editFTAttempted, 
                ftMade: editFTMade,
                percentage: Math.round((editFTMade/editFTAttempted)*100),
                sessionType: editSessionType,
                uid: currentSession.uid
    
            });
        }
        

    }
    
    

    useEffect(() => {
        getFTSession();
        console.log(FTSessions)
    }, [])

    
    return (
        
        <div className="bg-gray-100 min-h-screen p-4 pt-16 rounded-2xl">
        <div className="overflow-x-auto w-full">
            <table className="min-w-full text-sm text-left text-gray-600 border border-gray-200 rounded-lg shadow-md">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b border-gray-300">
                <tr>
                <th scope="col" className="px-6 py-4 text-center">Date</th>
                <th scope="col" className="px-6 py-4 text-center">Free Throws Made</th>
                <th scope="col" className="px-6 py-4 text-center">Free Throws Attempted</th>
                <th scope="col" className="px-6 py-4 text-center">Session Type</th>
                <th scope="col" className="px-6 py-4 text-center">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {FTSessions && FTSessions.length > 0 ? (
                FTSessions.map((ftSession, index) => (
                    <tr
                    key={ftSession.id}
                    className={`hover:bg-gray-50 transition-colors duration-200 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                    >
                    <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 text-center"
                    >
                        {ftSession.date}
                    </th>
                    <td className="px-6 py-4 text-center">{ftSession.ftMade}</td>
                    <td className="px-6 py-4 text-center">{ftSession.ftAttempted}</td>
                    <td className="px-6 py-4 text-center capitalize">{ftSession.sessionType}</td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => openEditModal(ftSession.id, ftSession)}
                            className="font-medium text-blue-500 hover:text-blue-700 transition-colors duration-300"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => openDeleteModal(ftSession.id)}
                            className="font-medium text-red-500 hover:text-red-700 transition-colors duration-300"
                        >
                            Delete
                        </button>
                        </div>
                    </td>
                    </tr>
                ))
                ) : (
                <tr>
                    <td colSpan="5" className="text-center text-gray-700 py-6">
                    No free throw sessions available
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>


        {deleteModalState && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white w-full max-w-sm rounded-lg p-4 md:p-8 shadow-lg mx-4">
                <h2 className="text-lg md:text-xl font-bold mb-4">Are you sure you want to delete this record?</h2>
                <div className="flex justify-end">
                <button onClick={() => handleDelete(deleteId)} className="bg-red-500 text-white px-4 py-2 rounded mr-2">Delete</button>
                <button onClick={closeDeleteModal} className="bg-gray-300 text-black px-4 py-2 rounded">Cancel</button>
                </div>
            </div>
            </div>
        )}

        {editModalState && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white w-full max-w-sm rounded-lg p-4 md:p-8 shadow-lg mx-4">
                <h2 className="text-lg md:text-xl font-bold mb-4">Edit Record</h2>
                {currentSession !== null ? (
                <>
                    <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="ftMade" className="block text-sm font-medium text-gray-700">Free Throws Made:</label>
                        <input
                        type="number"
                        id="ftMade"
                        value={editFTMade}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 0) {
                            setEditFTMade(value);
                            } else {
                            setEditFTMade(0);
                            }
                        }}
                        min="0"
                        required
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="ftAttempted" className="block text-sm font-medium text-gray-700">Free Throws Attempted:</label>
                        <input
                        type="number"
                        id="ftAttempted"
                        value={editFTAttempted}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 0) {
                            setEditFTAttempted(value);
                            } else {
                            setEditFTAttempted(0);
                            }
                        }}
                        min="0"
                        required
                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>

                    <div className="mt-4">
                        <span className="block text-sm font-medium text-gray-700">Session Type:</span>
                        <div className="mt-1">
                        <label className="inline-flex items-center">
                            <input
                            type="radio"
                            name="sessionType"
                            value="game"
                            checked={editSessionType === 'game'}
                            onChange={handleRadioChange}
                            className="form-radio text-indigo-600"
                            />
                            <span className="ml-2">Game</span>
                        </label>
                        <label className="inline-flex items-center ml-6">
                            <input
                            type="radio"
                            name="sessionType"
                            value="practice"
                            checked={editSessionType === 'practice'}
                            onChange={handleRadioChange}
                            className="form-radio text-indigo-600"
                            />
                            <span className="ml-2">Practice</span>
                        </label>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Save</button>
                        <button onClick={closeEditModal} type="button" className="bg-gray-300 text-black px-4 py-2 rounded">Cancel</button>
                    </div>
                    </form>
                </>
                ) : (
                <h2>Loading...</h2>
                )}
            </div>
            </div>
        )}
        </div>



    );
}
