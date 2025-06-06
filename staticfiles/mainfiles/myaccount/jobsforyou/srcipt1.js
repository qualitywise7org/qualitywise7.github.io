const jobTypeSelect = document.getElementById("jobType");
const locationSelect = document.getElementById("location");
const qualificationInput = document.getElementById("qualification");
const profileSelect = document.getElementById("profile");
const companySelect = document.getElementById("company");
const submitButton = document.getElementById("submitButton");
const clearAllButton = document.getElementById("clearallButton");
const useProfileQualificationCheckbox = document.getElementById(
  "useProfileQualification"
);
const resultsContainer = document.getElementById("results");


const jobsPerPage = 30;

// Mapping for qualification filtering
const qualificationMapping = {
  graduation: ["b.a", "b.sc", "b.com", "b.tech", "b.e", "bba"],
  postGraduation: ["m.a", "m.sc", "m.com", "m.tech", "mba"],
};

// Fetch Firebase jobs
async function loadFirebaseJobs() {
  const q = query(collection(db, "jobs"), orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  const firebaseJobs = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    data.job_code = doc.id;
    data.source = "firebase";
    data.post_date = data.timestamp?.toDate()?.toISOString().split("T")[0];
    firebaseJobs.push(data);
  });

  return firebaseJobs;
}

// Get all URL parameters
function getSearchParams() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const selectedJobType = jobTypeSelect.value;
  const selectedLocation = locationSelect.value;
  const selectedQualification = qualificationInput.value.toLowerCase();
  const selectedProfile = profileSelect.value;
  const selectedCompany = companySelect.value;

  urlSearchParams.delete("page");

  urlSearchParams.set("jobType", selectedJobType);
  urlSearchParams.set("location", selectedLocation);
  urlSearchParams.set("qualification", selectedQualification);
  urlSearchParams.set("profile", selectedProfile);
  urlSearchParams.set("company", selectedCompany);

  return urlSearchParams.toString();
}

// Filter jobs based on user input
function filterJobs(jobs) {
  const selectedJobType = jobTypeSelect.value.toLowerCase();
  const selectedLocation = locationSelect.value.toLowerCase();
  const selectedQualification = qualificationInput.value.toLowerCase();
  const selectedProfile = profileSelect.value.toLowerCase();
  const selectedCompany = companySelect.value.toLowerCase();

  return jobs.filter((job) => {
    const jobData = JSON.stringify(job).toLowerCase();

    return (
      (!selectedJobType || jobData.includes(selectedJobType)) &&
      (!selectedLocation || jobData.includes(selectedLocation)) &&
      (!selectedQualification || jobData.includes(selectedQualification)) &&
      (!selectedProfile || jobData.includes(selectedProfile)) &&
      (!selectedCompany || jobData.includes(selectedCompany))
    );
  });
}

// Render jobs + pagination
function renderPaginatedJobsAndControls(jobs, currentPage) {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const paginatedJobs = jobs.slice(startIndex, endIndex);

  const jobsDiv = document.createElement("div");
  jobsDiv.classList.add("row", "g-3");

  function formatDate(date) {
    if (!date) return "";
    const d = typeof date.toDate === "function" ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  paginatedJobs.forEach((job) => {
    const jobDiv = document.createElement("div");
    jobDiv.classList.add("col-md-4", "col-12");

    if (job.source === "firebase") {
      jobDiv.innerHTML = `
        <div class="card h-100 w-100 overflow-hidden">
          <div class="card-body" style="background-color:rgb(244 242 255)">
            <h5 class="card-title text-center p-3">${job.title}</h5>
            <p><strong>Post Date:</strong> ${formatDate(job.timestamp)}${
        job.applicationDeadline
          ? ` | <strong>Last Date:</strong> ${job.applicationDeadline}`
          : ""
      }</p>
            ${job.company ? `<p><strong>Company:</strong> ${job.company}</p>` : ""}
            ${job.qualification ? `<p><strong>Eligibility:</strong> ${job.qualification}</p>` : ""}
            ${job.RecruitmentBoard
          ? `<p><strong>Recruitment Board:</strong> ${job.RecruitmentBoard}</p>`
          : job.location
            ? `<p><strong>Location:</strong> ${job.location}</p>`
            : ""}
            ${
              job.minAge || job.maxAge
                ? `<p><strong>Minimum Age:</strong> ${job.minAge || "-"} | <strong>Maximum Age:</strong> ${job.maxAge || "-"}</p>`
                : ""
            }
            <a href="/careeroptions/jobdetails/?jobCode=${job.jobId}" target="_blank" class="btn btn-sm btn-secondary">Know More</a>
<a href="#" class="btn mt-2 btn-sm btn-primary apply-btn" data-jobcode="${job.job_code || job.jobId}">Apply</a>

          </div>
        </div>
      `;
    } else {
      jobDiv.innerHTML = `
        <div class="card h-100 w-100 overflow-hidden">
          <div class="card-body" style="background-color:rgb(244 242 255)">
            <h5 class="card-title text-center p-3">${job?.posts_data?.post_name}</h5>
            ${
              job.last_date
                ? `<p><strong>Post Date:</strong> ${job?.post_date} | <strong>Last Date:</strong> ${job?.last_date}</p>`
                : `<p><strong>Post Date:</strong> ${job?.post_date}</p>`
            }
            ${job?.company ? `<p><strong>Company:</strong> ${job?.company}</p>` : ""}
            <p><strong>Eligibility:</strong> ${job?.qualification_eligibility}</p>
            ${
              job?.recruitment_board
                ? `<p><strong>Recruitment Board:</strong> ${job?.recruitment_board}</p>`
                : `<p><strong>Location:</strong> ${job?.location}</p>`
            }
            ${
              job?.minimum_age || job?.maximum_age
                ? `<p><strong>Minimum Age:</strong> ${job?.minimum_age} | <strong>Maximum Age:</strong> ${job?.maximum_age}</p>`
                : job?.company_name
                ? `<p><strong>Company Name:</strong> ${job?.company_name}</p>`
                : ""
            }
            <a href="/careeroptions/jobdetails/?jobCode=${job?.job_code}" target="_blank" class="btn btn-sm btn-secondary">Know More</a>
            <a href="#" class="btn btn-sm mt-2 btn-primary apply-btn" data-jobcode="${job.job_code || job.jobId}">Apply</a>

          </div>
        </div>
      `;
    }

    jobsDiv.appendChild(jobDiv);
  });

  resultsContainer.appendChild(jobsDiv);

   // Hide the loading element
  const loadingElement = document.getElementById("loading");
  loadingElement.style.display = "none";


  // Pagination controls
  const paginationContainer = document.createElement("nav");
  paginationContainer.classList.add("d-flex", "justify-content-center", "mt-4");

  const paginationUl = document.createElement("ul");
  paginationUl.classList.add("pagination");

  const numPages = Math.ceil(jobs.length / jobsPerPage);
  const prevPageLi = document.createElement("li");
  prevPageLi.classList.add("page-item", currentPage === 1 && "disabled");
  prevPageLi.innerHTML = `<a class="page-link" href="?${getSearchParams()}&page=${currentPage - 1}">Previous</a>`;
  paginationUl.appendChild(prevPageLi);

  for (let i = 1; i <= numPages; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item", i === currentPage && "active");
    li.innerHTML = `<a class="page-link" href="?${getSearchParams()}&page=${i}">${i}</a>`;
    paginationUl.appendChild(li);
  }

  const nextPageLi = document.createElement("li");
  nextPageLi.classList.add("page-item", currentPage === numPages && "disabled");
  nextPageLi.innerHTML = `<a class="page-link" href="?${getSearchParams()}&page=${currentPage + 1}">Next</a>`;
  paginationUl.appendChild(nextPageLi);

  paginationContainer.appendChild(paginationUl);
  resultsContainer.appendChild(paginationContainer);
// Attach event listeners to all Apply buttons
const applyButtons = document.querySelectorAll(".apply-btn");
applyButtons.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Check if user is logged in
   const email = localStorage.getItem("email"); // Make sure you store user email on login
  const userId = localStorage.getItem("uid");
  const name = localStorage.getItem("userName") || "";
  const resumeUrl = localStorage.getItem("resumeUrl") || "";

    if (!userId || !email) {
      alert("You need to be logged in to apply.");
      return;
    }

    const jobCode = btn.getAttribute("data-jobcode");
    if (!jobCode) {
      alert("Invalid job code");
      return;
    }

    btn.disabled = true;
    btn.innerText = "Applying...";

    try {
      await applyToJob(jobCode, userId, email);
      btn.innerText = "Applied";
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-success");
      btn.disabled = true;
    } catch (error) {
      console.error("Apply error:", error);
      alert("Failed to apply. Try again later.");
      btn.disabled = false;
      btn.innerText = "Apply";
    }
  });
});
// Mark already applied jobs on page load
  markAlreadyAppliedJobs();
  
}
async function applyToJob(jobCode, uid, userEmail) {
  const jobDocRef = doc(db, "jobs", jobCode);
  const jobDocSnap = await getDoc(jobDocRef);
  const resumeUrl = localStorage.getItem("resumeUrl") || "";
  const name = localStorage.getItem("userName") || "";

  if (!jobDocSnap.exists()) {
    throw new Error("Job not found");
  }

  // Optional: check if user already applied to avoid duplicates
  const jobData = jobDocSnap.data();
  const applicants = jobData.applicants || [];

  const alreadyApplied = applicants.some(
    (applicant) => applicant.uid === uid || applicant.email === userEmail
  );

  if (alreadyApplied) {
    throw new Error("You have already applied to this job.");
  }

  // Add applicant to applicants array in Firestore
  await updateDoc(jobDocRef, {
    applicants: arrayUnion({ uid, email: userEmail, appliedAt: new Date(), resumeUrl, name }),
  });
}

async function markAlreadyAppliedJobs() {
  const uid = localStorage.getItem("uid");
  const userEmail = localStorage.getItem("email");

  if (!uid || !userEmail) return;

  const applyButtons = document.querySelectorAll(".apply-btn");

  for (const btn of applyButtons) {
    const jobCode = btn.getAttribute("data-jobcode");
    if (!jobCode) continue;

    try {
      const jobDocRef = doc(db, "jobs", jobCode);
      const jobDocSnap = await getDoc(jobDocRef);

      if (jobDocSnap.exists()) {
        const applicants = jobDocSnap.data().applicants || [];
        const alreadyApplied = applicants.some(
          (applicant) => applicant.uid === uid || applicant.email === userEmail
        );

        if (alreadyApplied) {
          btn.innerText = "Applied";
          btn.disabled = true;
          btn.classList.remove("btn-primary");
          btn.classList.add("btn-success");
        }
      }
    } catch (e) {
      console.warn("Error checking applied status for job", jobCode, e);
    }
  }
}

// Load and display jobs
async function displayJobs(currentPage) {
  const firebaseJobs = await loadFirebaseJobs();
  const scrapedJobs = jobs_data.map((job) => ({
    ...job,
    source: "scraped",
  }));

  const allJobs = [...firebaseJobs, ...scrapedJobs];

  allJobs.sort((a, b) => {
    const dateA = new Date(a.post_date || a.timestamp?.toDate?.() || 0);
    const dateB = new Date(b.post_date || b.timestamp?.toDate?.() || 0);
    return dateB - dateA;
  });

  const filteredJobs = filterJobs(allJobs);
  renderPaginatedJobsAndControls(filteredJobs, currentPage);
}

window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentPage = parseInt(urlParams.get("page")) || 1;
  displayJobs(currentPage);
});

// Handle Search Button Click
submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  const updatedParams = getSearchParams();
  window.history.pushState({}, "", `?${updatedParams}&page=1`);
  displayJobs(1);
});

// Handle Clear All Button Click
clearAllButton.addEventListener("click", (e) => {
  e.preventDefault();

  // Reset all filter fields
  jobTypeSelect.value = "";
  locationSelect.value = "";
  qualificationInput.value = "";
  profileSelect.value = "";
  companySelect.value = "";
  useProfileQualificationCheckbox.checked = false;

  // Remove URL parameters and refresh
  window.history.pushState({}, "", window.location.pathname);
  displayJobs(1);
});

// If "Use Profile Qualification" checkbox is used, auto-fill the qualification input
useProfileQualificationCheckbox.addEventListener("change", () => {
  if (useProfileQualificationCheckbox.checked) {
    // Get the stored qualification from user's profile
    const storedQualification = localStorage.getItem("userQualification") || ""; // Customize this retrieval as needed
    qualificationInput.value = storedQualification;
  } else {
    qualificationInput.value = "";
  }
});
// Allow candidates to apply for a job
// ✅ Store their info in the applicants array in Firestore
// ✅ Prevent duplicate applications (by checking userId)


// const jobTypeSelect = document.getElementById("jobType");
// const locationSelect = document.getElementById("location");
// const qualificationInput = document.getElementById("qualification");
// const profileSelect = document.getElementById("profile");
// const companySelect = document.getElementById("company");
// const submitButton = document.getElementById("submitButton");
// const clearAllButton = document.getElementById("clearallButton");
// const useProfileQualificationCheckbox = document.getElementById(
//   "useProfileQualification"
// );
// const resultsContainer = document.getElementById("results");

// // Function to populate select options
// async function populateSelectOptions(optionsMasterData, selectElement) {
//   // Add an "All" option
//   const allOption = document.createElement("option");
//   allOption.value = "all";
//   allOption.textContent = `All`;
//   selectElement.appendChild(allOption);

//   optionsMasterData.forEach((item) => {
//     const option = document.createElement("option");
//     option.value = item.code;
//     option.textContent = item.name;
//     selectElement.appendChild(option);
//   });
// }

// // Call the function to populate select options when the page is loaded
// window.addEventListener("load", async () => {
//   // Call the function to populate select options from local storage
//   populateSelectOptions(jobtype_masterdata, jobTypeSelect);
//   populateSelectOptions(industry_masterdata, locationSelect);
//   populateSelectOptions(profile_masterdata, profileSelect);

//   // Check if URL parameters are present and apply them
//   const urlSearchParams = new URLSearchParams(window.location.search);

//   const urlJobType = urlSearchParams.get("jobType");
//   const urlLocation = urlSearchParams.get("location");
//   const urlProfile = urlSearchParams.get("profile");
//   const urlCompany = urlSearchParams.get("company");
//   const urlQualification = urlSearchParams.get("qualification");

//   const currentPage = parseInt(urlSearchParams.get("page")) || 1;

//   setTimeout(() => {
//     if (urlJobType) {
//       jobTypeSelect.value = urlJobType;
//     }
//     if (urlLocation) {
//       locationSelect.value = urlLocation;
//     }
//     if (urlQualification) {
//       qualificationInput.value = urlQualification;
//     }
//     if (urlProfile) {
//       profileSelect.value = urlProfile;
//     }
//     if (urlCompany) {
//       companySelect.value = urlProfile;
//     }

//     if (
//       urlJobType ||
//       urlLocation ||
//       urlProfile ||
//       urlQualification ||
//       urlCompany
//     ) {
//       displayResults(
//         urlJobType,
//         urlLocation,
//         urlProfile,
//         urlCompany,
//         currentPage
//       );
//     } else {
//       displayJobs(currentPage);
//     }
//   }, 1000);

//   if (
//     !urlJobType &&
//     !urlLocation &&
//     !urlProfile &&
//     !urlQualification &&
//     !urlCompany
//   ) {
//     displayJobs(1);
//   }
// });

// // Function to render paginated jobs and generate pagination controls
// function renderPaginatedJobsAndControls(jobs, currentPage) {
//   // console.log(jobs);
//   jobs.forEach((doc) => {});
//   const resultsContainer = document.getElementById("results");
//   resultsContainer.innerHTML = "";

//   const jobsPerPage = 30;
//   const numPages = Math.ceil(jobs?.length / jobsPerPage);

//   const startIndex = (currentPage - 1) * jobsPerPage;
//   const endIndex = startIndex + jobsPerPage;

//   const paginatedJobs = jobs?.slice(startIndex, endIndex);

//   const jobsDiv = document.createElement("div");
//   jobsDiv.classList.add("row", "g-3");

//   function formatDate(date) {
//     if (!date) return "";
//     const d = date.toDate();
//     return d.toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   }

//   async function loadJobs() {
//     const q = query(collection(db, "jobs"), orderBy("timestamp", "desc"));
//     const snapshot = await getDocs(q);
//     const jobs = [];

//     snapshot.forEach((doc) => {
//       const data = doc.data();
//       data.job_code = doc.id;
//       jobs.push(data);
//     });

//     renderJobs(jobs);
//   }

//   function renderJobs(jobs) {
//     jobs.forEach((job) => {
//       const jobDiv = document.createElement("div");
//       jobDiv.classList.add("col-md-4", "col-12");

//       jobDiv.innerHTML = `
//         <div class="card h-100 w-100 overflow-hidden">
//           <div class="card-body">
//             <h5 class="card-title text-center p-3">${job.title}</h5>
//             <p><strong>Post Date:</strong> ${formatDate(job.timestamp)}${
//               job.applicationDeadline
//                 ? ` | <strong>Last Date:</strong> ${job.applicationDeadline}`
//                 : ""
//             }</p>
//             ${
//               job.company
//                 ? `<p><strong>Company:</strong> ${job.company}</p>`
//                 : ""
//             }
//             ${
//               job.qualification
//                 ? `<p><strong>Eligibility:</strong> ${job.qualification}</p>`
//                 : ""
//             }
//             ${
//               job.RecruitmentBoard
//                 ? `<p><strong>Recruitment Board:</strong> ${job.RecruitmentBoard}</p>`
//                 : job.location
//                 ? `<p><strong>Location:</strong> ${job.location}</p>`
//                 : ""
//             }
//             ${
//               job.minAge || job.maxAge
//                 ? `<p><strong>Minimum Age:</strong> ${job.minAge || "-"} | <strong>Maximum Age:</strong> ${job.maxAge || "-"}</p>`
//                 : ""
//             }
//             <a href="/careeroptions/jobdetails/?jobCode=${job.jobId}" target="_blank" class="btn btn-sm btn-secondary">Know More</a>
//           </div>
//         </div>
//       `;

//       jobsDiv.appendChild(jobDiv);
//     });
//   }

 


//   // Hide the loading element
//   const loadingElement = document.getElementById("loading");
//   loadingElement.style.display = "none";

//    const paginationContainer = document.createElement("nav");
//    paginationContainer.classList.add("d-flex", "justify-content-center", "mt-4"); // Add margin-top for spacing

//   // Display paginated jobs

//   // Display paginated jobs
//   if (paginatedJobs?.length > 0) {
//     // about pagination button

//     paginatedJobs.forEach((job) => {
//       const jobDiv = document.createElement("div");
//       jobDiv.classList.add("col-md-4", "col-12");
//       jobDiv.innerHTML = `
//                 <div class="card h-100 w-100 overflow-hidden">
//                     <div class="card-body " style=" background-color:rgb(244 242 255)">
//                         <h5 class="card-title text-center p-3">${
//                           job?.posts_data?.post_name
//                         }</h5>

//                         ${
//                           job.last_date
//                             ? `
//                         <p><strong>Post Date : </strong>${job?.post_date} | <strong>Last Date: </strong>${job?.last_date}</p>`
//                             : `
//                         <p><strong>Post Date : </strong>${job?.post_date}</p>`
//                         }
//                          ${
//                            job?.company
//                              ? `
//                         <p><strong>Company :</strong> ${job?.company}</p>`
//                              : ``
//                          }

//                         <p><strong>Eligibility : </strong>${
//                           job?.qualification_eligibility
//                         }</p>
//                         ${
//                           job?.recruitment_board
//                             ? `
//                         <p><strong>Recruitment Board :</strong> ${job?.recruitment_board}</p>`
//                             : `
//                         <p><strong>Location :</strong> ${job?.location}</p>`
//                         }

//                         ${
//                           job?.minimum_age || job?.maximum_age
//                             ? `
//                             <p><strong>Minimum Age :</strong> ${job?.minimum_age} | <strong>Maximum Age :</strong> ${job?.maximum_age}</p>`
//                             : job?.company_name
//                             ? `
//                         <p><strong>Company Name : </strong>${job?.company_name}</p>`
//                             : ``
//                         }
//                         <a href="/careeroptions/jobdetails/?jobCode=${
//                           job?.job_code
//                         }" target="_blank" class="btn btn-sm btn-secondary">Know More</a>
//                     </div>
//                 </div>    
//             `;

//       jobsDiv.appendChild(jobDiv);
      
//     });
//     loadJobs();

   
//     paginationContainer.classList.add("d-flex", "justify-content-center");

//     const paginationUl = document.createElement("ul");
//     paginationUl.classList.add("pagination");

//     // Create "Previous" button
//     const prevPageLi = document.createElement("li");
//     prevPageLi.classList.add("page-item");
//     if (currentPage === 1) {
//       prevPageLi.classList.add("disabled");
//     }
//     const prevPageLink = document.createElement("a");
//     prevPageLink.classList.add("page-link");
//     prevPageLink.href = `?${getSearchParams()}&page=${currentPage - 1}`;
//     prevPageLink.textContent = "Previous";
//     prevPageLi.appendChild(prevPageLink);
//     paginationUl.appendChild(prevPageLi);

//     // Create page number buttons
//     const startPage = Math.max(1, currentPage - 1);
//     const endPage = Math.min(numPages, currentPage + 1);
//     for (let i = startPage; i <= endPage; i++) {
//       const pageLi = document.createElement("li");
//       pageLi.classList.add("page-item");
//       if (i === currentPage) {
//         pageLi.classList.add("active");
//       }
//       const pageLink = document.createElement("a");
//       pageLink.classList.add("page-link");
//       pageLink.href = `?${getSearchParams()}&page=${i}`;
//       pageLink.textContent = i;
//       pageLi.appendChild(pageLink);
//       paginationUl.appendChild(pageLi);
//     }

//     // Create "Next" button
//     const nextPageLi = document.createElement("li");
//     nextPageLi.classList.add("page-item");
//     if (currentPage === numPages) {
//       nextPageLi.classList.add("disabled");
//     }
//     const nextPageLink = document.createElement("a");
//     nextPageLink.classList.add("page-link");
//     nextPageLink.href = `?${getSearchParams()}&page=${currentPage + 1}`;
//     nextPageLink.textContent = "Next";
//     nextPageLi.appendChild(nextPageLink);
//     paginationUl.appendChild(nextPageLi);

//     paginationContainer.appendChild(paginationUl);
//     // jobsDiv.appendChild(paginationContainer);
//   } else {
//     jobsDiv.innerHTML = `<p class="text-center">No jobs found.</p>`;
//   }

//   resultsContainer.appendChild(jobsDiv);
//   resultsContainer.appendChild(paginationContainer);
//   return;
  
// }

// // Function to get the current URL search parameters
// function getSearchParams() {
//   const urlSearchParams = new URLSearchParams(window.location.search);
//   const selectedJobType = jobTypeSelect.value;
//   const selectedLocation = locationSelect.value;
//   const selectedQualification = qualificationInput.value;
//   const selectedProfile = profileSelect.value;
//   const selectedCompany = companySelect.value;

//   // Remove existing "page" parameter if it exists
//   urlSearchParams.delete("page");

//   urlSearchParams.set("jobType", selectedJobType);
//   urlSearchParams.set("location", selectedLocation);
//   urlSearchParams.set("qualification", selectedQualification);
//   urlSearchParams.set("profile", selectedProfile);
//   urlSearchParams.set("company", selectedCompany);

//   // Return the formatted search parameters
//   return urlSearchParams.toString();
// }

// window.addEventListener("DOMContentLoaded", () => {
//   const urlParams = new URLSearchParams(window.location.search);
//   const currentPage = parseInt(urlParams.get("page")) || 1;
//   displayJobs(currentPage);
// });

// // Function to display paginated jobs
// async function displayJobs(page) {
//   const jobs = jobs_data;
//   console.log(jobs);
//   renderPaginatedJobsAndControls(jobs, page);
// }

// // Array for filtering qualifications
// const qualificationMapping = {
//   graduation: ["b.a", "b.sc", "b.com", "b.tech", "b.e", "bba"],
//   postGraduation: ["m.a", "m.sc", "m.com", "m.tech", "mba"],
//   // Add other mappings as needed
// };

// let userQualificationFromProfile = ""; // Variable to store user's qualification

// // Function to fetch user profile based on email
// async function fetchUserProfile() {
//   const user = window.auth.currentUser;

//   if (user) {
//     const userEmail = user.email;

//     try {
//       const userProfileDocRef = doc(window.db, "user_profile", userEmail);
//       const docSnapshot = await getDoc(userProfileDocRef);

//       if (docSnapshot.exists()) {
//         const userProfileData = docSnapshot.data();

//         // Safely get qualification
//         if (
//           userProfileData.education &&
//           Array.isArray(userProfileData.education) &&
//           userProfileData.education.length > 0
//         ) {
//           userQualificationFromProfile =
//             userProfileData.education[0].degree || "";
//         } else {
//           console.warn("User education data is missing or empty");
//           userQualificationFromProfile = "";
//         }

//         // Populate qualification input field with user's qualifications
//         if (useProfileQualificationCheckbox.checked) {
//           qualificationInput.value = userQualificationFromProfile;
//         }
//       } else {
//         console.log("No user profile found for email:", userEmail);
//       }
//     } catch (error) {
//       console.error("Error fetching user profile:", error);
//     }
//   } else {
//     console.log("No user is signed in.");
//   }
// }

// // Event listener to handle checkbox state change
// useProfileQualificationCheckbox.addEventListener("change", () => {
//   if (useProfileQualificationCheckbox.checked) {
//     // Disable qualification input and use user profile qualification
//     qualificationInput.value = userQualificationFromProfile;
//     qualificationInput.disabled = true;
//   } else {
//     // Enable qualification input for manual entry
//     qualificationInput.disabled = false;
//     qualificationInput.value = "";
//   }
// });

// // Call fetchUserProfile when the user is authenticated
// window.auth.onAuthStateChanged((user) => {
//   if (user) {
//     fetchUserProfile();
//   }
// });

// // Function to track filters and job search results together
// function trackSearchResultsAndFilters(selectedFilters, jobResults) {
//   const appliedFilters = {};

//   // Check and add only applied filters to the event if they have a valid value
//   if (selectedFilters.jobType && selectedFilters.jobType !== "none") {
//     appliedFilters.job_type = selectedFilters.jobType;
//   }
//   if (
//     selectedFilters.location &&
//     selectedFilters.location !== "none" &&
//     selectedFilters.location !== ""
//   ) {
//     appliedFilters.location = selectedFilters.location;
//   }
//   if (
//     selectedFilters.qualification &&
//     selectedFilters.qualification !== "none" &&
//     selectedFilters.qualification !== ""
//   ) {
//     appliedFilters.qualification = selectedFilters.qualification;
//   }
//   if (
//     selectedFilters.profile &&
//     selectedFilters.profile !== "none" &&
//     selectedFilters.profile !== ""
//   ) {
//     appliedFilters.profile = selectedFilters.profile;
//   }
//   if (
//     selectedFilters.company &&
//     selectedFilters.company !== "none" &&
//     selectedFilters.company !== ""
//   ) {
//     appliedFilters.company = selectedFilters.company;
//   }

//   // Prepare the event data
//   const eventData = {
//     ...appliedFilters,
//     job_code:
//       jobResults.length > 0 ? jobResults?.map((job) => job.job_code) : "nojob",
//     debug_mode: true, // Enable debug mode for development
//   };

//   // Send event if at least one filter is applied or job results are available
//   if (Object.keys(appliedFilters).length > 0 || jobResults.length === 0) {
//     gtag("event", "job_search_with_filters", eventData);
//   }
// }

// // Function to display results based on user input
// async function displayResults(
//   selectedJobType,
//   selectedLocation,
//   selectedQualification,
//   selectedProfile,
//   selectedCompany,
//   page
// ) {
//   // Split comma-separated values for each filter
//   const locationArray = selectedLocation
//     ? selectedLocation.split(",").map((loc) => loc.trim().toLowerCase())
//     : [];
//   const jobTypeArray = selectedJobType
//     ? selectedJobType.split(",").map((type) => type.trim().toLowerCase())
//     : [];
//   const profileArray = selectedProfile
//     ? selectedProfile.split(",").map((profile) => profile.trim().toLowerCase())
//     : [];
//   const companyArray = selectedCompany
//     ? selectedCompany.split(",").map((company) => company.trim().toLowerCase())
//     : [];

//   // Check if "Graduation" is entered, and expand it to all relevant degrees
//   const qualificationArray = selectedQualification
//     ? selectedQualification.split(",").map((qual) => qual.trim().toLowerCase())
//     : [];
//   if (qualificationArray.includes("graduation")) {
//     qualificationArray.push(...qualificationMapping.graduation);
//   }
//   if (qualificationArray.includes("post graduation")) {
//     qualificationArray.push(...qualificationMapping.postGraduation);
//   }

//   const jobs = jobs_data.filter((job) => {
//     // Match job type
//     const jobTypeMatch =
//       !jobTypeArray.length ||
//       jobTypeArray.includes("all") ||
//       jobTypeArray.includes(job?.job_type?.toLowerCase());

//     // Match location
//     const locationMatch =
//       !locationArray.length ||
//       locationArray.includes("india") ||
//       job?.location?.trim() === "" ||
//       locationArray.some((loc) => job?.location?.toLowerCase().includes(loc));

//     // Match qualification (with expanded qualifications like Graduation)
//     const qualificationMatch =
//       !qualificationArray.length ||
//       qualificationArray.some((qual) =>
//         job?.qualification_eligibility?.toLowerCase().includes(qual)
//       );

//     // Match profile
//     const profileMatch =
//       !profileArray.length ||
//       profileArray.some(
//         (profile) =>
//           job?.job_code?.toLowerCase().includes(profile) ||
//           job?.post_code?.toLowerCase().includes(profile)
//       );

//     // Match company
//     const companyMatch =
//       !companyArray.length ||
//       companyArray.some(
//         (company) =>
//           job?.company?.toLowerCase().includes(company) ||
//           job?.recruitment_board?.toLowerCase().includes(company)
//       );

//     // Return true if all conditions match
//     return (
//       jobTypeMatch &&
//       locationMatch &&
//       qualificationMatch &&
//       profileMatch &&
//       companyMatch
//     );
//   });

//   console.log("Filtered Jobs:", jobs); // Check filtered jobs in console

//   // Render filtered and paginated jobs
//   renderPaginatedJobsAndControls(jobs, page);
//   return jobs;
// }

// // Event listener to clear filters data when the user clicks the "clear All" button
// clearAllButton.addEventListener("click", (e) => {
//   e.preventDefault();
//   jobTypeSelect.value = "all";
//   locationSelect.value = "";
//   qualificationInput.value = "";
//   profileSelect.value = "";
//   companySelect.value = "";
//   qualificationInput.disabled = false;
//   useProfileQualificationCheckbox.checked = false;
// });

// // Event listener to apply filters and search jobs
// submitButton.addEventListener("click", async (e) => {
//   e.preventDefault();

//   // Get selected filters
//   const selectedFilters = {
//     jobType: jobTypeSelect.value,
//     location: locationSelect.value,
//     qualification: qualificationInput.value,
//     profile: profileSelect.value,
//     company: companySelect.value,
//   };

//   // Update the URL with selected parameters
//   const url = `?jobType=${selectedFilters.jobType}&location=${selectedFilters.location}&qualification=${selectedFilters.qualification}&profile=${selectedFilters.profile}&company=${selectedFilters.company}`;
//   history.pushState(null, "", url);

//   // Display job results based on the selected filters
//   const jobResults = await displayResults(
//     selectedFilters.jobType,
//     selectedFilters.location,
//     selectedFilters.qualification,
//     selectedFilters.profile,
//     selectedFilters.company,
//     1
//   );

//   // Track filters and job search results together
//   trackSearchResultsAndFilters(selectedFilters, jobResults);
// });

// import { query, collection, orderBy, getDocs, getFirestore } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// const db = getFirestore(app);



