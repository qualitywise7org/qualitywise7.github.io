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

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore();

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
        // If data is available in local storage, parse it
        JSON.parse(jobsDataFromLocalStorage);
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
    }
}

fetchAllJobs();
