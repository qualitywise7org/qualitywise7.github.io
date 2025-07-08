// No import statements needed!

let userEmail = null;

// ✅ AUTH CHECK
window.onAuthStateChanged(window.auth, (user) => {
  if (user) {
    userEmail = user.email;
  } else {
    console.log("No user is signed in");
    const currentUrl = encodeURIComponent(window.location.href);
    window.location.href = `/login/?redirect_url=${currentUrl}`;
  }
});

// ✅ UPLOAD CV TO STORAGE
async function uploadCV(file) {
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const storageRef = window.ref(window.storage, `user_cv/${userEmail}_${sanitizedFileName}`);
  await window.uploadBytes(storageRef, file);
  return await window.getDownloadURL(storageRef);
}

// ✅ SAVE CV URL TO FIRESTORE
async function saveCVToDatabase() {
  // ...rest of your code, but use window.doc, window.getDoc, etc...
  const uploadButton = document.getElementById("btn");
  const fileInput = document.getElementById("cv");
  const file = fileInput.files[0];

  if (!file) {
    Toastify({
      text: "Please select a file",
      duration: 3000,
      style: { background: "red" }
    }).showToast();
    return;
  }

  uploadButton.disabled = true;
  uploadButton.innerText = "Uploading...";

  try {
    const cvUrl = await uploadCV(file);
    const userRef = window.doc(window.db, "user_profile", userEmail);
    const userSnap = await window.getDoc(userRef);

    if (!userSnap.exists()) {
      await window.setDoc(userRef, { about: {} });
    }

    await window.updateDoc(userRef, {
      "about.cv": cvUrl
    });

    Toastify({
      text: "CV Successfully Submitted",
      duration: 2000,
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
    }, 2000);

  } catch (err) {
    console.error("Upload failed:", err);
    Toastify({
      text: "Upload failed",
      duration: 3000,
      style: { background: "red" }
    }).showToast();
  }

  uploadButton.disabled = false;
  uploadButton.innerText = "UPLOAD RESUME";
}

// ✅ HANDLE BUTTON CLICK
document.addEventListener("DOMContentLoaded", async function () {
  const uploadBtn = document.getElementById("btn");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", saveCVToDatabase);
  }

  // Parse all query params and auto-fill matching input fields by name or id
  const urlParams = new URLSearchParams(window.location.search);
  let hasRelevantParam = false;

  urlParams.forEach((value, key) => {
    if (key === "email") {
      const si = document.getElementById("searchInput");
      if (si) {
        si.value = value;
        hasRelevantParam = true;
      }
      return;
    }
    // Try to find input by id or name
    let input = document.getElementById(key) || document.querySelector(`[name='${key}']`);
    if (input) {
      input.value = value;
      hasRelevantParam = true;
    }
  });

  // If any relevant param is present, trigger search
  if (hasRelevantParam) {
    await updateTable();
  }

  await isUser();

  document.querySelector("form").addEventListener("submit", function(e) {
    e.preventDefault();
  });
});