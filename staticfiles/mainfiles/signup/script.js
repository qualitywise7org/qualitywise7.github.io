import { getAuth, onAuthStateChanged } from "firebase/auth";

// Check if the user is already logged in
const email = localStorage.getItem("email");
if (email) {
    window.location.href = "/";
}

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Reload user to get latest verification status
    user.reload().then(() => {
      if (user.emailVerified) {
        window.location.href = "/"; // Redirect to home if verified
      }
    });
  }
});

const signupButton = document.getElementById("signup-btn");
const signupForm = document.getElementById("signup-form");
const googleSignUpButton = document.getElementById("google-signup-btn");

// Handle signup form submission
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

        signupForm.reset();

        const userCredential = await signUpUser(username, phoneNumber, email, password);
        await sendEmailVerification(auth.currentUser);

        window.location.href = "/resend_email_verification/";
    } catch (error) {
        alert("Error signing up: " + error.message);
    } finally {
        signupButton.innerHTML = "Sign Up";
        signupButton.disabled = false;
    }
});

// Sign up user and update profile
async function signUpUser(username, phoneNumber, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        await saveUserDataToFirestore(userCredential.user.uid, username, email, phoneNumber);
        return userCredential;
    } catch (error) {
        throw new Error(error.message);
    }
}

// Save user data to Firestore
async function saveUserDataToFirestore(userId, username, email, phoneNumber) {
    try {
        const db = getFirestore();
        const leadDocRef = doc(db, "lead", email);
        await setDoc(leadDocRef, {
            full_name: username,
            phonenumber: phoneNumber || "",
            email: email,
        });
    } catch (error) {
        throw new Error("Failed to save user data: " + error.message);
    }
}

// Check if user already exists in Firestore
async function checkIfUserExists(email) {
    try {
        const db = getFirestore();
        const docRef = doc(db, "lead", email);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        throw new Error("Failed to check user existence: " + error.message);
    }
}

// Handle Google sign up
googleSignUpButton.addEventListener("click", async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userExists = await checkIfUserExists(user.email);
        if (userExists) {
            alert("This email is already registered with us. Signing in you.");
            window.location.href = "/login";
            return;
        }

        localStorage.setItem("uid", user.uid);
        localStorage.setItem("email", user.email);

        await saveUserDataToFirestore(user.uid, user.displayName, user.email, user.phoneNumber);

        window.location.href = "/myaccount";
    } catch (error) {
        console.error("Error signing up with Google:", error.message);
    }
});
