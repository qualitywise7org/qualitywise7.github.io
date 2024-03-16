// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
// import {
//   getStorage,
//   ref,
//   uploadBytes,
//   getDownloadURL,
// } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";

// import {
//   getFirestore,
//   addDoc,
//   getDoc,
//   setDoc,
//   doc,
//   updateDoc,
//   collection,
// } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", function () {
  const jobListings = document.getElementById("jobListings");

  // Sample data for job listings
  const data = [
    {
      title: "Software Engineer",
      stipend: "$5000",
      role: "Developer",
      location: "New York",
      id: 1,
    },
    {
      title: "Marketing Specialist",
      stipend: "$4000",
      role: "Marketing",
      location: "San Francisco",
      id: 2,
    },
    {
      title: "Data Analyst",
      stipend: "$4500",
      role: "Analyst",
      location: "Chicago",
      id: 3,
    },
    // Add more job listings as needed
  ];

  // Populate the table with data
  data.forEach((job) => {
    const row = document.createElement("tr");
    row.innerHTML = `
              <td>${job.title}</td>
              <td>${job.stipend}</td>
              <td>${job.role}</td>
              <td>${job.location}</td>
          `;
    jobListings.appendChild(row);
  });
});


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

var applied_jobs = {};

const email = localStorage.getItem("email");
if (email) {
  const docRef = doc(db, "jobsapplied", email);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    applied_jobs = docSnap.data();
  }
}
