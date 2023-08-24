import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDzoJJ_325VL_axuuAFzDf3Bwt_ENzu2rM",
    authDomain: "jobsdoor360-39b87.firebaseapp.com",
    databaseURL: "https://jobsdoor360-39b87-default-rtdb.firebaseio.com",
    projectId: "jobsdoor360-39b87",
    storageBucket: "jobsdoor360-39b87.appspot.com",
    messagingSenderId: "326416618185",
    appId: "1:326416618185:web:de19e90fe4f06006ef3318",
    measurementId: "G-60RHEMJNM6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getFirestore();

// Get the authenticated user's ID
let userId = null;
let userData = {};
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;

        try {
            const userDocRef = doc(db, "users", userId);
            const userDocSnapshot = await getDoc(userDocRef);

            if (userDocSnapshot.exists()) {
                userData = userDocSnapshot.data();

                populateUserDetails();
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    } else {
        window.location.href = "/login/";
    }
});

// Function to populate user details
function populateUserDetails() {
    const fullNameElement = document.getElementById("fullName");
    const emailElement = document.getElementById("email");
    const twelfthDetailsElement = document.getElementById("twelfthDetails");
    const diplomaDetailsElement = document.getElementById("diplomaDetails");
    const graduationDetailsElement =
        document.getElementById("graduationDetails");
    const pgDetailsElement = document.getElementById("pgDetails");

    // Populate personal information
    fullNameElement.textContent = userData.full_name || "";
    emailElement.textContent = userData.email || "";

    // Populate education details
    twelfthDetailsElement.textContent = `${userData.twelfthSubject || ""} - ${
        userData.twelfthPercentage || ""
    }`;
    diplomaDetailsElement.textContent = `${userData.diplomaStream || ""} - ${
        userData.diplomaName || ""
    }`;
    graduationDetailsElement.textContent = `${
        userData.graduationStream || ""
    } - ${userData.graduationDegree || ""} - ${
        userData.graduationPercentage || ""
    }`;
    pgDetailsElement.textContent = `${userData.pgStream || ""} - ${
        userData.pgDegree || ""
    } - ${userData.pgPercentage || ""}`;
}

const logoutButton = document.getElementById("logout-btn");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        signOut(auth)
            .then(() => {
                window.location.href = "/login/";
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            });
    });
}

// document.addEventListener("DOMContentLoaded", function () {
//     const resumeInput = document.getElementById("resumeInput");
//     const selectedFile = document.getElementById("selectedFile");

//     resumeInput.addEventListener("change", function () {
//         const file = this.files[0];
//         if (file) {
//             selectedFile.textContent = `Selected file: ${file.name}`;
//         } else {
//             selectedFile.textContent = "No file selected";
//         }
//     });
// });

// JavaScript to trigger the modal
document
    .getElementById("openModalButton")
    .addEventListener("click", function () {
        var myModal = new bootstrap.Modal(document.getElementById("myModal"));
        myModal.show();
    });

async function populateSelectOptions(collectionName, selectElement) {
    try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        selectElement.innerHTML = `<option value="" disabled selected>Select</option>`;

        snapshot.forEach((doc) => {
            const data = doc.data();
            selectElement.innerHTML += `<option value="${data.name}">${data.name}</option>`;
        });
    } catch (error) {
        console.error(`Error fetching ${collectionName} options:`, error);
    }
}

// Populate options on page load
window.addEventListener("DOMContentLoaded", () => {
    populateSelectOptions(
        "subject_masterdata",
        document.getElementById("twelfthSubject")
    );
    populateSelectOptions(
        "branch_masterdata ",
        document.getElementById("diplomaStream")
    );
    populateSelectOptions(
        "branch_masterdata ",
        document.getElementById("graduationStream")
    );
    populateSelectOptions(
        "branch_masterdata ",
        document.getElementById("pgStream")
    );
    populateSelectOptions(
        "diploma_masterdata",
        document.getElementById("diplomaName")
    );
    populateDegreeOptions("graduationDegree", "graduation");
    populateDegreeOptions("pgDegree", "post_graduation");
});

async function populateDegreeOptions(degreeSelectId, level) {
    const degreeSelect = document.getElementById(degreeSelectId);

    try {
        const collectionRef = collection(db, "degree_masterdata ");
        const snapshot = await getDocs(collectionRef);

        degreeSelect.innerHTML = `<option value="" disabled selected>Select Degree</option>`;

        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.level === level) {
                degreeSelect.innerHTML += `<option value="${data.name}">${data.name}</option>`;
            }
        });
    } catch (error) {
        console.error(`Error fetching degree options:`, error);
    }
}

// Handle the form submission
const saveButton = document.getElementById("saveDetails");
saveButton.addEventListener("click", async () => {
    const twelfthSubject = document.getElementById("twelfthSubject").value;
    const twelfthPercentage =
        document.getElementById("twelfthPercentage").value;
    const diplomaStream = document.getElementById("diplomaStream").value;
    const diplomaName = document.getElementById("diplomaName").value;
    const graduationStream = document.getElementById("graduationStream").value;
    const graduationDegree = document.getElementById("graduationDegree").value;
    const graduationPercentage = document.getElementById(
        "graduationPercentage"
    ).value;
    const pgStream = document.getElementById("pgStream").value;
    const pgDegree = document.getElementById("pgDegree").value;
    const pgPercentage = document.getElementById("pgPercentage").value;

    try {
        await updateUserData(userId, {
            twelfthSubject,
            twelfthPercentage,
            diplomaStream,
            diplomaName,
            graduationStream,
            graduationDegree,
            graduationPercentage,
            pgStream,
            pgDegree,
            pgPercentage,
        });
        alert("Data saved successfully.");
    } catch (error) {
        console.log(error);
        alert("Error saving data:", error);
    }
});

// Function to update user data in Firestore
async function updateUserData(userId, data) {
    const userRef = doc(db, "users", userId);

    const updatedData = {};

    for (const [key, value] of Object.entries(data)) {
        if (value !== "") {
            updatedData[key] = value;
        }
    }

    try {
        await updateDoc(userRef, updatedData);
        console.log("Data saved successfully.");
    } catch (error) {
        console.error("Error saving data:", error);
    }
}
