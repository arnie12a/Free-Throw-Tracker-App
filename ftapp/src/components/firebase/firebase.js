// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyB2QJcpmhitFuv7Xq4EGZ9gnc6qrf-_DQM",
    authDomain: "freethrowtrackerapp.firebaseapp.com",
    projectId: "freethrowtrackerapp",
    storageBucket: "freethrowtrackerapp.appspot.com",
    messagingSenderId: "1097631943011",
    appId: "1:1097631943011:web:5855d998e3ce234690ab56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };