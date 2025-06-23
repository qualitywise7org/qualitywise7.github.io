// Import Firebase configuration and utilities
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  writeBatch,
  setDoc,
  addDoc,
  updateDoc,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";

// Firebase configuration
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
const db = getFirestore(app);



let userId = null;
let userData = {};

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in to attempt an assessment");
    window.location.href = "/";
  }
});

async function fetchAssessments() {
  try {
    console.log(`Fetching assessments`);
    const assessmentsQuery = query(collection(db, "assessment"), orderBy("title", "asc"));
    let querySnapshot = await getDocs(assessmentsQuery);
    console.log(`Assessments found`);
    displayCards(querySnapshot);
  } catch (error) {
    console.error("Failed to fetch assessments:", error);
    return null;
  }
}

function displayCards(assessments) {
  const divCont = document.getElementById("assessment");

  let content = [];
  assessments.forEach((doc) => {
    let assessment = doc.data();
    content.push(`
      <div class="assessment-box">
        <h2 class="assessment-title">${assessment.title}</h2>
        <form action="/test/quiz/" method="get">
          <input type="hidden" name="quizcode" value="${doc.id}">
          <button type="submit" class="btn-start">Start Assessment</button>
        </form>
      </div>
    `);
  });
  divCont.innerHTML = content.join('');

setupSearch();
}



function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const assessmentBoxes = Array.from(document.getElementsByClassName("assessment-box"));

  searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase();
    assessmentBoxes.forEach(box => {
      const title = box.querySelector(".assessment-title").textContent.toLowerCase();
      box.style.display = title.includes(searchValue) ? "flex" : "none";
    });
  });
}

// Initial fetch of assessments
fetchAssessments();