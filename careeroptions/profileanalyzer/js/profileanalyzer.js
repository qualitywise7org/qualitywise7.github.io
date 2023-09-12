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

// Function to fetch data from Firestore and store it in local storage
async function fetchDataFromFirestoreAndStore(collectionName, localStorageKey) {
    try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        const data = [];
        snapshot.forEach((doc) => {
            data.push(doc.data());
        });

        // Store the data in local storage as JSON
        localStorage.setItem(localStorageKey, JSON.stringify(data));
    } catch (error) {
        console.error(
            `Error fetching and storing ${collectionName} data:`,
            error
        );
    }
}

// Function to populate select options from local storage
function populateSelectOptionsFromLocalStorage(localStorageKey, selectElement) {
    const data = JSON.parse(localStorage.getItem(localStorageKey));

    if (data) {
        // Add an "All" option
        const allOption = document.createElement("option");
        allOption.value = "All";
        allOption.textContent = `All`;
        selectElement.appendChild(allOption);

        data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.code;
            option.textContent = item.name;
            selectElement.appendChild(option);
        });
    }
}

// Call the function to fetch and store data if not already in local storage
const jobTypeLocalStorageKey = "jobTypeData";
if (!localStorage.getItem(jobTypeLocalStorageKey)) {
    fetchDataFromFirestoreAndStore(
        "jobtype_masterdata",
        jobTypeLocalStorageKey
    );
}

const industryLocalStorageKey = "industryData";
if (!localStorage.getItem(industryLocalStorageKey)) {
    fetchDataFromFirestoreAndStore(
        "industry_masterdata ",
        industryLocalStorageKey
    );
}

const profileLocalStorageKey = "profileData";
if (!localStorage.getItem(profileLocalStorageKey)) {
    fetchDataFromFirestoreAndStore(
        "profile_masterdata ",
        profileLocalStorageKey
    );
}

// Call the function to populate select options when the page is loaded
window.addEventListener("load", () => {
    // Call the function to populate select options from local storage
    populateSelectOptionsFromLocalStorage(
        jobTypeLocalStorageKey,
        jobTypeSelect
    );
    populateSelectOptionsFromLocalStorage(
        industryLocalStorageKey,
        industrySelect
    );
    populateSelectOptionsFromLocalStorage(
        profileLocalStorageKey,
        profileSelect
    );

    // Check if URL parameters are present and apply them
    const urlSearchParams = new URLSearchParams(window.location.search);

    const urlJobType = urlSearchParams.get("jobType");
    const urlIndustry = urlSearchParams.get("industry");
    const urlProfile = urlSearchParams.get("profile");

    const currentPage = parseInt(urlSearchParams.get("page")) || 1;

    setTimeout(() => {
        if (urlJobType) {
            jobTypeSelect.value = urlJobType;
        }
        if (urlIndustry) {
            industrySelect.value = urlIndustry;
        }
        if (urlProfile) {
            profileSelect.value = urlProfile;
        }

        if (urlJobType || urlIndustry || urlProfile) {
            displayResults(urlProfile, currentPage);
        } else {
            displayJobs(currentPage);
        }
    }, 1000);

    if (!urlJobType && !urlIndustry && !urlProfile) {
        displayJobs();
    }
});

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
            postDate: jobData.post_date,
            lastDate: jobData.last_date,
            jobCode: jobData.job_code,
        });
    });

    return jobs;
}

// Function to render paginated jobs and generate pagination controls
function renderPaginatedJobsAndControls(jobs, currentPage) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    const jobsPerPage = 10;
    const numPages = Math.ceil(jobs.length / jobsPerPage);

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
            <a href="/careeroptions/singlejob/?jobCode=${
                job.jobCode
            }&postDate=${job.postDate}", target="_blank">
            <div class="card-body">
                <h5 class="card-title">${job.postName}</h5>
                ${
                    job.postDate
                        ? `<p><strong>Post Date: </strong>${job.postDate}</p>`
                        : ""
                }
                ${
                    job.lastDate
                        ? `<p><strong>Last Date: </strong>${job.lastDate}</p>`
                        : ""
                }
                <p><strong>Eligibility: </strong>${
                    job.qualificationEligibility
                }</p>
            </div>
            </a>
        </div>
            `;

            jobsDiv.appendChild(jobDiv);
        });

        // Generate pagination controls
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
        prevPageLink.href = `?${getSearchParams()}&page=${currentPage - 1}`;
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
            pageLink.href = `?${getSearchParams()}&page=${i}`;
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
        nextPageLink.href = `?${getSearchParams()}&page=${currentPage + 1}`;
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

// Function to get the current URL search parameters
function getSearchParams() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const selectedJobType = jobTypeSelect.value;
    const selectedIndustry = industrySelect.value;
    const selectedProfile = profileSelect.value;

    // Remove existing "page" parameter if it exists
    urlSearchParams.delete("page");

    // Include selected options in the URL when they are not "All"
    if (selectedJobType !== "All") {
        urlSearchParams.set("jobType", selectedJobType);
    } else {
        urlSearchParams.delete("jobType");
    }
    if (selectedIndustry !== "All") {
        urlSearchParams.set("industry", selectedIndustry);
    } else {
        urlSearchParams.delete("industry");
    }
    if (selectedProfile !== "All") {
        urlSearchParams.set("profile", selectedProfile);
    } else {
        urlSearchParams.delete("profile");
    }

    // Return the formatted search parameters
    return `&${urlSearchParams.toString()}`;
}

// Function to display paginated jobs
async function displayJobs(page) {
    const jobs = await fetchAllJobs();

    // Render paginated jobs and generate pagination controls
    renderPaginatedJobsAndControls(jobs, page);
}

// Function to display results in the resultsContainer
async function displayResults(selectedProfile, page) {
    const jobsCollectionRef = collection(db, "jobs");
    const jobsQuerySnapshot = await getDocs(jobsCollectionRef);

    const jobs = [];

    jobsQuerySnapshot.forEach((doc) => {
        const jobsData = doc.data();

        // Split the lines of jobsData.profile_masterdata_code and check for a match
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
                postDate: jobsData.post_date,
                lastDate: jobsData.last_date,
                jobCode: jobsData.job_code,
            };
            jobs.push(job);
        }
    });

    // Render paginated jobs and generate pagination controls
    renderPaginatedJobsAndControls(jobs, page);
}

// Function to display results based on user selections
submitButton.addEventListener("click", async () => {
    const selectedJobType = jobTypeSelect.value;
    const selectedIndustry = industrySelect.value;
    const selectedProfile = profileSelect.value;

    // Reset the page parameter to 1 in the URL
    const urlSearchParams = new URLSearchParams(window.location.search);

    // Clear previous results
    resultsContainer.textContent = "";
    resultsContainer.classList.add("results-visible");

    if (
        selectedJobType === "All" &&
        selectedIndustry === "All" &&
        selectedProfile === "All"
    ) {
        await displayJobs(1);
    } else {
        try {
            const postCollectionRef = collection(db, "posts");
            const postSnapshot = await getDocs(postCollectionRef);

            let foundPostData = null;

            postSnapshot.forEach((doc) => {
                const postData = doc.data();

                if (
                    (selectedJobType === "All" ||
                        postData.jobtype_masterdata_code === selectedJobType) &&
                    (selectedIndustry === "All" ||
                        postData.industry_masterdata_code ===
                            selectedIndustry) &&
                    (selectedProfile === "All" ||
                        postData.profile_masterdata_code === selectedProfile)
                ) {
                    foundPostData = postData;
                }
            });

            if (foundPostData) {
                displayResults(selectedProfile, 1);
            } else {
                resultsContainer.textContent = "No results found.";
            }

            // Update URL parameters

            // Set the parameters for jobType, industry, and profile
            urlSearchParams.set("jobType", selectedJobType);
            urlSearchParams.set("industry", selectedIndustry);
            urlSearchParams.set("profile", selectedProfile);
            urlSearchParams.set("page", "1");

            // Update the URL with the new parameters
            window.history.pushState({}, "", `?${urlSearchParams.toString()}`);
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    }
});
