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
    const jobListings = document.getElementById('jobListings');
    const appliedJobsRef = collection(db, 'jobsapplied');

    // Fetch applied jobs from the database
    const appliedJobsSnapshot = await getDoc(appliedJobsRef);
    const appliedJobs = appliedJobsSnapshot.docs.map(doc => doc.data().id);

    const data = [
        { id: 1, title: "Software Engineer", stipend: "5000", role: "Developer", location: "abc" },
        { id: 2, title: "Marketing Specialist", stipend: "4000", role: "Marketing", location: "bac" },
        { id: 3, title: "Data Analyst", stipend: "4500", role: "Analyst", location: "asb" } 
    ];

    // Filter out jobs that are not already applied for
    const filteredData = data.filter(job => !appliedJobs.includes(job.id));

    // Populate the table with filtered data
    filteredData.forEach(job => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${job.title}</td>
            <td>${'₹'+job.stipend}</td>
            <td>${job.role}</td>
            <td>${job.location}</td>
            <td><button class="applyButton" data-jobid="${job.id}">Apply</button></td>
        `;
        jobListings.appendChild(row);
    });

    // Add event listener for Apply buttons
    const applyButtons = document.querySelectorAll('.applyButton');
    applyButtons.forEach(button => {
        button.addEventListener('click', applyForJob);
    });

    async function applyForJob(event) {
        const jobId = event.target.dataset.jobid;
        await addDoc(collection(db, 'jobsapplied', email), { id: jobId });
        
        console.log(`Applying for job with ID: ${jobId}`);
    }
});
