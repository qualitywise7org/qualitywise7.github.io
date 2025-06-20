// // Check if the user is already logged in by checking local storage



// const email = localStorage.getItem("email");
// if (email) {
//   window.location.href = "/";
// }

// // Get the redirect URL from the query parameters, if any
// const urlParams = new URLSearchParams(window.location.search);
// const redirect_url = urlParams.get("redirect_url");

// // Get references to the login button and form
// const loginButton = document.getElementById("login-btn");
// const loginForm = document.getElementById("login-form");

// // Add an event listener to the login form to handle form submission
// loginForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   // Update login button state to indicate logging in process
//   loginButton.innerHTML = "Logging in...";
//   loginButton.disabled = true;

//   try {
//     await loginUser(email, password);
//   } catch (error) {
//     // Show error message if login fails
//     showToast("Try again");
//   }

//   // Reset login button state
//   loginButton.innerHTML = "Login";
//   loginButton.disabled = false;
// });


// // Function to handle user login
// async function loginUser(email, password) {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     // Check if the user's email is verified
//     if (!user.emailVerified) {
//       alert("Email is not verified");
//       throw new Error("Email is not verified");
//     }

//     // Store user information in local storage
//     localStorage.setItem("uid", user.uid);
//     localStorage.setItem("email", user.email);

//     // Reference to the user profile document
//     const docRef = doc(db, "user_profile", email);
//     const docSnap = await getDoc(docRef);
    

//     if (docSnap.exists()) {
//       // If user profile exists, update or initialize audit fields
//       let formData = { ...docSnap.data() };
//       var currentDate = window.getCurrentDateTime()


//       if (!formData.audit_fields) {
//         formData.audit_fields = {
//           createdAt: currentDate,
//           createdBy: email,
//           updatedAt: "",
//           updatedBy: "",
//         };
//       }

//       // console.log("Existing User Profile:", formData);
//       // Uncomment this to update the user profile if needed
//       await setDoc(docRef, formData);
//       localStorage.setItem("profile", true);
//       window.location.href = "/myaccount/";
//     } else {
//       // If user profile does not exist, check the lead collection
//       const leadDocRef = doc(db, "lead", email);
//       const leadDocSnap = await getDoc(leadDocRef);
//       let formData = { about: { email, firstName: user.displayName } };
//       var currentDate = window.getCurrentDateTime()
//       // console.log(currentDate);
//       if (leadDocSnap.exists()) {
//         formData.about = { ...formData.about, ...leadDocSnap.data() };
//       }

//       // Add audit fields
//       formData.audit_fields = {
//         createdAt: currentDate,
//         createdBy: email,
//         updatedAt: "",
//         updatedBy: "",
//       };

//       // Create a new user profile document
//       await setDoc(docRef, formData);
//       localStorage.setItem("profile", true);

//       // Redirect to the appropriate page
//       const redirectUrl = localStorage.getItem("redirect_url");
//       window.location.href = redirectUrl || "/myaccount/cv_upload/";
//     }
//   } catch (error) {
//     // Handle errors and show toast
//     console.error("Error:", error.message);
//     showToast(parseFirebaseError(error.message));
//   }
// }

// // Utility to parse Firebase error messages
// function parseFirebaseError(message) {
//   try {
//     return message
//       .split(" ")[2]
//       .split("(")[1]
//       .split(")")[0]
//       .split("/")[1]
//       .replaceAll("-", " ");
//   } catch {
//     return "An unknown error occurred";
//   }
// }


// // Function to display toast notifications
// function showToast(message) {
//   Toastify({
//     text: message,
//     duration: 3000,
//     newWindow: true,
//     close: true,
//     gravity: "top",
//     position: "right",
//     stopOnFocus: true,
//     style: {
//       background: "linear-gradient(to right, #0d6efd, #586ba6)",
//       borderRadius: "10px",
//     },
//   }).showToast();
// }

// async function checkIfUserExists(email) {
//   try {
//     const db = getFirestore();
//     const docRef = doc(db, "lead", email);
//     const docSnap = await getDoc(docRef);
//     return docSnap.exists();
//   } catch (error) {
//     throw new Error("Failed to check user existence: " + error.message);
//   }
// }

// const googleLogin = document.getElementById("google-login-btn");
// googleLogin.addEventListener("click", async () => {
//   try {
//     const provider = new GoogleAuthProvider();
//     const result = await signInWithPopup(auth, provider);
//     const user = result.user;
//     // console.log(user.email);

//     // Check if the email is already registered
//     const userExists = await checkIfUserExists(user.email);
//     if (userExists) {
//       window.location.href = "/";
//       return;
//     }

//     // Store user info in localStorage (consider security implications)
//     localStorage.setItem("uid", user.uid);
//     localStorage.setItem("email", user.email);
//     localStorage.setItem("phonenumber", user.phoneNumber);

//     // Redirect to home page
//     window.location.href = "/";
//   } catch (error) {
//     console.log("Error Logging in  with Google: ", error.message);
//   }
// });


// // onAuthStateChanged(auth, async (user) => {
// //   if (user) {
// //     const roleDoc = await getDoc(doc(db, "login_roles", user.uid));  // or "login_roles"
// //     if (roleDoc.exists()) {
// //       const role = roleDoc.data().role;
// //       console.log("User role:", role);
// //       // Save role in state or context
// //       // Show/hide UI accordingly
// //     } else {
// //       console.log("No role found for this user");
// //     }
// //   } else {
// //     // User logged out
// //   }
// // });

//  Prevent redirect loop when user already logged in
// 
// 
// 
// 
//  Capture redirect_url from query parameter
const urlParams = new URLSearchParams(window.location.search);
const redirectParam = urlParams.get("redirect_url");

if (redirectParam) {
  localStorage.setItem("redirect_url", redirectParam);
}


const email = localStorage.getItem("email");
if (email && !redirect_url) {
  window.location.href = "/";
}

// 🔘 Login Form
const loginButton = document.getElementById("login-btn");
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  loginButton.innerHTML = "Logging in...";
  loginButton.disabled = true;

  try {
    await loginUser(email, password);
  } catch (error) {
    showToast("Try again");
  }

  loginButton.innerHTML = "Login";
  loginButton.disabled = false;
});

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      alert("Email is not verified");
      throw new Error("Email is not verified");
    }

    localStorage.setItem("uid", user.uid);
    localStorage.setItem("email", user.email);

    const docRef = doc(db, "user_profile", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      let formData = { ...docSnap.data() };
      const currentDate = window.getCurrentDateTime();

      if (!formData.audit_fields) {
        formData.audit_fields = {
          createdAt: currentDate,
          createdBy: email,
          updatedAt: "",
          updatedBy: "",
        };
      }

      await setDoc(docRef, formData);
      localStorage.setItem("profile", true);
    } else {
      const leadDocRef = doc(db, "lead", email);
      const leadDocSnap = await getDoc(leadDocRef);
      const currentDate = window.getCurrentDateTime();

      let formData = {
        about: { email, firstName: user.displayName },
        audit_fields: {
          createdAt: currentDate,
          createdBy: email,
          updatedAt: "",
          updatedBy: "",
        }
      };

      if (leadDocSnap.exists()) {
        formData.about = { ...formData.about, ...leadDocSnap.data() };
      }

      await setDoc(docRef, formData);
      localStorage.setItem("profile", true);
    }

    // 🔁 Redirect to previous page or default
    const redirectUrl = localStorage.getItem("redirect_url");
    localStorage.removeItem("redirect_url");

    window.location.href = redirectUrl || "/myaccount/";

  } catch (error) {
    console.error("Error:", error.message);
    showToast(parseFirebaseError(error.message));
  }
}

function parseFirebaseError(message) {
  try {
    return message
      .split(" ")[2]
      .split("(")[1]
      .split(")")[0]
      .split("/")[1]
      .replaceAll("-", " ");
  } catch {
    return "An unknown error occurred";
  }
}

function showToast(message) {
  Toastify({
    text: message,
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: "linear-gradient(to right, #0d6efd, #586ba6)",
      borderRadius: "10px",
    },
  }).showToast();
}

// 🔘 Google Login
const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userExists = await checkIfUserExists(user.email);
    if (userExists) {
      // 🔁 Redirect to previous page or home
      const redirectUrl = localStorage.getItem("redirect_url");
      localStorage.removeItem("redirect_url");
      window.location.href = redirectUrl || "/";
      return;
    }

    localStorage.setItem("uid", user.uid);
    localStorage.setItem("email", user.email);
    localStorage.setItem("phonenumber", user.phoneNumber);

    // 🔁 Redirect to previous page or home
    const redirectUrl = localStorage.getItem("redirect_url");
    localStorage.removeItem("redirect_url");
    window.location.href = redirectUrl || "/";
  } catch (error) {
    console.log("Error Logging in with Google: ", error.message);
  }
});

async function checkIfUserExists(email) {
  try {
    const docRef = doc(db, "lead", email);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    throw new Error("Failed to check user existence: " + error.message);
  }
}