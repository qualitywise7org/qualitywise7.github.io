const signupButton = document.getElementById("signup-btn");
const signupForm = document.getElementById("signup-form");

// signupForm.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const username = document.getElementById("username").value;
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   try {
//     const userCredential = await signUpUser(username, email, password);

//     document.getElementById("username").value = "";
//     document.getElementById("email").value = "";
//     document.getElementById("password").value = "";

//     await saveUserDataToFirestore(userCredential.user.uid, username, email);

//     await sendEmailVerification(userCredential.user);

//     var user = {
//       id: userCredential.user.uid,
//       userName: username,
//       email: email,
//     };

//     var userJSON = JSON.stringify(user);
//     localStorage.setItem("user", userJSON); 
//     alert("Signed up successfully! "); 
//   } catch (error) {
//     alert("Error signing up: " + error.message); 
//   }
// });



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

// function showToast(msg) {
//   var toastContainer = document.getElementById("toast-container");
//   toastContainer.innerText = msg;

//   toastContainer.style.display = "block";

//   setTimeout(function () {
//     toastContainer.style.display = "none";
//   }, 3000);
// }


const googleSignUp = document.getElementById("google-signup-btn");
googleSignUp.addEventListener("click", async () => {
    signInWithPopup(auth, provider)
        .then(async (result) => {
            const credentials = GoogleAuthProvider.credentialFromResult(result);
            const user = result.user;
            localStorage.setItem("uid", user.uid);
            localStorage.setItem("email", user.email);
            window.location.href = "/myaccount/cv_upload/";
        }).catch((error) => {
            const errorMessage = error.message;
            console.log("Error:", errorMessage);
        });
})

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const phoneNumber = document.getElementById("phoneNumber").value;

    try {
        signupButton.innerHTML = "Signing up...";
        signupButton.disabled = true;
        document.getElementById("username").value = "";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
        document.getElementById("phoneNumber").value = "";

        const userCredential = await signUpUser(username, phoneNumber, email, password);

        // Send email verification
        await sendEmailVerification(auth.currentUser);
        window.location.href = "/resend_email_verification/";
    } catch (error) {
        alert("Error signing up: " + error.message);
    }

    signupButton.innerHTML = "Sign Up";
    signupButton.disabled = false;
});

async function signUpUser(username, phoneNumber, email, password) {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    await updateProfile(userCredential.user, { displayName: username });
    await saveUserDataToFirestore(userCredential.user.uid, username, email, phoneNumber);

    return userCredential;
}

async function saveUserDataToFirestore(userId, username, email, phoneNumber) {
    const db = getFirestore();
    const userDocRef = doc(db, "login_details", userId);

    await setDoc(userDocRef, {
        full_name: username,
        phonenumber: phoneNumber,
        email: email,
        firstLogin: true,
        isAdmin: false,
    });
}

