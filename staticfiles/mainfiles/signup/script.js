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
// Google signup button event listener
const googleSignUpButton = document.getElementById("google-signup-btn");
googleSignUpButton.addEventListener("click", async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if the email is already registered
        const userExists = await checkIfUserExists(user.email);
        if (userExists) {
            window.location.href = "/"; // Redirect if user already exists
        } else {
            window.location.href = "/login"; // Redirect to login if not registered
        }
    } catch (error) {
        console.error("Google sign up error:", error);
    }
});

      return;
    }

    // Store user info in localStorage (consider security implications)
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("email", user.email);
    localStorage.setItem("phonenumber", user.phoneNumber);

    // Redirect to home page
    window.location.href = "/";
  } catch (error) {
    console.log("Error Logging in  with Google: ", error.message);
  }
});
