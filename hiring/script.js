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

  const data = [
    {
      id: 1,
      title: "Web-Developer",
      stipend: "8000",
      role: "Developer",
      location: "Remote",
    },
    {
      id: 2,
      title: "Marketing Specialist",
      stipend: "4000",
      role: "Marketing",
      location: "bac",
    },
    {
      id: 3,
      title: "Data Analyst",
      stipend: "4500",
      role: "Analyst",
      location: "asb",
    },
  ];

  data.forEach((job) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${job.title}</td>
      <td>${"₹" + job.stipend}</td>
      <td>${job.role}</td>
      <td>${job.location}</td>
      <td><button class="applyButton" data-jobid="${job.id}">Apply</button></td>
  `;
    jobListings.appendChild(row);
  });

  const email = localStorage.getItem("email");

  if (email) {
    console.log("Email " + email);
    try {
      const appliedJobsRef = doc(db, "jobsapplied", email);
      const docSnap = await getDoc(appliedJobsRef);
      if (docSnap.exists()) {
        const appliedJobs = docSnap.data();
        console.log(appliedJobs);

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
    const email = localStorage.getItem("email");

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
    } else {
      alert("You are not logged In. Please login");
    }
  }
}); 