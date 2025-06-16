import {
  getAuth,
  onAuthStateChanged
} from "firebase/auth";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

// Firebase initialization (you must already have this in your main project setup)
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

let userEmail = null;

// ✅ AUTH CHECK
onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmail = user.email;
  } else {
    console.log("No user is signed in");
    // Redirect to login with return URL
    const currentUrl = encodeURIComponent(window.location.pathname);
    window.location.href = `/login/?redirect_url=${currentUrl}`;
  }
});

// ✅ UPLOAD CV TO STORAGE
async function uploadCV(file) {
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const storageRef = ref(storage, `user_cv/${userEmail}_${sanitizedFileName}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ✅ SAVE CV URL TO FIRESTORE
async function saveCVToDatabase() {
  const uploadButton = document.getElementById("btn");
  const fileInput = document.getElementById("cv");
  const file = fileInput.files[0];

  if (!file) {
    Toastify({ text: "Please select a file", duration: 3000, style: { background: "red" } }).showToast();
    return;
  }

  uploadButton.disabled = true;
  uploadButton.innerText = "Uploading...";

  try {
    const cvUrl = await uploadCV(file);
    const userRef = doc(db, "user_profile", userEmail);

    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, { about: {} });
    }

    await updateDoc(userRef, {
      "about.cv": cvUrl
    });

    Toastify({
      text: "CV Successfully Submitted",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      style: {
        background: "linear-gradient(to right, #0d6efd, #586ba6)",
        borderRadius: "10px"
      }
    }).showToast();

    setTimeout(() => {
      window.location.href = "/myaccount/";
    }, 3000);

  } catch (err) {
    console.error("Upload failed:", err);
    Toastify({ text: "Upload failed", duration: 3000, style: { background: "red" } }).showToast();
  }

  uploadButton.disabled = false;
  uploadButton.innerText = "UPLOAD RESUME";
}

// ✅ HANDLE BUTTON CLICK
document.getElementById("btn").addEventListener("click", saveCVToDatabase);
