import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
    getFirestore,
    getDocs,
    where,
    collection,
    query,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";
import {
    jobtype_masterdata,
    industry_masterdata,
    profile_masterdata,
} from "../master-data/master-data";

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
async function fetchDataFromFirestoreAndStore(
    collectionName,
    localStorageKey,
    selectElement
) {
    try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        const data = [];
        snapshot.forEach((doc) => {
            data.push(doc.data());
        });

        // Store the data in local storage as JSON
        localStorage.setItem(localStorageKey, JSON.stringify(data));

        populateSelectOptionsFromLocalStorage(localStorageKey, selectElement);
    } catch (error) {
        console.error(
            `Error fetching and storing ${collectionName} data:`,
            error
        );
    }
}

// Function to populate select options from local storage
async function populateSelectOptionsFromLocalStorage(
    localStorageKey,
    selectElement
) {
    const data = await JSON.parse(localStorage.getItem(localStorageKey));

    if (data) {
        // Add an "All" option
        const allOption = document.createElement("option");
        allOption.value = "All";
        allOption.textContent = `All`;
        selectElement.appendChild(allOption);

        data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.name;
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
        jobTypeLocalStorageKey,
        jobTypeSelect
    );
}

const industryLocalStorageKey = "industryData";
if (!localStorage.getItem(industryLocalStorageKey)) {
    fetchDataFromFirestoreAndStore(
        "industry_masterdata ",
        industryLocalStorageKey,
        industrySelect
    );
}

const profileLocalStorageKey = "profileData";
if (!localStorage.getItem(profileLocalStorageKey)) {
    fetchDataFromFirestoreAndStore(
        "profile_masterdata ",
        profileLocalStorageKey,
        profileSelect
    );
}

// Call the function to populate select options when the page is loaded
window.addEventListener("load", async () => {
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
            displayResults(urlJobType, urlIndustry, urlProfile, currentPage);
        } else {
            displayJobs(currentPage);
        }
    }, 1000);

    if (!urlJobType && !urlIndustry && !urlProfile) {
        displayJobs(1);
    }
});

async function fetchJobDocument(postName) {
    try {
        if (postName) {
            // Fetch the "posts" document using "post_name"
            const postQuerySnapshot = await getDocs(
                query(
                    collection(db, "posts"),
                    where("post_name", "==", postName)
                )
            );

            if (!postQuerySnapshot.empty) {
                const postData = postQuerySnapshot.docs[0].data();

                // Fetch "industry_masterdata", "jobtype_masterdata", and "profile_masterdata"
                const industryCode = postData.industry_masterdata_code;
                const jobTypeCode = postData.jobtype_masterdata_code;
                const profileCode = postData.profile_masterdata_code;

                // Fetch data from "industry_masterdata"
                const industryQuerySnapshot = await getDocs(
                    query(
                        collection(db, "industry_masterdata "),
                        where("code", "==", industryCode)
                    )
                );

                const industry =
                    industryQuerySnapshot.docs[0]?.data()?.name || "";

                // Fetch data from "jobtype_masterdata"
                const jobTypeQuerySnapshot = await getDocs(
                    query(
                        collection(db, "jobtype_masterdata"),
                        where("code", "==", jobTypeCode)
                    )
                );

                const jobType =
                    jobTypeQuerySnapshot.docs[0]?.data()?.name || "";

                // Fetch data from "profile_masterdata"
                const profileQuerySnapshot = await getDocs(
                    query(
                        collection(db, "profile_masterdata "),
                        where("code", "==", profileCode)
                    )
                );

                const profile =
                    profileQuerySnapshot.docs[0]?.data()?.name || "";

                // Return the combined data
                return {
                    industry,
                    jobType,
                    profile,
                };
            } else {
                console.error(
                    "No matching document found in 'posts' collection."
                );
                return null;
            }
        } else {
            console.error("No matching document found for postName:");
            return null;
        }
    } catch (error) {
        console.error("Error fetching job document:", error);
        return null;
    }
}

// Function to fetch all jobs from Firestore
async function fetchAllJobs() {
    // Check if jobs data is available in local storage
    const jobsDataFromLocalStorage = localStorage.getItem("jobsData");

    if (jobsDataFromLocalStorage) {
        return JSON.parse(jobsDataFromLocalStorage);
    } else {
        // If data is not available in local storage, fetch it from Firestore
        const jobCollectionRef = collection(db, "jobs");
        const jobQuerySnapshot = await getDocs(jobCollectionRef);

        const jobs = [];

        for (const doc of jobQuerySnapshot.docs) {
            const jobData = doc.data();
            const job = {
                postName: jobData.post_name,
                qualificationEligibility: jobData.qualification_eligibility,
                postDate: jobData.post_date,
                lastDate: jobData.last_date,
                jobCode: encodeURIComponent(jobData.job_code),
                briefInfo: jobData.brief_info,
                minAge: jobData.minimum_age,
                maxAge: jobData.maximum_age,
                recruitmentBoard: jobData.recruitment_board,
                jobLink: jobData.job_link,
            };

            // Call fetchJobDocument for additional fields
            const additionalData = await fetchJobDocument(jobData.post_name);

            if (additionalData) {
                job.industry = additionalData.industry;
                job.jobType = additionalData.jobType;
                job.profile = additionalData.profile;
            }

            jobs.push(job);
        }

        // Store jobs data in local storage
        localStorage.setItem("jobsData", JSON.stringify(jobs));
        return jobs;
    }
}

// Function to render paginated jobs and generate pagination controls
function renderPaginatedJobsAndControls(jobs, currentPage) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    const profileCardStyles = {
        width: "fit-content",
        margin: "0 auto",
    };

    const groupedJobs = groupJobsByProfile(jobs);

    const jobsPerPage = 2;
    const numPages = Math.ceil(jobs?.length / jobsPerPage);

    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;

    const paginatedJobs = groupedJobs?.slice(startIndex, endIndex);

    const jobsDiv = document.createElement("div");
    jobsDiv.classList.add("row");

    // Hide the loading element
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = "none";

    // Display paginated jobs
    if (paginatedJobs?.length > 0) {
        paginatedJobs.forEach((profileJobs) => {
            const profileCard = document.createElement("div");
            profileCard.classList.add("card", "mb-3");

            Object.keys(profileCardStyles).forEach((styleKey) => {
                profileCard.style[styleKey] = profileCardStyles[styleKey];
            });

            profileCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title" style="color:white; background-color:#4f92ef; padding:5px;">${
                        profileJobs[0]?.profile
                            ? profileJobs[0].profile
                            : "Other"
                    }</h5>
                    <p><strong>Job Type: </strong>${
                        profileJobs[0]?.jobType
                    } | <strong>Industry: </strong>${
                profileJobs[0]?.industry
            }</p>
                </div>
            `;

            jobsDiv.appendChild(profileCard);

            profileJobs.forEach((job) => {
                const jobDiv = document.createElement("div");
                jobDiv.classList.add("mb-3", "card");
                jobDiv.style.backgroundColor = "rgb(244 242 255)";

                jobDiv.innerHTML = `
                    <a href="/careeroptions/jobdetails/?jobCode=${job.jobCode}&postDate=${job.postDate}" target="_blank">
                        <div class="card-body">
                            <h5 class="card-title">${job.postName}</h5>
                            <p><strong>Post Date: </strong>${job.postDate} | <strong>Last Date: </strong>${job.lastDate}</p>
                            <p><strong>Eligibility: </strong>${job.qualificationEligibility}</p>
                        </div>
                    </a>
                `;

                jobsDiv.appendChild(jobDiv);
            });
        });

        // paginatedJobs?.forEach((job) => {
        //     const jobDiv = document.createElement("div");
        //     jobDiv.classList.add("mb-3");

        //     jobDiv.innerHTML = `
        //     <div class="card">
        //     <a href="/careeroptions/jobdetails/?jobCode=${
        //         job.jobCode
        //     }&postDate=${job.postDate}", target="_blank">
        //     <div class="card-body">
        //         <h5 class="card-title">${job.postName}</h5>
        //         ${
        //             job.industry && job.jobType && job.profile
        //                 ? `<p><strong>Job Type: </strong>${job.jobType} | <strong>Industry: </strong>${job.industry} | <strong>Profile: </strong>${job.profile}</p>`
        //                 : job.jobType
        //                 ? `<p><strong>Job Type: </strong>${job.jobType}</p>`
        //                 : ""
        //         }
        //         ${
        //             job.postDate && job.lastDate
        //                 ? `<p><strong>Post Date: </strong>${job.postDate} | <strong>Last Date: </strong>${job.lastDate}</p>`
        //                 : job.postDate
        //                 ? `<p><strong>Post Date: </strong>${job.postDate}</p>`
        //                 : job.lastDate
        //                 ? `<p><strong>Last Date: </strong>${job.lastDate}</p>`
        //                 : ""
        //         }
        //         <p><strong>Eligibility: </strong>${
        //             job.qualificationEligibility
        //         }</p>
        //     </div>
        //     </a>
        // </div>
        //     `;

        //     jobsDiv.appendChild(jobDiv);
        // });

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

function groupJobsByProfile(jobs) {
    const groupedJobs = [];

    // Separate jobs with a profile and jobs without a profile
    const jobsWithProfile = jobs.filter((job) => job.profile);
    const jobsWithoutProfile = jobs.filter((job) => !job.profile);

    // Group jobs with the same profile together
    const uniqueProfiles = [
        ...new Set(jobsWithProfile.map((job) => job.profile)),
    ];
    uniqueProfiles.forEach((profile) => {
        const profileJobs = jobsWithProfile.filter(
            (job) => job.profile === profile
        );
        groupedJobs.push(profileJobs);
    });

    // Add jobs without a profile to the end
    if (jobsWithoutProfile != "") {
        groupedJobs.push(jobsWithoutProfile);
    }

    return groupedJobs;
}

// Function to get the current URL search parameters
function getSearchParams() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const selectedJobType = jobTypeSelect.value;
    const selectedIndustry = industrySelect.value;
    const selectedProfile = profileSelect.value;

    // Remove existing "page" parameter if it exists
    urlSearchParams.delete("page");

    urlSearchParams.set("jobType", selectedJobType);

    urlSearchParams.set("industry", selectedIndustry);

    urlSearchParams.set("profile", selectedProfile);

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
async function displayResults(
    selectedJobType,
    selectedIndustry,
    selectedProfile,
    page
) {
    // Fetch jobs data from local storage
    const jobsDataFromLocalStorage = await JSON.parse(
        localStorage.getItem("jobsData")
    );

    if (!jobsDataFromLocalStorage) {
        console.error("Jobs data not found in local storage.");
        return;
    }

    const jobs = [];

    for (const job of jobsDataFromLocalStorage) {
        if (
            (selectedJobType === "All" || job.jobType === selectedJobType) &&
            (selectedIndustry === "All" || job.industry === selectedIndustry) &&
            (selectedProfile === "All" || job.profile === selectedProfile)
        ) {
            jobs.push(job);
        }
    }

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

    displayResults(selectedJobType, selectedIndustry, selectedProfile, 1);

    // Set the parameters for jobType, industry, and profile
    urlSearchParams.set("jobType", selectedJobType);
    urlSearchParams.set("industry", selectedIndustry);
    urlSearchParams.set("profile", selectedProfile);
    urlSearchParams.set("page", "1");

    // Update the URL with the new parameters
    window.history.pushState({}, "", `?${urlSearchParams.toString()}`);
});
