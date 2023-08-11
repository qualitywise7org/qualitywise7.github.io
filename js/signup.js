import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

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

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signUpUser(username, email, password);
        alert("Signed up successfully!");

        document.getElementById("username").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
    } catch (error) {
        alert("Error signing up: " + error.message);
    }
});

async function signUpUser(username, email, password) {
    const auth = getAuth();

    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    await updateProfile(userCredential.user, { displayName: username });
}
