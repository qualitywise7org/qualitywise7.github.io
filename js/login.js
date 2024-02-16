import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";

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

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await loginUser(email, password);
    localStorage.setItem("email", email);
    window.location.href = "/myaccount/jobsforyou/";

    alert("Logged in successfully!");
  } catch (error) {
    alert("Invalid email or password!");
  }
});

// onAuthStateChanged(auth, (user) => {
//     if (user) {
//         if (user.emailVerified) {
//             window.location.href = "/myaccount/jobsforyou/";
//         } else {
//             alert("Please verify your email!");
//         }
//     } else {
//     }
// });

async function loginUser(email, password) {
  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password);
}
