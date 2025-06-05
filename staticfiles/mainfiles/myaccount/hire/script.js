


console.log("🔧 Script loaded...");

const firestore = getFirestore(app);

// async function checkAdmin() {
//   const userDocRef = doc(firestore, "users", localStorage.getItem("uid"));
//   const userDocSnapshot = await getDoc(userDocRef);

//   if (userDocSnapshot.exists() && userDocSnapshot.data().isAdmin) {
//     console.log("✅ User is admin");
//   } else {
//     console.warn("❌ User is not admin");
//     alert("Please login as admin to access this page.");
//     window.location.href = "/";
//   }
// }

// Run this at page load
// checkAdmin();

const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.getElementById("closeModalBtn");
const modal = document.getElementById("jobModal");
const form = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const modalTitle = document.getElementById("modalTitle");

let editMode = false;
let editJobId = null;

openBtn.onclick = () => {
  console.log("📝 Opening modal to post new job");
  modalTitle.textContent = "Post a New Job";
  form.reset();
  modal.style.display = "flex";
  editMode = false;
  editJobId = null;
};

closeBtn.onclick = () => {
  console.log("❌ Closing modal");
  modal.style.display = "none";
};

window.onclick = e => {
  if (e.target === modal) {
    console.log("❌ Clicked outside modal - closing");
    modal.style.display = "none";
  }
};

function timeAgo(date) {
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

function renderJob(doc) {
  const data = doc.data();
  console.log("📦 Rendering job:", data);

  const div = document.createElement("div");
  div.className = "job-card";

  div.innerHTML = `
    <h3>${data.title}</h3>
    <p><strong>${data.company}</strong> • ${data.location}</p>
    <p>
      <span class="badge">${data.type}</span>
      <span class="badge">${data.salary || "N/A"}</span>
    </p>
    <p>${data.description}</p>
    <p><em>Posted ${timeAgo(data.timestamp)}</em></p>
    <div class="actions">
      <button class="viewBtn">🔍</button>
      <button class="editBtn">✏️</button>
      <button class="deleteBtn">🗑️</button> 
      
    </div>
    <p><strong>Applicants:</strong> ${data.applicants?.length || 0}</p>
  `;

  jobList.appendChild(div);

  // Add event listeners for buttons:
  div.querySelector(".viewBtn").addEventListener("click", () => viewDetails(doc.id));
  div.querySelector(".editBtn").addEventListener("click", () => editJob(doc.id));
  div.querySelector(".deleteBtn").addEventListener("click", () => deleteJob(doc.id));
  // div.querySelector(".applyBtn").addEventListener("click", () => applyToJob(doc.id));
}

async function loadJobs() {
  console.log("🔄 Loading jobs...");
  jobList.innerHTML = "";

  try {
    const q = query(collection(firestore, "jobs"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    console.log(`📁 ${querySnapshot.size} job(s) found`);
    querySnapshot.forEach(renderJob);
  } catch (err) {
    console.error("❌ Failed to load jobs:", err);
  }
}

function viewDetails(id) {
  console.log("🔍 Viewing job details for ID:", id);
  window.location.href = `/hire/candidates?jobId=${id}`;
}

async function editJob(id) {
  console.log("✏️ Editing job with ID:", id);
  try {
    const jobDocRef = doc(firestore, "jobs", id);
    const jobDoc = await getDoc(jobDocRef);

    if (!jobDoc.exists()) {
      console.warn(`❌ Job with ID ${id} does not exist`);
      alert("Job not found.");
      return;
    }

    const data = jobDoc.data(); // ✅ Ensure this is declared
  document.getElementById("jobTitle").value = data.title || "";
document.getElementById("company").value = data.company || "";
document.getElementById("location").value = data.location || "";
document.getElementById("jobType").value = data.type || "";
document.getElementById("description").value = data.description || "";
document.getElementById("qualification").value = data.qualification || "";
document.getElementById("board").value = data.RecruitmentBoard || "";
document.getElementById("minAge").value = data.minAge || "";
document.getElementById("maxAge").value = data.maxAge || "";
document.getElementById("deadline").value = data.applicationDeadline || "";
document.getElementById("profile").value = data.profileCode || "";

  modal.style.display = "flex";
  editMode = true;
  editJobId = id;
  modalTitle.textContent = "Edit Job";
}
catch (error) {
    console.error("❌ Error editing job:", error);
    alert("Something went wrong while editing the job.");
  }
}

async function deleteJob(id) {
  if (confirm("Are you sure you want to delete this job?")) {
    console.log("🗑️ Deleting job with ID:", id);
    try {
      await deleteDoc(doc(firestore, "jobs", id));
      console.log("✅ Job deleted");
      loadJobs();
    } catch (err) {
      console.error("❌ Failed to delete job:", err);
      alert("Failed to delete job.");
    }
  }
}

// Helper: Create a safe, unique jobId based on company, title and timestamp
function generateJobId(company, title) {
  const clean = str =>
    str.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const companyPart = clean(company);
  const titlePart = clean(title);
  const timestampPart = Date.now();
  return `${companyPart}_${titlePart}_${timestampPart}`;
}

form.addEventListener("submit", async e => {
  e.preventDefault();

    const job = {
    title: document.getElementById("jobTitle").value.trim(),
    company: document.getElementById("company").value.trim(),
    location: document.getElementById("location").value.trim(),
    type: document.getElementById("jobType").value,
    salary: "", // no salary  in your form
    description: document.getElementById("description").value.trim(),
    requirements: "", // you can add a field or leave empty
    // You can also add qualification, board, age limits, deadline, profileCode here:
    qualification: document.getElementById("qualification").value.trim(),
    RecruitmentBoard: document.getElementById("board").value.trim(),
    minAge: document.getElementById("minAge").value ? Number(document.getElementById("minAge").value) : null,
    maxAge: document.getElementById("maxAge").value ? Number(document.getElementById("maxAge").value) : null,
    applicationDeadline: document.getElementById("deadline").value,
    profileCode: document.getElementById("profile").value.trim(),
    timestamp: new Date(),
    applicants: []
  };
  // If editing, use existing jobId, else generate new
  let jobId;
  if (editMode && editJobId) {
    jobId = editJobId;
    console.log("🛠️ Updating job with ID:", jobId);
  } else {
    jobId = generateJobId(job.company, job.title);
    console.log("📤 Posting new job with generated ID:", jobId);
  }

  job.jobId = jobId; // store inside document for redundancy

  try {
    const jobRef = doc(firestore, "jobs", jobId);

    // If new job, check if ID already exists to avoid overwrite
    if (!editMode) {
      const existingDoc = await getDoc(jobRef);
      if (existingDoc.exists()) {
        alert("A job with similar company and title was recently posted. Please modify your job title or company.");
        console.warn("⚠️ Duplicate jobId detected:", jobId);
        return;
      }
    }

    await setDoc(jobRef, job);
    modal.style.display = "none";
    loadJobs();
  } catch (err) {
    console.error("❌ Failed to save job:", err);
    alert("Failed to save job. Please try again.");
  }
});

loadJobs();

// async function applyToJob(jobId) {
//   const email = localStorage.getItem("email"); // Make sure you store user email on login
//   const userId = localStorage.getItem("uid");
//   const name = localStorage.getItem("userName") || "";
//   const resumeUrl = localStorage.getItem("resumeUrl") || "";

//   if (!email) {
//     alert("You need to be logged in to apply.");
//     return;
//   }

//    if (!userId) {
//     alert("You need to be logged in to apply.");
//     return;
//   }

//   const jobRef = doc(firestore, "jobs", jobId);
//   const jobSnap = await getDoc(jobRef);

//   if (!jobSnap.exists()) {
//     alert("Job not found.");
//     return;
//   }

//   const jobData = jobSnap.data();

//   const alreadyApplied = jobData.applicants?.some(a => a.userId === userId);
  
//   if (alreadyApplied) {
//     alert("You have already applied for this job.");
//     return;
//   }
//   const applicant = {
//     userId,
//     name,
//     resumeUrl,
//     appliedAt: new Date().toISOString(),
//     status: "applied"
//     email
//   };

//   try {
//     await updateDoc(jobRef, {
//       applicants: arrayUnion(applicant)
//     });
//     alert("✅ Application successful!");
//     loadJobs(); // refresh counts
//   } catch (error) {
//     console.error("❌ Failed to apply:", error);
//     alert("Failed to apply. Please try again.");
//   }
// }


//   try {
//     await updateDoc(doc(firestore, "jobs", jobId), {
//       applicants: arrayUnion(email)
//     });
//     alert("✅ Application successful!");
//     loadJobs(); // Refresh the jobs list to update applicant count
//   } catch (error) {
//     console.error("❌ Failed to apply:", error);
//     alert("Failed to apply. Please try again.");
//   }
// }
