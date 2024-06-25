// Ensure the Firebase SDKs are imported if not using the module bundler
// Importing Firebase functions for storage and Firestore
// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

console.log("script.js loaded");

// const firebaseConfig = {
//   apiKey: "AIzaSyDzoJJ_325VL_axuuAFzDf3Bwt_ENzu2rM",
//   authDomain: "jobsdoor360-39b87.firebaseapp.com",
//   databaseURL: "https://jobsdoor360-39b87-default-rtdb.firebaseio.com",
//   projectId: "jobsdoor360-39b87",
//   storageBucket: "jobsdoor360-39b87.appspot.com",
//   messagingSenderId: "326416618185",
//   appId: "1:326416618185:web:de19e90fe4f06006ef3318",
//   measurementId: "G-60RHEMJNM6"
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const storage = getStorage(app);

const emailApply = localStorage.getItem("emailApply");
let userEmail = '';
if (emailApply) {
    userEmail = emailApply;
} else {
    window.location.href = "/login/";
}
let cvUrl = "";
let skills = [];

async function uploadCV(file) {
    const cvRef = ref(storage, "user_cv/" + file.name);
    await uploadBytes(cvRef, file);

    const url = await getDownloadURL(cvRef);
    return url; // Return empty string if URL is undefined
}

async function saveCVToDatabase() {
    const uploadButton = document.getElementById("btn");
    uploadButton.innerHTML = "Uploading...";
    uploadButton.disabled = true;

    const cvFile = document.getElementById("cv").files[0];
    const skillsInput = document.getElementById("skills").value;
    const college = document.getElementById("college").value;


    if (cvFile) {
        cvUrl = await uploadCV(cvFile);

        if (skillsInput) {
            skills = skillsInput.split(',').map(skill => skill.trim());
        }

        const userProfileRef = doc(db, "lead", userEmail);
        await updateDoc(userProfileRef, {
            "about.cv": cvUrl,
            "about.skills": skills,
            "about.college": college
        })
            .then(() => {
                Toastify({
                    text: "Information Successfully Submitted",
                    duration: 3000,
                    newWindow: true,
                    close: true,
                    gravity: "top",
                    position: "right",
                    stopOnFocus: true,
                    style: {
                        background: "linear-gradient(to right, #0d6efd, #586ba6)",
                        borderRadius: "10px"
                    }
                }).showToast();

                setTimeout(() => {
                    window.location.href = "http://127.0.0.1:5501/login/";
                }, 1000);
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }

    uploadButton.innerHTML = "UPLOAD RESUME";
    uploadButton.disabled = false;
}

$("#btn").on("click", function () {
    saveCVToDatabase();
});