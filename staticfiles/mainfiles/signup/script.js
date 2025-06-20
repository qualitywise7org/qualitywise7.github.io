// ==== Firebase Setup ====
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";

// ==== Firebase Config ====
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// ==== Initialize Firebase ====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==== Auth Redirect ====
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await user.reload();
    if (user.emailVerified) {
      window.location.href = "/";
    }
  }
});

// ==== Elements ====
const signupButton = document.getElementById("signup-btn");
const signupForm = document.getElementById("signup-form");
const googleSignUpButton = document.getElementById("google-signup-btn");

// ==== Signup With Email/Password ====
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const phoneNumber = document.getElementById("phoneNo").value;

  try {
    signupButton.innerHTML = "Signing up...";
    signupButton.disabled = true;

    const userExists = await checkIfUserExists(email);
    if (userExists) {
      alert("User already registered. Redirecting to login page.");
      window.location.href = "/login";
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    await sendEmailVerification(userCredential.user);
    await saveUserDataToFirestore(userCredential.user.uid, username, email, phoneNumber);

    signupForm.reset();
    window.location.href = "/resend_email_verification/";
  } catch (error) {
    alert("Error signing up: " + error.message);
  } finally {
    signupButton.innerHTML = "Sign Up";
    signupButton.disabled = false;
  }
});

// ==== Save User to Firestore ====
async function saveUserDataToFirestore(userId, username, email, phoneNumber) {
  try {
    const leadDocRef = doc(db, "lead", email); // or use userId
    await setDoc(leadDocRef, {
      full_name: username,
      phonenumber: phoneNumber || "",
      email: email,
    });
  } catch (error) {
    throw new Error("Failed to save user data: " + error.message);
  }
}

// ==== Check User Existence ====
async function checkIfUserExists(email) {
  try {
    const docRef = doc(db, "lead", email);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    throw new Error("Failed to check user existence: " + error.message);
  }
}

// ==== Google Sign-Up ====
googleSignUpButton.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userExists = await checkIfUserExists(user.email);
    if (!userExists) {
      await saveUserDataToFirestore(user.uid, user.displayName || "", user.email, user.phoneNumber || "");
      await sendEmailVerification(user); // optional
    }

    // Save to localStorage
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("email", user.email);
    localStorage.setItem("phonenumber", user.phoneNumber || "");

    // Redirect
    const redirectUrl = localStorage.getItem("redirect_url");
    localStorage.removeItem("redirect_url");
    window.location.href = redirectUrl || "/";
  } catch (error) {
    console.error("Google sign up error:", error.message);
    alert("Google signup failed: " + error.message);
  }
});