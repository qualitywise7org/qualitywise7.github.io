import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
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

const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signUpUser(username, email, password);

        document.getElementById("username").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";

        await saveUserDataToFirestore(userCredential.user.uid, username, email);

        await sendEmailVerification(userCredential.user);

        
        // Store user data in local storage
        var user = {
            id: userCredential.user.uid,
            userName: username,
            email: email,
        };

        var userJSON = JSON.stringify(user);
        localStorage.setItem('user', userJSON);


        alert("Signed up successfully! A verification email has been sent.");
    } catch (error) {
        alert("Error signing up: " + error.message);
    }
});

// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         if (user.emailVerified) {
//             window.location.href = "/myaccount/";
//         } else {
//             alert("Please verify your email!");
//         }
//     } else {
//     }
// });

async function signUpUser(username, email, password) {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    await updateProfile(userCredential.user, { displayName: username });

    return userCredential;
}

async function saveUserDataToFirestore(userId, username, email) {
    const db = getFirestore();
    const userDocRef = doc(db, "users", userId);

    await setDoc(userDocRef, {
        full_name: username,
        email: email,
    });
}