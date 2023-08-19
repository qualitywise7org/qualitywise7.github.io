import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

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

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore();

// Get references to HTML elements
const jobTypeSelect = document.getElementById("jobType");
const industrySelect = document.getElementById("industry");
const profileSelect = document.getElementById("profile");

const submitButton = document.getElementById("submitButton");
const resultsContainer = document.getElementById("results");

// Function to populate select options
async function populateSelectOptions(collectionName, selectElement) {
    try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        // Add a default "Select" option
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = `Select`;
        selectElement.appendChild(defaultOption);

        snapshot.forEach((doc) => {
            const data = doc.data();
            const option = document.createElement("option");
            option.value = data.code;
            option.textContent = data.name;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error(`Error fetching ${collectionName} options:`, error);
    }
}

// Call the function to populate select options when the page is loaded
window.addEventListener("load", () => {
    populateSelectOptions("masterdata_jobtype", jobTypeSelect);
    populateSelectOptions("industry_masterdata ", industrySelect);
    populateSelectOptions("profile_masterdata ", profileSelect);
});

// Function to display results based on user selections
submitButton.addEventListener("click", async () => {
    const selectedJobType = jobTypeSelect.value;
    const selectedIndustry = industrySelect.value;
    const selectedProfile = profileSelect.value;

    // Clear previous results
    resultsContainer.textContent = "";
    resultsContainer.classList.add("results-visible");

    try {
        const postCollectionRef = collection(db, "freejobalert_posts");
        const postSnapshot = await getDocs(postCollectionRef);

        let foundPostData = null;

        postSnapshot.forEach((doc) => {
            const postData = doc.data();

            if (
                (selectedJobType === "" ||
                    postData.jobtype_masterdata_code === selectedJobType) &&
                postData.industry_masterdata_code === selectedIndustry &&
                postData.profile_masterdata_code === selectedProfile
            ) {
                foundPostData = postData;
            }
        });

        if (foundPostData) {
            displayResults(selectedProfile);
        } else {
            resultsContainer.textContent = "No results found.";
        }
    } catch (error) {
        console.error("Error fetching profile data:", error);
    }
});

// Function to display results in the resultsContainer
async function displayResults(selectedProfile) {
    const resultsContainer = document.getElementById("results");

    const jobsCollectionRef = collection(db, "freejobalert_jobs");
    const jobsQuerySnapshot = await getDocs(jobsCollectionRef);

    const jobs = [];

    jobsQuerySnapshot.forEach((doc) => {
        const jobsData = doc.data();

        // Split the lines of jobsData.post_code and check for a match
        const postCodes = jobsData.profile_masterdata_code.split("\n");

        if (
            postCodes.some(
                (postCode) =>
                    postCode.trim().toLowerCase() ===
                    selectedProfile.trim().toLowerCase()
            )
        ) {
            const job = {
                postName: jobsData.post_name,
                qualificationEligibility: jobsData.qualification_eligibility,
            };
            jobs.push(job);
        }
    });

    if (jobs.length > 0) {
        const jobsDiv = document.createElement("div");
        jobsDiv.classList.add("result-field");
        jobsDiv.innerHTML = `
            <h2>Jobs for you</h2>
        `;

        jobs.forEach((job) => {
            const jobDiv = document.createElement("div");
            jobDiv.classList.add("job-info");
            jobDiv.innerHTML = `
                <h3>Job Post: ${job.postName}</h3>
                <p>Qualification Eligibility: ${job.qualificationEligibility}</p>
            `;
            jobsDiv.appendChild(jobDiv);
        });

        resultsContainer.appendChild(jobsDiv);
    }
}
