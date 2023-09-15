import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
    getFirestore,
    getDocs,
    where,
    collection,
    query,
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

const app = initializeApp(firebaseConfig);
const db = getFirestore();

// Function to extract a specific parameter value from URL params
function getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Extract the 'jobCode' from URL params
const jobCode = decodeURIComponent(getParameterByName("jobCode"));

// Function to update element text content or hide it if it's empty
function updateElementHTMLOrHide(elementId, html) {
    const element = document.getElementById(elementId);
    if (element) {
        if (html) {
            element.innerHTML = html;
            element.style.display = "block";
        } else {
            element.style.display = "none";
        }
    }
}

// Function to fetch job data from local storage by jobCode
function fetchJobDataFromLocalStorage(jobcode) {
    const jobsDataFromLocalStorage = JSON.parse(
        localStorage.getItem("jobsData")
    );

    if (!jobsDataFromLocalStorage) {
        console.error("Jobs data not found in local storage.");
        return null;
    }

    const job = jobsDataFromLocalStorage.find(
        (job) => decodeURIComponent(job.jobCode) === jobcode
    );
    return job || null;
}

async function fetchJobDocument(jobCode) {
    try {
        const querySnapshot = await getDocs(
            query(collection(db, "jobs"), where("job_code", "==", jobCode))
        );

        if (!querySnapshot.empty) {
            const job = querySnapshot.docs[0].data();
            const postName = job.post_name;

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
                    job,
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
            console.error("No matching document found for jobCode:");
            return null;
        }
    } catch (error) {
        console.error("Error fetching job document:", error);
        return null;
    }
}

// Fetch job data from local storage
const job = fetchJobDataFromLocalStorage(jobCode);

if (job) {
    console.log(job);
    updateElementHTMLOrHide(
        "industry",
        job.industry ? `<strong>Industry:</strong> ${job.industry}` : ""
    );
    updateElementHTMLOrHide(
        "jobType",
        job.jobType ? `<strong>Job Type:</strong> ${job.jobType}` : ""
    );
    updateElementHTMLOrHide(
        "profile",
        job.profile ? `<strong>Profile:</strong> ${job.profile}` : ""
    );

    const postNameElement = document.getElementById("postName");
    if (postNameElement) {
        postNameElement.textContent = job.postName;
    }

    const briefDetailElement = document.getElementById("briefDetail");
    if (briefDetailElement) {
        briefDetailElement.innerHTML = `<strong>Brief Details:</strong> ${job.briefInfo}`;
    }

    const dateElement = document.getElementById("date");
    if (dateElement) {
        dateElement.innerHTML = `<strong>Post Date:</strong> ${job.postDate} | <strong>Last Date:</strong> ${job.lastDate}`;
    }

    const ageLimitElement = document.getElementById("ageLimit");
    if (ageLimitElement) {
        ageLimitElement.innerHTML = `<strong>Minimum Age Limit:</strong> ${job.minAge} | <strong>Maximum Age Limit:</strong> ${job.maxAge}`;
    }

    const recruitmentBoardElement = document.getElementById("recruitmentBoard");
    if (recruitmentBoardElement) {
        recruitmentBoardElement.innerHTML = `<strong>Recruitment Board:</strong> ${job.recruitmentBoard}`;
    }

    const moreDetailsLink = document.getElementById("moreDetailsLink");
    if (moreDetailsLink) {
        moreDetailsLink.href = job.jobLink;
    }
} else {
    const jobPromise = fetchJobDocument(jobCode);

    jobPromise.then((result) => {
        const { job, industry, jobType, profile } = result;
        if (!job) {
            console.error("Job not found.");
        } else {
            updateElementHTMLOrHide(
                "industry",
                industry ? `<strong>Industry:</strong> ${industry}` : ""
            );
            updateElementHTMLOrHide(
                "jobType",
                jobType ? `<strong>Job Type:</strong> ${jobType}` : ""
            );
            updateElementHTMLOrHide(
                "profile",
                profile ? `<strong>Profile:</strong> ${profile}` : ""
            );

            const postNameElement = document.getElementById("postName");
            if (postNameElement) {
                postNameElement.textContent = job.post_name;
            }

            const briefDetailElement = document.getElementById("briefDetail");
            if (briefDetailElement) {
                briefDetailElement.innerHTML = `<strong>Brief Details:</strong> ${job.brief_info}`;
            }

            const dateElement = document.getElementById("date");
            if (dateElement) {
                dateElement.innerHTML = `<strong>Post Date:</strong> ${job.post_date} | <strong>Last Date:</strong> ${job.last_date}`;
            }

            const ageLimitElement = document.getElementById("ageLimit");
            if (ageLimitElement) {
                ageLimitElement.innerHTML = `<strong>Minimum Age Limit:</strong> ${job.minimum_age} | <strong>Maximum Age Limit:</strong> ${job.maximum_age}`;
            }

            const recruitmentBoardElement =
                document.getElementById("recruitmentBoard");
            if (recruitmentBoardElement) {
                recruitmentBoardElement.innerHTML = `<strong>Recruitment Board:</strong> ${job.recruitment_board}`;
            }

            const moreDetailsLink = document.getElementById("moreDetailsLink");
            if (moreDetailsLink) {
                moreDetailsLink.href = job.job_link;
            }
        }
    });
}
