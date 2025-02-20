import React, { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/authContext'
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth'
import { doc, setDoc } from "firebase/firestore"
import { db } from '../../firebase/firebase';
import ErrorModal from '../../ErrorModal'


export default function Register() {

    const navigate = useNavigate()

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setconfirmPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorModal, setErrorModal] = useState(false); // State to control modal visibility
    const [errorMessage, setErrorMessage] = useState(""); // Example error message

    const handleCloseModal = () => {
        setErrorModal(false);
        navigate('/')

    };

    const { userLoggedIn } = useAuth()

    const onSubmit = async (e) => {
        try{
            e.preventDefault()
            if(!isRegistering) {
                setIsRegistering(true)

                if(password !== confirmPassword){
                    setErrorMessage('Passwords do not match');
                    setErrorModal(true);
                    return;
                }
                
                const userCredential = await doCreateUserWithEmailAndPassword(email, password)
                const user = userCredential.user;

                await setDoc(doc(db, 'users', user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    uid: user.uid,
                    ftGoalPercentage: 0,
                    position: 'None',
                    ftPercentage: 0
                });
                navigate('/home');

            }   
        }
        catch {
            setErrorMessage('Error when trying to register your account? Try again')
            setErrorModal(true);
        }
        
    }

    return (
        <>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className="w-full h-screen flex self-center place-content-center place-items-center">
                <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl bg-zinc-800">
                    <div className="text-center mb-6">
                        <div className="mt-2">
                            <h3 className="text-gray-50 text-xl font-semibold sm:text-2xl">Create a New Account</h3>
                        </div>

                    </div>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="flex space-x-4">
                            <div className="w-1/2">
                            <label className="text-sm text-gray-400 font-bold">First Name</label>
                            <input
                                type="text"
                                autoComplete='first name'
                                required
                                placeholder='Lebron'
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full mt-2 px-3 py-2 text-gray-300 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                            </div>
                            <div className="w-1/2">
                            <label className="text-sm text-gray-400 font-bold">Last Name</label>
                            <input
                                type="text"
                                autoComplete='last name'
                                required
                                placeholder='James'
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full mt-2 px-3 py-2 ttext-gray-300 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 font-bold">Email</label>
                            <input
                            type="email"
                            autoComplete='email'
                            required
                            placeholder='youremail@gmail.com'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-2 px-3 py-2 text-gray-300 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 font-bold">Password</label>
                            <input
                            disabled={isRegistering}
                            type="password"
                            autoComplete='new-password'
                            required
                            placeholder='************'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-2 px-3 py-2 text-gray-300 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 font-bold">Confirm Password</label>
                            <input
                            disabled={isRegistering}
                            type="password"
                            autoComplete='off'
                            required
                            placeholder='************'
                            value={confirmPassword}
                            onChange={(e) => setconfirmPassword(e.target.value)}
                            className="w-full mt-2 px-3 py-2 text-gray-300 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>


                        {errorMessage && (
                            <span className='text-red-600 font-bold'>{errorMessage}</span>
                        )}

                        <button
                            type="submit"
                            disabled={isRegistering}
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 hover:shadow-xl transition duration-300'}`}
                        >
                            {isRegistering ? 'Signing Up...' : 'Sign Up'}
                        </button>
                        <div className="text-sm text-center text-white">
                            Already have an account?{' '}
                            <Link to={'/login'} className="text-center text-sm hover:underline font-bold text-blue-500">
                                Continue
                            </Link>
                        </div>

                    </form>
                </div>
            </main>
            <ErrorModal isOpen={errorModal} errorMessage={errorMessage} onClose={handleCloseModal} />

        </>
    )
}
