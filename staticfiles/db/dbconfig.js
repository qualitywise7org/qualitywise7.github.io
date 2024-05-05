//include this file to use firebase config. it is reusable file
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";


import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    addDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";

// Initialize Firebase app
const firebaseConfig1 = {
    apiKey: "AIzaSyDzoJJ_325VL_axuuAFzDf3Bwt_ENzu2rM",
    authDomain: "jobsdoor360-39b87.firebaseapp.com",
    databaseURL: "https://jobsdoor360-39b87-default-rtdb.firebaseio.com",
    projectId: "jobsdoor360-39b87",
    storageBucket: "jobsdoor360-39b87.appspot.com",
    messagingSenderId: "326416618185",
    appId: "1:326416618185:web:de19e90fe4f06006ef3318",
    measurementId: "G-60RHEMJNM6",
};


//js360-testing config
const firebaseConfig = {
    apiKey: "AIzaSyB50M8vFXcbkJ_SGNncFzzK0RHMLQpNIzU",
    authDomain: "jd360-testing.firebaseapp.com",
    projectId: "jd360-testing",
    storageBucket: "jd360-testing.appspot.com",
    messagingSenderId: "576496756828",
    appId: "1:576496756828:web:4482903b8db23a66285e99",
    measurementId: "G-GN8843MVDG"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();

const storage = getStorage(app);
const storageRef = ref(storage);

window.app = app;
window.db = db;
window.auth = auth;
window.provider = provider;
window.storage = storage;
window.storageRef = storageRef;


Object.assign(window, {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
});

Object.assign(window, {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    addDoc,
    updateDoc
});

Object.assign(window, {
    getAuth,
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signInWithEmailAndPassword
});

