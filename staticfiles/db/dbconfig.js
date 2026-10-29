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
  orderBy,
  arrayUnion,
  Timestamp,
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
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";

// Firebase web config. It is NOT kept in the source code any more:
// `node build.js` generates ./firebase-config.js (next to this file, in
// target/) from environment variables or firebase.config.json.
// See jobsdoor360-website/firebase.config.example.json.
// To use the testing project (jd360-testing) locally, put its values in
// firebase.config.local.json.
import firebaseConfig from "./firebase-config.js";

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
  orderBy,
  arrayUnion,
  Timestamp,
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
  deleteDoc,
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


export { db };
export default obj;
