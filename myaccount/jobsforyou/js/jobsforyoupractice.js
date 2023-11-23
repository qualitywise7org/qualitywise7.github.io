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


// Get the authenticated user's ID
let userId = null;
let userData = {};
let graduationDegreeName = "";
let pgDegreeName = "";
let jobsToShow = []; // Define jobsToShow in a higher scope

// JavaScript to trigger the modal and populate form fields
document.getElementById("openModalButton").addEventListener("click", async () => {
        document.getElementById("twelfthSubject").value =
            userData.twelfthSubject || "";
        document.getElementById("twelfthPercentage").value =
            userData.twelfthPercentage || "";
        document.getElementById("diplomaStream").value =
            userData.diplomaStream || "";
        document.getElementById("diplomaName").value =
            userData.diplomaName || "";
        document.getElementById("graduationStream").value =
            userData.graduationStream || "";
        document.getElementById("graduationDegree").value =
            userData.graduationDegree || "";
        document.getElementById("graduationPercentage").value =
            userData.graduationPercentage || "";
        document.getElementById("pgStream").value = userData.pgStream || "";
        document.getElementById("pgDegree").value = userData.pgDegree || "";
        document.getElementById("pgPercentage").value =
            userData.pgPercentage || "";
        document.getElementById("categories").value = userData.category || "";
        document.getElementById("user-dob").value = userData.dob || "";

        let myModal = new bootstrap.Modal(document.getElementById("myModal"));
        myModal.show();
    });

    document.getElementById("saveDetails").addEventListener("click", () =>{
        var twelfthSubject = document.getElementById("twelfthSubject").value;
        var twelfthPercentage = document.getElementById("twelfthPercentage").value;
        var diplomaStream = document.getElementById("diplomaStream").value;
        var diplomaName = document.getElementById("diplomaName").value;
        var graduationStream = document.getElementById("graduationStream").value;
        var graduationDegree = document.getElementById("graduationDegree").value;
        var graduationPercentage = document.getElementById("graduationPercentage").value;
        var pgStream = document.getElementById("pgStream").value;
        var pgDegree = document.getElementById("pgDegree").value;
        var pgPercentage = document.getElementById("pgPercentage").value;
        var categories = document.getElementById("categories").value;
        var user_dob = document.getElementById("user-dob").value;
       
        // Store user data in local storage
        var userDetails = {
            twelfthSubject : twelfthSubject,
            twelfthPercentage : twelfthPercentage,
            diplomaStream : diplomaStream,
            diplomaName : diplomaName,
            graduationStream : graduationStream,
            graduationDegree : graduationDegree,
            graduationPercentage : graduationPercentage,
            pgStream : pgStream,
            pgDegree : pgDegree,
            pgPercentage : pgPercentage,
            categories : categories,
            user_dob : user_dob,

        };

        var userJSON = JSON.stringify(userDetails);
        localStorage.setItem('userDetails', userJSON);
    })


onAuthStateChanged(auth, async (user) => {
    userId = user.uid;
    try {
        const userDocRef = doc(db, "users", userId);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
            userData = userDocSnapshot.data();
            var storedUserJSON = localStorage.getItem('userDetails');
            if(storedUserJSON)
            {
                var storedUser = JSON.parse(storedUserJSON);
                graduationDegreeName = ( qualification_masterdata , storedUser.graduationDegree );
                pgDegreeName = (qualification_masterdata, storedUser.pgDegree);
                // console.log(graduationDegreeName, pgDegreeName)
            }
            fetchAndUseJobs();
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
});


function calculateAge(dob) {
    const dobDate = new Date(dob);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - dobDate.getFullYear();
    return age;
}

// Function to get the name from collection based on code
function getNameFromCollection(collection, code) {
    const foundItem = collection.find((item) => item.code === code);
    return foundItem ? foundItem.name : "";
}

// previously shown jobs
let previousJobs = [];

async function fetchAndUseJobs() {
    const jobs = jobs_data;

    jobsToShow = []; // Clear jobsToShow before populating it

    jobs?.forEach((job) => {
        const qualificationEligibility =
            job.qualification_eligibility.toLowerCase();

            var storedUserJSON = localStorage.getItem('userDetails');
            var storedUser = JSON.parse(storedUserJSON);
            var twelveth = storedUser.twelfthSubject;
            var graduation = storedUser.graduationDegree;
            var diploma = storedUser.diplomaName;
            var postgraduation = storedUser.pgDegree;

        // Calculate user's age
        // const userAge = calculateAge(userData.dob);
        const userAge = calculateAge(storedUser.user_dob);

        // Adjust maximum age based on category
        let maxAge = job.maximum_age;
        if (
            storedUser.category === "OBC (NCL)" ||
            storedUser.category === "OBC (CL)"
        ) {
            maxAge += 3;
        } else if (storedUser.category === "SC" || storedUser.category === "ST") {
            maxAge += 5;
        }
         if( (twelveth === "math" || twelveth === "science" || twelveth === "commerce" || twelveth === "biology") && ( (qualificationEligibility.includes("12th") || qualificationEligibility.includes("10+2"))) ){
            jobsToShow.push(job);
         }

        else if( (graduation === "btech" || graduation === "be" || graduation === "bsc" || graduation === "bca") || (qualificationEligibility.includes("12th")) && qualificationEligibility.includes("graduate")){
            jobsToShow.push(job);
         }
         else if( (diploma === "diploma") && qualificationEligibility.includes("diploma")){
            jobsToShow.push(job);
         }
        else if( (postgraduation === "mca" || postgraduation === "mtech" || postgraduation ==="msc" || postgraduation ==="phd") && (qualificationEligibility.includes("postgraduate"))){
            jobsToShow.push(job);
        }
    });

     // Find new jobs
     const newJobs = jobsToShow.filter((job) => !previousJobs.includes(job));
    // Update the previously shown jobs
    previousJobs = jobsToShow;

    // Display the new jobs
    displayJobs(newJobs);
}

// Add an event listener to the qualification filter select element
// qualificationFilter.addEventListener("change", () => {
//     const selectedOption = qualificationFilter.value;

//     const filteredJobs = jobsToShow.filter((job) => {
//         const qualificationEligibility =
//             job.qualification_eligibility.toLowerCase(); 

//         const includesGraduation =
//             graduationDegreeName && qualificationEligibility.includes(graduationDegreeName.toLowerCase()) || qualificationEligibility.includes("graduate");

//         const includesPG =
//             pgDegreeName &&
//             qualificationEligibility.includes(pgDegreeName.toLowerCase());

//         if (selectedOption === "12th") {
//             return (
//                 qualificationEligibility.includes("12th") ||
//                 qualificationEligibility.includes("10+2")
//             );
//         }else if (selectedOption === graduationDegreeName) {
//             return includesGraduation;
//         } else if (selectedOption === pgDegreeName) {
//             return includesPG;
//         }
//     });

//     displayJobs(filteredJobs);
// });

// Function to display results in the resultsContainer

async function displayJobs(jobs) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    const profileCardStyles = {
        // width: "fit-content",
        // margin: "0 auto",
    };

    const groupedJobs = groupJobsByProfile(jobs);

    const jobsPerPage = 2;
    const numPages = Math.ceil(jobs?.length / jobsPerPage);

    // Get the current page number from URL query parameters (if available)
    const urlSearchParams = new URLSearchParams(window.location.search);
    const currentPage = parseInt(urlSearchParams.get("page")) || 1;

    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;

    const paginatedJobs = groupedJobs?.slice(startIndex, endIndex);

    const jobsDiv = document.createElement("div");
    jobsDiv.classList.add("row", 'g-3');

    // Hide the loading element
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = "none";

    // Display paginated jobs
    if (paginatedJobs?.length > 0) {
        paginatedJobs.forEach((profileJobs) => {
            const profileCard = document.createElement("div");
            profileCard.classList.add("card", "col-12");

            Object.keys(profileCardStyles).forEach((styleKey) => {
                profileCard.style[styleKey] = profileCardStyles[styleKey];
            });

            profileCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title" style="color:white; background-color:#4f92ef; padding:5px;">${
                        profileJobs[0]?.posts_data?.profile_masterdata?.name
                            ? profileJobs[0]?.posts_data?.profile_masterdata
                                  ?.name
                            : "Other"
                    }</h5>
                    <p><strong>Job Type: </strong>${
                        profileJobs[0]?.posts_data?.jobtype_masterdata?.name
                    } | <strong>Industry: </strong>${
                profileJobs[0]?.posts_data?.industry_masterdata?.name
            }</p>
             
                    <p><strong>Lifestyle: </strong>${
                        profileJobs[0]?.posts_data?.profile_masterdata
                            ? profileJobs[0]?.posts_data?.profile_masterdata?.life_style
                                  .map(
                                      (video) =>
                                        `<div> 👉 <a href="${video.url}"> ${video.title}</a></div>`
                                  )
                                  .join(" ")
                            : ""
                    }</p>
                </div>
            `;

            jobsDiv.appendChild(profileCard);

            profileJobs.forEach((job) => {
                const jobDiv = document.createElement("div");
                jobDiv.classList.add("col-md-4", "col-12");
                // jobDiv.style.backgroundColor = "rgb(244 242 255)";

                jobDiv.innerHTML = `
                <div class="card h-100 overflow-hidden">
                <div class="card-body " style=" background-color:rgb(244 242 255)">
                    <h5 class="card-title text-center">${job?.posts_data?.post_name}</h5>

                    ${job.last_date ?`
                    <p><strong>Post Date : </strong>${job?.post_date} | <strong>Last Date: </strong>${job?.last_date}</p>  
                    ` : `
                    <p><strong>Post Date : </strong>${job?.post_date}</p>
                    `}

                    <p><strong>Eligibility : </strong>${job?.qualification_eligibility}</p>

                    ${job?.recruitment_board ?
                    `
                    <p><strong>Recruitment Board :</strong> ${job?.recruitment_board}</p>
                    ` : `
                    <p><strong>Location :</strong> ${job?.location}</p>
                    `}

                    ${job?.minimum_age || job?.maximum_age ?
                        `<p><strong>Minimum Age :</strong> ${job?.minimum_age} | <strong>Maximum Age :</strong> ${job?.maximum_age}</p>`
                        :
                        (job?.company_name ?
                            `<p><strong>Company Name : </strong>${job?.company_name}</p>`
                            :
                            ``
                        )
                    }
                    <a href="/careeroptions/jobdetails/?jobCode=${job?.job_code}" target="_blank" class="btn btn-sm btn-secondary">Know More</a>
                </div>
            </div>  
                `;

                jobsDiv.appendChild(jobDiv);
            });
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

function groupJobsByProfile(jobs) {
    const groupedJobs = [];

    // Separate jobs with a profile and jobs without a profile
    const jobsWithProfile = jobs.filter(
        (job) => job?.posts_data?.profile_masterdata?.code
    );
    const jobsWithoutProfile = jobs.filter(
        (job) => !job?.posts_data?.profile_masterdata?.code
    );

    // Group jobs with the same profile together
    const uniqueProfiles = [
        ...new Set(
            jobsWithProfile.map(
                (job) => job?.posts_data?.profile_masterdata?.code
            )
        ),
    ];

    // Sort the unique profile codes alphabetically
    uniqueProfiles.sort();

    uniqueProfiles.forEach((profile) => {
        const profileJobs = jobsWithProfile
            .filter(
                (job) => job?.posts_data?.profile_masterdata?.code === profile
            )
            .sort((a, b) => {
                const dateA = parseDate(a?.post_date);
                const dateB = parseDate(b?.post_date);

                return dateB - dateA;
            });

        groupedJobs.push(profileJobs);
    });

    // Add jobs without a profile to the end
    if (jobsWithoutProfile != "") {
        groupedJobs.push(jobsWithoutProfile);
    }

    return groupedJobs;
}

function parseDate(dateString) {
    const parts = dateString.split("/");
    const year = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[0], 10);
    return new Date(year, month, day);
}

// JavaScript to trigger the modal and populate form fields
document.getElementById("openModalButton") .addEventListener("click", async () => {
    let myModal = new bootstrap.Modal(document.getElementById("myModal"));
    myModal.show(); 
});

document.getElementById("closed1").addEventListener("click", () =>{
    location.reload();
})
document.getElementById( "closed2").addEventListener("click", () =>{
    location.reload();
})