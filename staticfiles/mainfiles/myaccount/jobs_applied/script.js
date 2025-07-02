import { db } from '/staticfiles/db/dbconfig.js';
import { getDoc, doc, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const email = localStorage.getItem("email");
console.log("Email used for Firestore:", email);

if (!email) {
  window.location.href = "/login/";
}

document.addEventListener("DOMContentLoaded", async function () {
  await checkAndDisplayUserJobs();
});

async function checkAndDisplayUserJobs() {
  try {
    // 1. Get user's applied job IDs
    const userJobsRef = doc(db, "jobs_applied", email);
    const userJobsSnap = await getDoc(userJobsRef);

    if (!userJobsSnap.exists()) {
      console.log("User has not applied to any jobs.");
      renderNoJobs();
      return;
    }

    const appliedJobsObj = userJobsSnap.data();
    const appliedJobIds = (appliedJobsObj.appliedJobs || []).map(job => (job.jobId || "").trim());
    console.log("User applied job IDs:", appliedJobIds);

    if (!appliedJobIds.length) {
      renderNoJobs();
      return;
    }

    // 2. Get all jobs from company-wise collection
    const jobsSnapshot = await getDocs(collection(db, "jobs_company_wise"));
    const allJobs = [];

    jobsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.jobs && typeof data.jobs === 'object') {
        const jobsMap = data.jobs;

        for (const [key, jobData] of Object.entries(jobsMap)) {
          if (jobData && typeof jobData === 'object') {
            const jobId = jobData.jobId || key;
            allJobs.push({ ...jobData, jobId: jobId.trim() });
          }
        }
      }
    });

    console.log("All jobs retrieved:", allJobs.map(j => j.jobId));

    // 3. Filter jobs that match appliedJobIds
    const userAppliedJobs = allJobs.filter(job =>
      appliedJobIds.includes((job.jobId || "").trim())
    );

    console.log("Matched jobs:", userAppliedJobs);
    renderJobs(userAppliedJobs);

  } catch (error) {
    console.error("Error fetching jobs:", error);
    renderNoJobs();
  }
}

function renderJobs(jobs) {
  const tableBody = document.querySelector('#jobTable tbody');
  tableBody.innerHTML = '';

  if (!jobs.length) {
    renderNoJobs();
    return;
  }

  jobs.forEach(job => {
    const row = tableBody.insertRow();
    row.insertCell().textContent = job.jobId || '';
    row.insertCell().textContent = job.title || '';
    row.insertCell().textContent = job.type || '';
    row.insertCell().textContent = job.location || '';
    row.insertCell().textContent = job.salary || job.stipend || '';
    row.classList.add('applied');
  });
}

function renderNoJobs() {
  const tableBody = document.querySelector('#jobTable tbody');
  tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No jobs applied yet.</td></tr>';
}
