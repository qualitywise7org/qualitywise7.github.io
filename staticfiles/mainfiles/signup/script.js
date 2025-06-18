// Check if the user is already logged in
const email = localStorage.getItem("email");
if (email) {
    window.location.href = "/";
}

const signupButton = document.getElementById("signup-btn");
const signupForm = document.getElementById("signup-form");

// Handle form submission
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phoneNumber = document.getElementById("phoneNo").value;

    try {
        // Provide user feedback
        signupButton.innerHTML = "Signing up...";
        signupButton.disabled = true;

        // Check if the email is already registered
        const userExists = await checkIfUserExists(email);
        if (userExists) {
            alert("User already registered. Redirecting to login page.");
            window.location.href = "/login";
            return;
        }

        // Clear form fields
        signupForm.reset();

        // Sign up user
        const userCredential = await signUpUser(username, phoneNumber, email, password);

        // Send email verification
        await sendEmailVerification(auth.currentUser);

        // Redirect to email verification page
        window.location.href = "/resend_email_verification/";
    } catch (error) {
        // Display error message
        alert("Error signing up: " + error.message);
    }

    // Reset signup button
    signupButton.innerHTML = "Sign Up";
    signupButton.disabled = false;
});

// Function to sign up user
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

// Function to save user data to Firestore
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

// Function to check if user already exists
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
const googleSignUp = document.getElementById("google-signup-btn");
googleSignUp.addEventListener("click", async () => {
     try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // console.log(user.email);

    // Check if the email is already registered
    const userExists = await checkIfUserExists(user.email);
    if (userExists) {
      window.location.href = "/";
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
