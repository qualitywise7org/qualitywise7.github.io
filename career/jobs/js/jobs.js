import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";

import {
    getFirestore,
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

const resultsContainer = document.getElementById("results");

// Function to fetch all jobs from Firestore
async function fetchAllJobs() {
    const jobCollectionRef = collection(db, "jobs");
    const jobQuerySnapshot = await getDocs(jobCollectionRef);

    const jobs = [];

    jobQuerySnapshot.forEach((doc) => {
        const jobData = doc.data();
        jobs.push({
            postName: jobData.post_name,
            qualificationEligibility: jobData.qualification_eligibility,
        });
    });

    return jobs;
}

// Function to display paginated jobs
async function displayJobs() {
    const jobs = await fetchAllJobs();

    // Clear existing content in resultsContainer
    resultsContainer.innerHTML = "";

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

        // Create a container for the Bootstrap pagination
        const paginationContainer = document.createElement("nav");
        paginationContainer.classList.add("d-flex", "justify-content-center");

        const paginationUl = document.createElement("ul");
        paginationUl.classList.add("pagination");

        // Create "Previous" button
        const prevPageLi = document.createElement("li");
        prevPageLi.classList.add("page-item");
        if (currentPage === 1) {
            prevPageLi.classList.add("disabled");
        }
        const prevPageLink = document.createElement("a");
        prevPageLink.classList.add("page-link");
        prevPageLink.href = `?page=${currentPage - 1}`;
        prevPageLink.textContent = "Previous";
        prevPageLi.appendChild(prevPageLink);
        paginationUl.appendChild(prevPageLi);

        // Create page number buttons
        const startPage = Math.max(1, currentPage - 1);
        const endPage = Math.min(numPages, currentPage + 1);
        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement("li");
            pageLi.classList.add("page-item");
            if (i === currentPage) {
                pageLi.classList.add("active");
            }
            const pageLink = document.createElement("a");
            pageLink.classList.add("page-link");
            pageLink.href = `?page=${i}`;
            pageLink.textContent = i;
            pageLi.appendChild(pageLink);
            paginationUl.appendChild(pageLi);
        }

        // Create "Next" button
        const nextPageLi = document.createElement("li");
        nextPageLi.classList.add("page-item");
        if (currentPage === numPages) {
            nextPageLi.classList.add("disabled");
        }
        const nextPageLink = document.createElement("a");
        nextPageLink.classList.add("page-link");
        nextPageLink.href = `?page=${currentPage + 1}`;
        nextPageLink.textContent = "Next";
        nextPageLi.appendChild(nextPageLink);
        paginationUl.appendChild(nextPageLi);

        paginationContainer.appendChild(paginationUl);
        jobsDiv.appendChild(paginationContainer);
    } else {
        jobsDiv.innerHTML = `<p class="text-center">No jobs found.</p>`;
    }

    resultsContainer.appendChild(jobsDiv);
}

// Call the displayJobs function when the page loads
displayJobs();
