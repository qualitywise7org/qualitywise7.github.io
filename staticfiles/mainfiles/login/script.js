const urlParams = new URLSearchParams(window.location.search);
const redirect_url = urlParams.get('redirect_url');
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";

import {
    getFirestore,
    addDoc,
    getDoc,
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
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click", async () => {
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const credentials = GoogleAuthProvider.credentialFromResult(result);
            const user = result.user;
            sessionStorage.setItem("user", JSON.stringify(user));
            const docRef = doc(db, "user_profile", user.email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                localStorage.setItem('profile', true);
            }
            if (redirect_url == "hiring") {
                window.location.href = '../hiring/';
            } else if (redirect_url) {
                window.location.href = "../myaccount" + redirect_url;
            } else {
                window.location.href = "../myaccount";
            }
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            const credentials = GoogleAuthProvider.credentialFromError(error);
            console.log("Error:", errorMessage);
            console.log("Error:", error.message);
            Toastify({
                text: errorMessage.split(' ')[2].split("(")[1].split(")")[0].split('/')[1].replaceAll('-', ' '),
                duration: 3000,
                newWindow: true,
                close: true,
                gravity: "top",
                position: "right",
                stopOnFocus: true,
                style: {
                    background: "linear-gradient(to right, #0d6efd, #586ba6)",
                    borderRadius: "10px"
                }
            }).showToast();
        });
})


const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await loginUser(email, password);
    } catch (error) {
        Toastify({
            text: "Try again",
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #0d6efd, #586ba6)",
                borderRadius: "10px"
            }
        }).showToast();
    }
});


async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user.emailVerified) {
            sessionStorage.setItem("user", JSON.stringify(user));
            const docRef = doc(db, "user_profile", email);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                localStorage.setItem('profile', true);
            }
            if (redirect_url == "hiring") {
                window.location.href = '../hiring/';
            } else if (redirect_url) {
                window.location.href = "../myaccount" + redirect_url;
            } else {
                window.location.href = "../myaccount";
            }
        } else {
            alert("Email is not verified");
            throw new Error("Email is not verified");
        }
    } catch (error) {
        console.log("Error:", error.message);
        Toastify({
            text: error.message.split(' ')[2].split("(")[1].split(")")[0].split('/')[1].replaceAll('-', ' '),
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #0d6efd, #586ba6)",
                borderRadius: "10px"
            }
        }).showToast();
    }
}

