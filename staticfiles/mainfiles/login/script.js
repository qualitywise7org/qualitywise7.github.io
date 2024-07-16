const email = localStorage.getItem("email");
if (email) {
  window.location.href = "/";
}
const urlParams = new URLSearchParams(window.location.search);
const redirect_url = urlParams.get("redirect_url");
const loginButton = document.getElementById("login-btn");

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    loginButton.innerHTML = "Logging in...";
    loginButton.disabled = true;
    await loginUser(email, password);
  } catch (error) {
    Toastify({
      text: "Try again",
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
  loginButton.innerHTML = "Login";
  loginButton.disabled = false;
});
// changes done
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (user.emailVerified) {
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("email", user.email);
      const docRef = doc(db, "user_profile", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        localStorage.setItem("profile", true);
        const redirectTo = redirect_url
          ? redirect_url
          : docSnap.data().about?.cv
          ? "/myaccount/yourprofile"
          : "/myaccount/cv_upload/";
        window.location.href = redirectTo;
      } else {
        // Fetch data from lead collection if user profile does not exist
        const leadDocRef = doc(db, "lead", email);
        const leadDocSnap = await getDoc(leadDocRef);
        let userData = { email, firstName: user.displayName };

        if (leadDocSnap.exists()) {
          userData = { ...userData, ...leadDocSnap.data() };
        }

        await setDoc(docRef, userData);
        localStorage.setItem("profile", true);
        const redirectTo = redirect_url
          ? redirect_url
          : "/myaccount/cv_upload/";
        window.location.href = redirectTo;
      }
    } else {
      alert("Email is not verified");
      throw new Error("Email is not verified");
    }
  } catch (error) {
    console.log("Error:", error.message);
    Toastify({
      text: error.message
        .split(" ")[2]
        .split("(")[1]
        .split(")")[0]
        .split("/")[1]
        .replaceAll("-", " "),
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
}

// // This function is triggered on user login
// function loginUser(user) {
//   const userId = user.uid;

//   // Check if user profile document exists
//   firebase
//     .firestore()
//     .collection("user_profile")
//     .doc(userId)
//     .get()
//     .then((docSnapshot) => {
//       if (docSnapshot.exists) {
//         console.log("User profile already exists");
//         // Profile exists, no need to copy data
//         return;
//       }

//       // Profile doesn't exist, copy data from lead
//       return firebase.firestore().collection("lead").doc(userId).get();
//     })
//     .then((leadDocSnapshot) => {
//       if (leadDocSnapshot.exists) {
//         const leadData = leadDocSnapshot.data();

//         // Filter and copy only necessary fields (optional)
//         const filteredData = {
//           name: leadData.name,
//           email: leadData.email,
//           phonenumber: leadData.DatephoneNumber,
//           applying_for: applyingFor,
//           created_by: currentUser ? currentUser.email : "",
//           created_datetime: new Date().toISOString(),
//           // Add other relevant fields
//         };

//         // Set user profile document with lead data
//         return firebase
//           .firestore()
//           .collection("user_profile")
//           .doc(userId)
//           .set(filteredData);
//       } else {
//         console.log("Lead document not found for user");
//       }
//     })
//     .catch((error) => {
//       console.error("Error copying data:", error);
//     });
// }
