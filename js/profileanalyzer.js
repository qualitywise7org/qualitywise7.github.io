import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDoc,
    doc,
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
        defaultOption.textContent = `Select ${collectionName}`;
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
    populateSelectOptions("jobtype", jobTypeSelect);
    populateSelectOptions("industry", industrySelect);
    populateSelectOptions("profile", profileSelect);
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
        const profileCollectionRef = collection(db, "profile");
        const profileSnapshot = await getDocs(profileCollectionRef);

        let foundProfileData = null;

        profileSnapshot.forEach((doc) => {
            const profileData = doc.data();

            if (
                (selectedJobType === "" ||
                    profileData.type_code === selectedJobType) &&
                profileData.industry_code === selectedIndustry &&
                profileData.code === selectedProfile
            ) {
                foundProfileData = profileData;
            }
        });

        if (foundProfileData) {
            displayResults(foundProfileData, selectedProfile);
        } else {
            resultsContainer.textContent = "No results found.";
        }
    } catch (error) {
        console.error("Error fetching profile data:", error);
    }
});

// Function to display results in the resultsContainer
async function displayResults(profileData, selectedProfile) {
    const requiredProfile = profileData.required_profile.map(
        (profile) => profile
    );
    const handsOnSkills = profileData.minimum_hands_on_skills.map(
        (skill) => skill
    );

    const resultsContainer = document.getElementById("results");

    // Clear previous results
    resultsContainer.innerHTML = "";

    // Create and append div for required profile
    const requiredProfileDiv = document.createElement("div");
    requiredProfileDiv.classList.add("result-field");
    requiredProfileDiv.innerHTML = `
        <h2>Required Profile:</h2>
        <p>${requiredProfile.join(", ")}</p>
    `;
    resultsContainer.appendChild(requiredProfileDiv);

    // Create and append div for minimum hands-on skills
    const handsOnSkillsDiv = document.createElement("div");
    handsOnSkillsDiv.classList.add("result-field");
    handsOnSkillsDiv.innerHTML = `
        <h2>Minimum Hands-On Skills:</h2>
        <p>${handsOnSkills.join(", ")}</p>
    `;
    resultsContainer.appendChild(handsOnSkillsDiv);

    // Check for companies hiring for this role
    const jobsCollectionRef = collection(db, "jobs");
    const jobsQuerySnapshot = await getDocs(jobsCollectionRef);

    const companiesHiring = [];

    jobsQuerySnapshot.forEach((doc) => {
        const jobData = doc.data();

        if (jobData.profile_code === selectedProfile) {
            companiesHiring.push(jobData.company_name);
        }
    });

    if (companiesHiring.length > 0) {
        // Create and append div for companies hiring
        const companiesHiringDiv = document.createElement("div");
        companiesHiringDiv.classList.add("result-field");
        companiesHiringDiv.innerHTML = `
            <h2>Companies hiring for this role:</h2>
            <p>${companiesHiring.join(", ")}</p>
        `;
        resultsContainer.appendChild(companiesHiringDiv);
    }
}
