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

window.applyToJob = applyToJob;



const jobsPerPage = 30;

// Mapping for qualification filtering
const qualificationMapping = {
  graduation: ["b.a", "b.sc", "b.com", "b.tech", "b.e", "bba"],
  postGraduation: ["m.a", "m.sc", "m.com", "m.tech", "mba"],
};


async function loadFirebaseJobs() {
  const companiesRef = collection(db, "jobs_company_wise");
  const companySnapshots = await getDocs(companiesRef);

  let allJobs = [];

  for (const docSnap of companySnapshots.docs) {
    const companyData = docSnap.data();
    const companyJobs = companyData.jobs || [];

    // Tag each job with its companyCode (doc ID)
    const jobsWithCompany = companyJobs.map((job) => ({
      ...job,
      companyCode: docSnap.id,
      source: "firebase",
    }));

    allJobs = allJobs.concat(jobsWithCompany);
  }
  

  console.log("Fetched Firebase Jobs:", allJobs); // ✅ Log to console
  return allJobs;
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
      <a href="/careeroptions/jobdetails/?jobId=${job.jobId}&companyCode=${job.companyCode}" 
        target="_blank" 
        class="btn btn-sm btn-secondary">Know More</a>

<a href="#" 
   class="btn mt-2 btn-sm btn-primary apply-btn"
   data-jobcode="${job.jobId}"
   data-companycode="${job.companyCode}" 
   onclick="applyToJob('${job.jobId}', '${job.companyCode}')">
   Apply
</a>
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
async function applyToJob(jobId, companyCode) {
  const userEmail = localStorage.getItem("email");
  const uid = localStorage.getItem("uid");
  const name = localStorage.getItem("userName") || "";
  const resumeUrl = localStorage.getItem("resumeUrl") || "";

  if (!userEmail || !uid) {
    alert("You need to be logged in to apply.");
    return;
  }

  try {
    const companyRef = doc(db, "jobs_company_wise", companyCode);
    const companySnap = await getDoc(companyRef);

    if (!companySnap.exists()) {
      console.error("Company not found:", companyCode);
      return;
    }

    const companyData = companySnap.data();
    const jobs = companyData.jobs || [];

    const jobIndex = jobs.findIndex((job) => job.jobId === jobId);
    if (jobIndex === -1) {
      console.error("Job not found in company:", jobId);
      return;
    }

    const job = jobs[jobIndex];
    const alreadyApplied = (job.applicants || []).some(
      (applicant) => applicant.uid === uid || applicant.email === userEmail
    );

    if (alreadyApplied) {
      alert("You've already applied to this job.");
      return;
    }

    // Add applicant to the job's applicants array
    const newApplicant = {
      uid,
      email: userEmail,
      name,
      resumeUrl,
      appliedAt: new Date().toISOString(),
    };

    if (!job.applicants) job.applicants = [];
    job.applicants.push(newApplicant);

    // Update the job in the jobs array
    jobs[jobIndex] = job;

    // Update the company document with the new jobs array
    await updateDoc(companyRef, {
      jobs: jobs,
    });

    alert("Application submitted successfully.");
   const btn = document.querySelector(`[data-jobcode="${jobId}"]`);
    if (btn) {
      btn.innerText = "Applied";
      btn.disabled = true;
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-success");
    }
  } catch (error) {
    console.error("Error applying to job:", error);
    alert("Something went wrong while applying.");
  }
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

  markAlreadyAppliedJobs();
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
// need only one company name 
// async function loadCompanyJobs(companyId) {
//   const companyRef = doc(db, "jobs_company_wise", companyId);
//   const companySnap = await getDoc(companyRef);

//   if (!companySnap.exists()) return [];

//   const companyData = companySnap.data();
//   const companyJobs = companyData.jobs || [];

//   return companyJobs.map((job) => ({
//     ...job,
//     companyCode: companyId,
//     source: "firebase",
//   }));
// }
