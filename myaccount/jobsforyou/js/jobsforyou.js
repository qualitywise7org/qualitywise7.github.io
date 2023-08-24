import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    where,
    query,
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

const resultsContainer = document.getElementById("results");

// Get the authenticated user's ID
let userId = null;
let userData = {};
onAuthStateChanged(auth, async (user) => {
    userId = user.uid;

    try {
        const userDocRef = doc(db, "users", userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
            userData = userDocSnapshot.data();

            fetchAndUseJobs();
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
});

// Function to get the name from collection based on code
async function getNameFromCollection(collectionName, code) {
    const querySnapshot = await getDocs(
        query(collection(db, collectionName), where("code", "==", code))
    );

    return querySnapshot.empty ? "" : querySnapshot.docs[0].data().name || "";
}

async function fetchAndUseJobs() {
    const graduationDegreeCode = userData.graduationDegree || "";
    const pgDegreeCode = userData.pgDegree || "";

    const graduationDegreeName = await getNameFromCollection(
        "degree_masterdata ",
        graduationDegreeCode
    );

    const pgDegreeName = await getNameFromCollection(
        "degree_masterdata ",
        pgDegreeCode
    );

    const jobCollectionRef = collection(db, "freejobalert_jobs");
    const jobQuerySnapshot = await getDocs(jobCollectionRef);

    const jobsToShow = [];

    jobQuerySnapshot.forEach((doc) => {
        const jobData = doc.data();
        const qualificationEligibility =
            jobData.qualification_eligibility.toLowerCase();

        const includesGraduation =
            graduationDegreeName &&
            qualificationEligibility.includes(
                graduationDegreeName.toLowerCase()
            );

        const includesPG =
            pgDegreeName &&
            qualificationEligibility.includes(pgDegreeName.toLowerCase());

        if (
            qualificationEligibility.includes("12th") ||
            qualificationEligibility.includes("10+2") ||
            includesGraduation ||
            includesPG
        ) {
            jobsToShow.push({
                postName: jobData.post_name,
                qualificationEligibility: qualificationEligibility,
            });
        }
    });

    displayJobs(jobsToShow);
}

// Function to display results in the resultsContainer

async function displayJobs(jobs) {
    const jobsPerPage = 5;
    const numPages = Math.ceil(jobs.length / jobsPerPage);

    // Get the current page number from URL query parameters (if available)
    const urlSearchParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlSearchParams.get("page")) || 1;

    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;

    const paginatedJobs = jobs.slice(startIndex, endIndex);

    const jobsDiv = document.createElement("div");
    jobsDiv.classList.add("row");

    // Hide the loading element
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = "none";

    // Display paginated jobs
    if (paginatedJobs.length > 0) {
        paginatedJobs.forEach((job) => {
            const jobDiv = document.createElement("div");
            jobDiv.classList.add("mb-3");

            jobDiv.innerHTML = `
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${job.postName}</h5>
                        <p class="card-text"><strong>Eligibility: </strong>${job.qualificationEligibility}</p>
                    </div>
                </div>
            `;

            jobsDiv.appendChild(jobDiv);
        });

        // Add pagination
        const paginationContainer = document.createElement("nav");
        paginationContainer.setAttribute("aria-label", "Page navigation");
        paginationContainer.classList.add("d-flex", "justify-content-center");
        const paginationUl = document.createElement("ul");
        paginationUl.classList.add("pagination");

        for (let i = 1; i <= numPages; i++) {
            const pageLi = document.createElement("li");
            pageLi.classList.add("page-item");
            const pageLink = document.createElement("a");
            pageLink.classList.add("page-link");
            pageLink.href = `?page=${i}`;
            pageLink.textContent = i;
            if (i === currentPage) {
                pageLi.classList.add("active");
            }
            pageLi.appendChild(pageLink);
            paginationUl.appendChild(pageLi);
        }

        paginationContainer.appendChild(paginationUl);
        jobsDiv.appendChild(paginationContainer);
    } else {
        jobsDiv.innerHTML = `<p class="text-center">No jobs found.</p>`;
    }

    resultsContainer.appendChild(jobsDiv);
}
