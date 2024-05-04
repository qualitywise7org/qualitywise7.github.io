import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
    getFirestore,
    setDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDzoJJ_325VL_axuuAFzDf3Bwt_ENzu2rM",
    authDomain: "jobsdoor360-39b87.firebaseapp.com",
    databaseURL: "https://jobsdoor360-39b87-default-rtdb.firebaseio.com",
    projectId: "jobsdoor360-39b87",
    storageBucket: "jobsdoor360-39b87.appspot.com",
    messagingSenderId: "326416618185",
    appId: "1:326416618185:web:de19e90fe4f06006ef3318",
    measurementId: "G-60RHEMJNM6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const currentDate = new Date();

const hours = currentDate.getHours();
const minutes = currentDate.getMinutes();

const formattedTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
console.log('Formatted Time:', formattedTime);

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("code").value;

    if (password === formattedTime) {
        const db = getFirestore(app);
        const userId = localStorage.getItem("uid");
        const userRef = doc(db, "users", userId);
        await setDoc(userRef, { isAdmin: true }, { merge: true });
        window.location.href = "/myaccount/hiring-portal/";
        alert("Welcome Admin!");
        console.log("done sir")
    } else {
        console.log(typeof (password));
        alert("Wrong credential");
        console.log("Password:", password);
        console.log("Formatted Time:", formattedTime);
    }
});