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
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  writeBatch,
  setDoc,
  addDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";

// Initialize Firebase app
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

// const firebaseConfig = {
//   apiKey: "AIzaSyB50M8vFXcbkJ_SGNncFzzK0RHMLQpNIzU",
//   authDomain: "jd360-testing.firebaseapp.com",
//   databaseURL: "https://jd360-testing-default-rtdb.firebaseio.com",
//   projectId: "jd360-testing",
//   storageBucket: "jd360-testing.firebasestorage.app",
//   messagingSenderId: "576496756828",
//   appId: "1:576496756828:web:4482903b8db23a66285e99",
//   measurementId: "G-GN8843MVDG"
// };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
auth.languageCode = "en";
const provider = new GoogleAuthProvider();

const storage = getStorage(app);
const storageRef = ref(storage);


var obj = {};

obj.app = app;
obj.db = db;
obj.auth = auth;
obj.provider = provider;
obj.storage = storage;
obj.storageRef = storageRef;


Object.assign(obj, {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
});

Object.assign(obj, {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  writeBatch,
  where,
  doc,
  setDoc,
  addDoc,
  updateDoc,
});

Object.assign(obj, {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
});

//assigning into windows so that in other files or places we can use like window.getAuth
Object.assign(window,obj);
//exporting default so that we can use like module as well [ import { getAuth } from "./dbconfig.js";) ]
// Function to fetch user profile from Firebase


export default obj;
