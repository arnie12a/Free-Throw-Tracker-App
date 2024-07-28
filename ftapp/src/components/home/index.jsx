import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/authContext'
import { collection, getDocs, doc, deleteDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebase"

const Home = () => {
    const { currentUser } = useAuth()
    
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [formVisible, setFormVisible] = useState(false);
    const [position, setPosition] = useState('');
    const [goal, setGoal] = useState('');
    const [ftPercentage, setFTPercentage] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    
    useEffect(() => {
        getUserInfo();

    }, [])

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setFormVisible(false);
        await setDoc(doc(db, 'users', currentUser.uid), {
            firstName: firstName,
            lastName: lastName,
            email: email,
            uid: currentUser.uid,
            ftGoalPercentage: goal,
            position: position
        });
    };
    

    const getUserInfo = async () => {
        const specificUID = currentUser.uid;
        const q = query(collection(db, "users"), where("uid", "==", specificUID));

        const querySnapshot = await getDocs(q);

        const userData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        //const querySnapshot = await getDocs(collection(db, "ftsessions"));
        //const sessions = querySnapshot.docs.map(doc => ({id:doc.id, ...doc.data()}))
        setFullName(userData[0].firstName + " " + userData[0].lastName);
        if(userData[0].position!=="None"){
            setGoal(userData[0].ftGoalPercentage);
            setPosition(userData[0].position);
            setFormVisible(false);
        }
        else{
            setFirstName(userData[0].firstName);
            setLastName(userData[0].lastName);
            setEmail(userData[0].email);
            setFormVisible(true)
        }
        setFTPercentage(userData[0].ftPercentage);
        return 
    }

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-zinc-500 shadow-xl rounded-lg p-8 max-w-lg w-full border border-gray-200">
                { fullName && goal && position ? (
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-gray-50">Welcome, {fullName}</h1>
                        <div className="mt-4">
                            <h2 className="text-xl text-gray-200">Position: {position}</h2>
                            <h3 className="text-xl text-gray-200 mt-2">FT Percentage: {ftPercentage}%</h3>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-gray-700">No Data yet</h1>
                        <p className="text-gray-500 mt-2">Please update your profile to see the information here.</p>
                    </div>
                )}
            </div>



    
    {formVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Add Your Info</h2>
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Position:</label>
                        <select 
                            value={position} 
                            onChange={(e) => setPosition(e.target.value)} 
                            className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Select position</option>
                            <option value="Point guard">Point guard</option>
                            <option value="Shooting guard">Shooting guard</option>
                            <option value="Small forward">Small forward</option>
                            <option value="Power forward">Power forward</option>
                            <option value="Center">Center</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Goal for Free Throw Percentage:</label>
                        <input 
                            type="range" 
                            value={goal} 
                            onChange={(e) => setGoal(e.target.value)} 
                            min="0" 
                            max="100" 
                            className="mt-1 p-2 w-full"
                        />
                        <div className="mt-2 text-center text-gray-700 font-medium">{goal}%</div>
                    </div>
                    <div className="flex justify-end">
                        <button 
                            type="button" 
                            onClick={() => setFormVisible(false)} 
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 mr-2 rounded transition duration-200"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}
</div>


        
    )
}

export default Home