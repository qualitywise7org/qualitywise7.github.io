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
const jobCode = getParameterByName("jobCode");

async function fetchJobDocument(jobCode) {
    try {
        const jobCodeNumber = parseInt(jobCode);
        const querySnapshot = await getDocs(
            query(
                collection(db, "jobs"),
                where("job_code", "==", jobCodeNumber)
            )
        );

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data();
        } else {
            console.error(
                "No matching document found for jobCode:",
                jobCodeNumber
            );
            return null;
        }
    } catch (error) {
        console.error("Error fetching job document:", error);
        return null;
    }
}

const jobPromise = fetchJobDocument(jobCode);

jobPromise.then((job) => {
    if (!job) {
        console.error("Job not found.");
    } else {
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
