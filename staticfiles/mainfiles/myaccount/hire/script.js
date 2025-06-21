
// const firestore = getFirestore(app);

// const openBtn = document.getElementById("openModalBtn");
// const closeBtn = document.getElementById("closeModalBtn");
// const modal = document.getElementById("jobModal");
// const form = document.getElementById("jobForm");
// const jobList = document.getElementById("jobList");
// const modalTitle = document.getElementById("modalTitle");

// let editMode = false;
// let editJobId = null;
// let currentCompanyData = null;
// let editingJob = null;

// openBtn.onclick = () => {
//   console.log("Open modal button clicked.");
//   modalTitle.textContent = "Post a New Job";
//   form.reset();
//   modal.style.display = "flex";
//   editMode = false;
//   editJobId = null;
//   editingJob = null;
// };

// closeBtn.onclick = () => {
//   console.log("Close modal button clicked.");
//   modal.style.display = "none";
// };

// window.onclick = e => {
//   if (e.target === modal) {
//     console.log("Clicked outside modal, closing.");
//     modal.style.display = "none";
//   }
// };

// function timeAgo(date) {
//   if (!date || typeof date.toDate !== 'function') {
//     console.log("Invalid or missing timestamp in timeAgo.");
//     return "unknown time";
//   }

//   const seconds = Math.floor((new Date() - date.toDate()) / 1000);
//   const intervals = [
//     { label: "year", seconds: 31536000 },
//     { label: "month", seconds: 2592000 },
//     { label: "day", seconds: 86400 },
//     { label: "hour", seconds: 3600 },
//     { label: "minute", seconds: 60 },
//     { label: "second", seconds: 1 }
//   ];
//   for (const i of intervals) {
//     const count = Math.floor(seconds / i.seconds);
//     if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
//   }
//   return "just now";
// }

// function renderJob(job) {
//   console.log("Rendering job:", job.jobId);
//   const div = document.createElement("div");
//   div.className = "job-card";

//   div.innerHTML = `
//     <h3>${job.title}</h3>
//     <p><strong>${job.company}</strong> • ${job.location}</p>
//     <p>
//       <span class="badge">${job.type}</span>
//       <span class="badge">${job.salary || "N/A"}</span>
//     </p>
//     <p>${job.description}</p>
//     <p><em>Posted ${timeAgo(job.timestamp)}</em></p>
//     <div class="actions">
//       <button class="viewBtn">🔍</button>
//       <button class="editBtn" data-job-id="${job.jobId}" data-company-code="${job.companyCode}">✏️</button>
//       <button class="deleteBtn" data-job-id="${job.jobId}" data-company-code="${job.companyCode}">🗑️</button>
//     </div>
//     <p><strong>Applicants:</strong> ${job.applicants?.length || 0}</p>
//   `;

//   jobList.appendChild(div);

//   div.querySelector(".viewBtn").addEventListener("click", () =>
//     viewDetails(job.jobId)
//   );
//   div.querySelector(".editBtn").addEventListener("click", e => {
//     console.log(`Edit clicked for jobId: ${e.target.dataset.jobId}, companyCode: ${e.target.dataset.companyCode}`);
//     editJob(e.target.dataset.jobId, e.target.dataset.companyCode);
//   });
//   div.querySelector(".deleteBtn").addEventListener("click", e => {
//     console.log(`Delete clicked for jobId: ${e.target.dataset.jobId}, companyCode: ${e.target.dataset.companyCode}`);
//     deleteJob(e.target.dataset.jobId, e.target.dataset.companyCode);
//   });
// }

// async function loadJobs(companyData, isMasterAdmin = false) {
//   console.log("Loading jobs for companyData:", companyData, "isMasterAdmin:", isMasterAdmin);
//   jobList.innerHTML = "";

//   if (isMasterAdmin) {
//     const querySnapshot = await getDocs(collection(firestore, "jobs_company_wise"));

//     let allJobs = [];
//     querySnapshot.forEach(docSnap => {
//       const companyJobs = docSnap.data().jobs || [];
//       allJobs = allJobs.concat(companyJobs);
//     });

//     if (allJobs.length === 0) {
//       console.log("No jobs found across all companies.");
//       jobList.innerHTML = "<p>No jobs posted yet.</p>";
//       return;
//     }

//     console.log(`🔎 Master Admin: Loaded ${allJobs.length} jobs across all companies.`);
//     allJobs.forEach(renderJob);
//     return;
//   }

//   const companyRef = doc(firestore, "jobs_company_wise", companyData.code);
//   const companySnap = await getDoc(companyRef);

//   if (!companySnap.exists()) {
//     console.warn("Company not found:", companyData.code);
//     alert("Company not found.");
//     return;
//   }

//   const jobArray = companySnap.data().jobs || [];

//   if (jobArray.length === 0) {
//     console.log(`No jobs found for company ${companyData.code}.`);
//     jobList.innerHTML = "<p>No jobs posted yet.</p>";
//     return;
//   }

//   console.log(`Loaded ${jobArray.length} jobs for company ${companyData.code}.`);
//   jobArray.forEach(renderJob);
// }

// function viewDetails(jobId) {
//   console.log("View details for jobId:", jobId);
//   window.location.href = `/hire/candidates?jobId=${jobId}`;
// }

// function generateJobId(company, title) {
//   const clean = str =>
//     str.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
//   const id = `${clean(company)}_${clean(title)}_${Date.now()}`;
//   console.log("Generated jobId:", id);
//   return id;
// }

// function fillFormWithJob(job) {
//   console.log("Filling form with job data:", job.jobId);
//   document.getElementById("jobTitle").value = job.title || "";
//   document.getElementById("company").value = job.companyCode || "";
//   document.getElementById("location").value = job.location || "";
//   document.getElementById("jobType").value = job.type || "";
//   document.getElementById("description").value = job.description || "";
//   document.getElementById("qualification").value = job.qualification || "";
//   document.getElementById("board").value = job.RecruitmentBoard || "";
//   document.getElementById("minAge").value = job.minAge || "";
//   document.getElementById("maxAge").value = job.maxAge || "";
//   document.getElementById("deadline").value = job.applicationDeadline || "";
//   document.getElementById("profile").value = job.profileCode || "";
// }

// async function editJob(jobId, companyCode) {
//   console.log("Editing job with jobId:", jobId, "companyCode:", companyCode);
//   const companyRef = doc(firestore, "jobs_company_wise", companyCode);
//   const companySnap = await getDoc(companyRef);

//   const jobList = companySnap.data().jobs || [];
//   const job = jobList.find(j => j.jobId === jobId);

//   if (!job) {
//     console.warn("Job not found in company record:", jobId);
//     alert("Job not found in company record.");
//     return;
//   }

//   fillFormWithJob(job);
//   modal.style.display = "flex";
//   editMode = true;
//   editJobId = jobId;
//   editingJob = job;
//   modalTitle.textContent = "Edit Job";
// }

// async function deleteJob(jobId, companyCode) {
//   console.log("Deleting job with jobId:", jobId, "companyCode:", companyCode);
//   if (!confirm("Are you sure you want to delete this job?")) {
//     console.log("Delete cancelled.");
//     return;
//   }

//   const companyRef = doc(firestore, "jobs_company_wise", companyCode);
//   const companySnap = await getDoc(companyRef);
//   const companyData = companySnap.data();
//   const updatedJobs = (companyData.jobs || []).filter(j => j.jobId !== jobId);

//   await updateDoc(companyRef, { jobs: updatedJobs });
//   console.log(`Job ${jobId} deleted successfully.`);

//   const userRole = localStorage.getItem("userRole");
//   const isMasterAdmin = userRole === "master_admin";
//   loadJobs(currentCompanyData, isMasterAdmin);
// }

// form.addEventListener("submit", async e => {
//   e.preventDefault();
//   console.log("Form submitted.");

//   const selectedCompanyCode = document.getElementById("company").value;
//   const selectedCompanyName =
//     document.getElementById("company").selectedOptions[0].text;

//   let job = {
//     jobId: editMode ? editJobId : generateJobId(selectedCompanyName, document.getElementById("jobTitle").value),
//     title: document.getElementById("jobTitle").value.trim(),
//     company: selectedCompanyName,
//     companyCode: selectedCompanyCode,
//     location: document.getElementById("location").value.trim(),
//     type: document.getElementById("jobType").value,
//     salary: "",
//     description: document.getElementById("description").value.trim(),
//     requirements: "",
//     qualification: document.getElementById("qualification").value.trim(),
//     RecruitmentBoard: document.getElementById("board").value.trim(),
//     minAge: Number(document.getElementById("minAge").value) || null,
//     maxAge: Number(document.getElementById("maxAge").value) || null,
//     applicationDeadline: document.getElementById("deadline").value,
//     profileCode: document.getElementById("profile").value,
//     timestamp: new Date(),
//     applicants: editingJob?.applicants || []
//   };

//   console.log("Job object to save:", job);

//   const companyRef = doc(firestore, "jobs_company_wise", selectedCompanyCode);
//   const companySnap = await getDoc(companyRef);
//   let jobsArray = companySnap.data().jobs || [];

//   if (editMode) {
//     jobsArray = jobsArray.map(j => (j.jobId === editJobId ? job : j));
//     console.log("Updated job in array.");
//   } else {
//     jobsArray.push(job);
//     console.log("Added new job to array.");
//   }

//   await updateDoc(companyRef, { jobs: jobsArray });
//   console.log("Jobs array updated in Firestore.");

//   modal.style.display = "none";
//   loadJobs({ code: selectedCompanyCode, name: selectedCompanyName }, localStorage.getItem("userRole") === "master_admin");
// });

// function initHirePortal(companyData, isMasterAdmin = false) {
//   console.log("Initializing hire portal with companyData:", companyData, "isMasterAdmin:", isMasterAdmin);
//   currentCompanyData = companyData;
//   loadJobs(companyData, isMasterAdmin);
// }

// document.addEventListener("DOMContentLoaded", async () => {
//   console.log("DOM fully loaded, initializing...");

//   let companyData = JSON.parse(localStorage.getItem("companyData"));
//   let userRole = null;
//   let email = localStorage.getItem("email");
//   let isMasterAdmin = false;

//   if (!companyData && email) {
//     console.log("No companyData in localStorage, fetching role for email:", email);
//     const roleDocRef = doc(firestore, "login_roles", email);
//     const roleDocSnap = await getDoc(roleDocRef);

//     if (roleDocSnap.exists()) {
//       const roleInfo = roleDocSnap.data();
//       userRole = roleInfo.role;

//       console.log("User role fetched:", userRole);

//       if (userRole === "master_admin") {
//         isMasterAdmin = true;
//         companyData = { name: "All Companies", code: "all" };
//         console.log("User is master_admin.");
//       } else {
//         const companyCode = roleInfo.company_code;
//         companyData = { name: companyCode, code: companyCode };
//         console.log(`User is recruiter for company: ${companyCode}`);
//       }

//       localStorage.setItem("companyData", JSON.stringify(companyData));
//       localStorage.setItem("userRole", userRole);
//     } else {
//       console.warn("Role document does not exist for email:", email);
//     }
//   }

//   if (!companyData) {
//     alert("No company data found. Please login again.");
//     window.location.href = "/login/";
//     return;
//   }

//   initHirePortal(companyData, localStorage.getItem("userRole") === "master_admin");
// });


const firestore = getFirestore(app);

const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.getElementById("closeModalBtn");
const modal = document.getElementById("jobModal");
const form = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const modalTitle = document.getElementById("modalTitle");

let editMode = false;
let editJobId = null;
let currentCompanyData = null;
let editingJob = null;

openBtn.onclick = () => {
  modalTitle.textContent = "Post a New Job";
  form.reset();
  modal.style.display = "flex";
  editMode = false;
  editJobId = null;
  editingJob = null;
};

closeBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = e => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};

window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromURL = urlParams.get("email");

  if (emailFromURL) {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = emailFromURL;

      // Trigger search using your existing function
      const results = await filterByNameEmail();

      // Optional: auto-render or scroll to the result if needed
      console.log("Auto-search triggered for email:", emailFromURL);
    }
  }
});


function timeAgo(date) {
  if (!date || typeof date.toDate !== 'function') return "unknown time";
  const seconds = Math.floor((new Date() - date.toDate()) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 }
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.seconds);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function renderJob(job) {
  const div = document.createElement("div");
  div.className = "job-card";

  div.innerHTML = `
    <h3>${job.title}</h3>
    <p><strong>${job.company}</strong> • ${job.location}</p>
    <p>
      <span class="badge">${job.type}</span>
      <span class="badge">${job.salary || "N/A"}</span>
    </p>
    <p>${job.description}</p>
    <p><em>Posted ${timeAgo(job.timestamp)}</em></p>
    <div class="actions">
      <button class="viewBtn">🔍</button>
      <button class="editBtn" data-job-id="${job.jobId}" data-company-code="${job.companyCode}">✏️</button>
      <button class="deleteBtn" data-job-id="${job.jobId}" data-company-code="${job.companyCode}">🗑️</button>
    </div>
    <p><strong>Applicants:</strong>
  ${job.applicants?.length
    ? job.applicants
        .map(
          (a) => `<a href="/myaccount/hire/candidates?email=${encodeURIComponent(a.email)}"target="_blank" class="applicant-link">${a.email}</a>`
        )
        .join(", ")
    : "None"}
</p>

</p>

  `;

  jobList.appendChild(div);

  div.querySelector(".viewBtn").addEventListener("click", () => viewDetails(job.jobId));
  div.querySelector(".editBtn").addEventListener("click", e => {
    editJob(e.target.dataset.jobId, e.target.dataset.companyCode);
  });
  div.querySelector(".deleteBtn").addEventListener("click", e => {
    deleteJob(e.target.dataset.jobId, e.target.dataset.companyCode);
  });
}

async function loadJobs(companyData, isMasterAdmin = false) {
  jobList.innerHTML = "";

  if (isMasterAdmin) {
    const querySnapshot = await getDocs(collection(firestore, "jobs_company_wise"));
    let allJobs = [];
    querySnapshot.forEach(docSnap => {
      const jobsObject = docSnap.data().jobs || {};
      allJobs = allJobs.concat(Object.values(jobsObject));
    });
    if (allJobs.length === 0) {
      jobList.innerHTML = "<p>No jobs posted yet.</p>";
      return;
    }
    allJobs.forEach(renderJob);
    return;
  }

  const companyRef = doc(firestore, "jobs_company_wise", companyData.code);
  const companySnap = await getDoc(companyRef);

  if (!companySnap.exists()) {
    alert("Company not found.");
    return;
  }

  const jobsObject = companySnap.data().jobs || {};
  const jobArray = Object.values(jobsObject);

  if (jobArray.length === 0) {
    jobList.innerHTML = "<p>No jobs posted yet.</p>";
    return;
  }

  jobArray.forEach(renderJob);
}

function viewDetails(jobId) {
  window.location.href = `/hire/candidates?jobId=${jobId}`;
}

function generateJobId(company, title) {
  const clean = str => str.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `${clean(company)}_${clean(title)}_${Date.now()}`;
}

function fillFormWithJob(job) {
  document.getElementById("jobTitle").value = job.title || "";
  document.getElementById("company").value = job.companyCode || "";
  document.getElementById("location").value = job.location || "";
  document.getElementById("jobType").value = job.type || "";
  document.getElementById("description").value = job.description || "";
  document.getElementById("qualification").value = job.qualification || "";
  document.getElementById("board").value = job.RecruitmentBoard || "";
  document.getElementById("minAge").value = job.minAge || "";
  document.getElementById("maxAge").value = job.maxAge || "";
  document.getElementById("deadline").value = job.applicationDeadline || "";
  document.getElementById("profile").value = job.profileCode || "";
}

async function editJob(jobId, companyCode) {
  const companyRef = doc(firestore, "jobs_company_wise", companyCode);
  const companySnap = await getDoc(companyRef);
  const jobsObject = companySnap.data().jobs || {};
  const job = jobsObject[jobId];

  if (!job) {
    alert("Job not found in company record.");
    return;
  }

  fillFormWithJob(job);
  modal.style.display = "flex";
  editMode = true;
  editJobId = jobId;
  editingJob = job;
  modalTitle.textContent = "Edit Job";
}

async function deleteJob(jobId, companyCode) {
  if (!confirm("Are you sure you want to delete this job?")) return;

  const companyRef = doc(firestore, "jobs_company_wise", companyCode);
  const companySnap = await getDoc(companyRef);
  const companyData = companySnap.data();
  const jobsObject = companyData.jobs || {};
  delete jobsObject[jobId];

  await updateDoc(companyRef, { jobs: jobsObject });

  const isMasterAdmin = localStorage.getItem("userRole") === "master_admin";
  loadJobs(currentCompanyData, isMasterAdmin);
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const selectedCompanyCode = document.getElementById("company").value;
  const selectedCompanyName = document.getElementById("company").selectedOptions[0].text;

  const jobId = editMode ? editJobId : generateJobId(selectedCompanyName, document.getElementById("jobTitle").value);
  const job = {
    jobId,
    title: document.getElementById("jobTitle").value.trim(),
    company: selectedCompanyName,
    companyCode: selectedCompanyCode,
    location: document.getElementById("location").value.trim(),
    type: document.getElementById("jobType").value,
    salary: "",
    description: document.getElementById("description").value.trim(),
    requirements: "",
    qualification: document.getElementById("qualification").value.trim(),
    RecruitmentBoard: document.getElementById("board").value.trim(),
    minAge: Number(document.getElementById("minAge").value) || null,
    maxAge: Number(document.getElementById("maxAge").value) || null,
    applicationDeadline: document.getElementById("deadline").value,
    profileCode: document.getElementById("profile").value,
    timestamp: new Date(),
    applicants: editingJob?.applicants || []
  };

  const companyRef = doc(firestore, "jobs_company_wise", selectedCompanyCode);
  const companySnap = await getDoc(companyRef);
  const existingJobs = companySnap.exists() ? companySnap.data().jobs : {};

  let jobsObject = {};

  // ✅ Convert to object if it was an array
  if (Array.isArray(existingJobs)) {
    existingJobs.forEach(j => {
      if (j.jobId) jobsObject[j.jobId] = j;
    });
  } else {
    jobsObject = existingJobs || {};
  }

  // ✅ Add or update job using object key
  jobsObject[jobId] = job;

  await updateDoc(companyRef, { jobs: jobsObject });

  modal.style.display = "none";
  loadJobs({ code: selectedCompanyCode, name: selectedCompanyName }, localStorage.getItem("userRole") === "master_admin");
});


function initHirePortal(companyData, isMasterAdmin = false) {
  currentCompanyData = companyData;
  loadJobs(companyData, isMasterAdmin);
}

document.addEventListener("DOMContentLoaded", async () => {
  let companyData = JSON.parse(localStorage.getItem("companyData"));
  let email = localStorage.getItem("email");

  if (!companyData && email) {
    const roleDocRef = doc(firestore, "login_roles", email);
    const roleDocSnap = await getDoc(roleDocRef);

    if (roleDocSnap.exists()) {
      const roleInfo = roleDocSnap.data();
      const userRole = roleInfo.role;

      if (userRole === "master_admin") {
        companyData = { name: "All Companies", code: "all" };
      } else {
        const companyCode = roleInfo.company_code;
        companyData = { name: companyCode, code: companyCode };
      }

      localStorage.setItem("companyData", JSON.stringify(companyData));
      localStorage.setItem("userRole", userRole);
    } else {
      alert("User role not found.");
    }
  }

  if (!companyData) {
    alert("No company data found. Please login again.");
    window.location.href = "/login/";
    return;
  }

  initHirePortal(companyData, localStorage.getItem("userRole") === "master_admin");
});
