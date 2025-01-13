// Check if the user is already logged in by checking local storage
const email = localStorage.getItem("email");
if (email) {
  window.location.href = "/";
}

// Get the redirect URL from the query parameters, if any
const urlParams = new URLSearchParams(window.location.search);
const redirect_url = urlParams.get("redirect_url");

// Get references to the login button and form
const loginButton = document.getElementById("login-btn");
const loginForm = document.getElementById("login-form");

// Add an event listener to the login form to handle form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Update login button state to indicate logging in process
  loginButton.innerHTML = "Logging in...";
  loginButton.disabled = true;

  try {
    await loginUser(email, password);
  } catch (error) {
    // Show error message if login fails
    showToast("Try again");
  }

  // Reset login button state
  loginButton.innerHTML = "Login";
  loginButton.disabled = false;
});

//current date and time
function getCurrentDateTime() {
  const now = new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  };

  const formattedDateTime = now.toLocaleString("en-US", options);
  return formattedDateTime;
}
// Function to handle user login
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Check if the user's email is verified
    if (user.emailVerified) {
      // Store user information in local storage
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("email", user.email);

      const docRef = doc(db, "user_profile", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Redirect to the account page if user profile exists
        let formdata = {};
        let userdata = docSnap.data();
        // console.log(userdata);

        if (!userdata.auditField) {
          const currentDate = getCurrentDateTime();
          let auditField = {
            createdAt: currentDate,
            createdBy : formdata.about.email,
            updatedAt : "",
            updatedBy : ""
          };
          formdata.auditField = auditField;
          
        }
        formdata = userdata;
        
        // console.log(formdata);
        // Create user profile document with merged data
        await setDoc(docRef, formdata);
        localStorage.setItem("profile", true);
        window.location.href = "/myaccount/";

        // console.log(docSnap.data());
      } else {
        // Fetch data from lead collection if user profile does not exist
        const leadDocRef = doc(db, "lead", email);
        const leadDocSnap = await getDoc(leadDocRef);
        let userData = { email, firstName: user.displayName };
        let formdata = {};

        // Merge lead data with user data if lead document exists
        if (leadDocSnap.exists()) {
          userData = { ...userData, ...leadDocSnap.data() };
        }
        formdata.about = userData;
        if (!formdata.auditField) {
          const currentDate = getCurrentDateTime();
          let auditField = {
            createdAt: currentDate,
            createdBy : formdata.about.email,
            updatedAt : "",
            updatedBy : ""
          };
          formdata.auditField = auditField;
        }

        // Create user profile document with merged data
        await setDoc(docRef, formdata);
        localStorage.setItem("profile", true);

        // Redirect to either the redirect URL or CV upload page
        window.location.href = redirect_url
          ? redirect_url
          : "/myaccount/cv_upload/";
      }
    } else {
      // Alert user if email is not verified
      alert("Email is not verified");
      throw new Error("Email is not verified");
    }
  } catch (error) {
    // Log error message and show error toast
    console.log("Error:", error.message);
    showToast(
      error.message
        .split(" ")[2]
        .split("(")[1]
        .split(")")[0]
        .split("/")[1]
        .replaceAll("-", " ")
    );
  }
}

// Function to display toast notifications
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

const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if the email is already registered
    const userExists = await checkIfUserExists(user.email);
    if (userExists) {
      window.location.href = "/";
      return;
    }

    // Store user info in localStorage (consider security implications)
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("email", user.email);

    // Redirect to home page
    window.location.href = "/";
  } catch (error) {
    console.log("Error Logging in  with Google: ", error.message);
  }
});
