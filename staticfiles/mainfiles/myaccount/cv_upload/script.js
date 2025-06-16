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

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

let userEmail = null;

// Auth check
onAuthStateChanged(auth, (user) => {
  if (user) {
    userEmail = user.email;
  } else {
    console.log("No user is signed in");
    window.location.href = `/login/?redirect_url=${encodeURIComponent(window.location.href)}`;
  }
});

async function uploadCV(file) {
  const fileName = `${userEmail.replace(/[^a-zA-Z0-9]/g, "_")}_${file.name}`;
  const cvRef = ref(storage, "user_cv/" + fileName);
  await uploadBytes(cvRef, file);
  return await getDownloadURL(cvRef);
}

async function saveCVToDatabase() {
  const uploadButton = document.getElementById("btn");
  uploadButton.innerHTML = "Uploading...";
  uploadButton.disabled = true;

  const cvFile = document.getElementById("cv").files[0];
  if (!cvFile) {
    Toastify({ text: "Please select a file", duration: 3000, style: { background: "red" } }).showToast();
    uploadButton.innerHTML = "UPLOAD RESUME";
    uploadButton.disabled = false;
    return;
  }

  try {
    const cvUrl = await uploadCV(cvFile);
    const userProfileRef = doc(db, "user_profile", userEmail);

    const docSnap = await getDoc(userProfileRef);
    if (!docSnap.exists()) {
      await setDoc(userProfileRef, { about: {} });
    }

    await updateDoc(userProfileRef, {
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

  } catch (error) {
    console.error("Upload error:", error);
    Toastify({ text: "Upload failed", duration: 3000, style: { background: "red" } }).showToast();
  }

  uploadButton.innerHTML = "UPLOAD RESUME";
  uploadButton.disabled = false;
}

document.getElementById("btn").addEventListener("click", saveCVToDatabase);
