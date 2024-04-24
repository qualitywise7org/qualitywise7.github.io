const email = JSON.parse(localStorage.getItem("user")).email;
if (!email) {
    window.location.href = "/login/?redirect_url=hiring";
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";

import {
    getFirestore,
    addDoc,
    getDoc,
    setDoc,
    doc,
    updateDoc,
    collection,
    getDocs,
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const storageRef = ref(storage);

document.addEventListener("DOMContentLoaded", async function () {
    const jobListings = document.getElementById("jobListings");

    try {
        const querySnapshot = await getDocs(collection(db, "hiring"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");
            row.innerHTML = `
        <td>${data.title || "NOT DISCLOSED"}</td>
        <td>${"₹" + data.stipend || "NOT DISCLOSED"}</td>
        <td>${data.role || "NOT DISCLOSED"}</td>
        <td>${data.location || "NOT DISCLOSED"}</td>
        <td>${data.company_name || "NOT DISCLOSED"}</td>
        <td><a href="${data.job_description_doc || "#"}">Click Here</a></td>
        <td><button class="applyButton" data-jobid="${doc.id
                }">Apply</button></td>
      `;
            jobListings.appendChild(row);
        });
    } catch (error) {
        console.error("Error retrieving job listings:", error);
    }

    if (email) {
        try {
            const appliedJobsRef = doc(db, "jobsapplied", email);
            const docSnap = await getDoc(appliedJobsRef);
            if (docSnap.exists()) {
                const appliedJobs = docSnap.data();

                for (const jobId in appliedJobs) {
                    const button = document.querySelector(
                        `.applyButton[data-jobid="${jobId}"]`
                    );
                    if (button) {
                        button.textContent = "Applied";
                        button.style.backgroundColor = "#45a049";
                        button.disabled = true;
                    }
                }
            }
        } catch {
            console.log("error");
        }
    }

    // Add event listener for Apply buttons
    const applyButtons = document.querySelectorAll(".applyButton");
    applyButtons.forEach((button) => {
        button.addEventListener("click", applyForJob);
    });

    async function applyForJob(event) {
        const button = event.target;
        const jobId = button.dataset.jobid;
        const email = JSON.parse(localStorage.getItem("user")).email;

        if (email) {
            try {
                const docRef = doc(db, "jobsapplied", email);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    updateDoc(docRef, { [jobId]: true });
                    console.log("Job application updated");
                } else {
                    await setDoc(docRef, { [jobId]: true });
                    console.log("Job application added");
                }

                // Update button properties
                button.textContent = "Applied";
                button.style.backgroundColor = "#45a049";
                button.disabled = true;
            } catch (error) {
                console.error("Error applying for job:", error);
            }

            try {
                const docRef = doc(db, "hiring", jobId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const jobData = docSnap.data();
                    const appliedCandidates = jobData.appliedCandidates || [];

                    if (!appliedCandidates.includes(email)) {
                        appliedCandidates.push(email);
                        await updateDoc(docRef, { appliedCandidates });
                        console.log("Candidate added to the list of applied candidates");
                    } else {
                        console.log("Candidate already applied for this job");
                    }
                } else {
                    console.log("Job document does not exist");
                }
            } catch (error) {
                console.error("Error updating applied candidates list:", error);
            }
        } else {
            alert("You are not logged In. Please login");
        }
    }
});
