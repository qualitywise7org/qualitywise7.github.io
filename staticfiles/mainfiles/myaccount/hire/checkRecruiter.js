// // checkRecruiter.js
// import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
// import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// const auth = getAuth();
// const db = getFirestore();

// onAuthStateChanged(auth, async (user) => {
//   if (!user) {
//     window.location.href = "/login/";
//     return;
//   }

//   try {
//     const roleDocRef = doc(db, "login_roles", user.email);
//     const roleDocSnap = await getDoc(roleDocRef);

//     if (!roleDocSnap.exists() || (roleDocSnap.data().role !== "recruiter" && roleDocSnap.data().role !== "master_admin")) {
//       alert("Access denied. Recruiter or Master Admin role required.");
//       window.location.href = "/";
//     }
//   } catch (error) {
//     console.error("Error checking role:", error);
//     alert("Error verifying user role. Please contact support.");
//     window.location.href = "/login/";
//   }
// });


import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();


// // initHirePortal(window.companyData);
// onAuthStateChanged(auth, async (user) => {
//   if (!user) {
//     console.warn("❌ No user logged in. Redirecting to login.");
//     window.location.href = "/login/";
//     return;
//   }

//   console.log("✅ User logged in:", user.email);

//   try {
//     const roleDocRef = doc(db, "login_roles", user.email);
//     const roleDocSnap = await getDoc(roleDocRef);

//     if (!roleDocSnap.exists()) {
//       console.warn("❌ Role document not found for:", user.email);
//       alert("Access denied. Role not found.");
//       window.location.href = "/";
//       return;
//     }

//     const userRole = roleDocSnap.data().role;
//     const companyName = roleDocSnap.data().company;

//     console.log("🔐 Role found:", userRole, "| Company:", companyName);

//     if (userRole !== "recruiter" && userRole !== "master_admin") {
//       alert("Access denied. Recruiter or Master Admin role required.");
//       window.location.href = "/";
//       return;
//     }

    // ✅ Fetching company data
//   try {
//   console.log("🔍 Fetching company profile for:", companyName);

//   const companyRef = collection(db, "company_profile");
//   const q = query(companyRef, where("name", "==", companyName));
  
//   const snapshot = await getDocs(q);

//   console.log("📦 Query executed. Docs found:", snapshot.size);

//   if (snapshot.empty) {
//     console.warn("❌ No matching company profile found for:", companyName);
//     alert("Company profile not found.");
//     return;
//   }

//   window.companyData = snapshot.docs[0].data();

//   snapshot.forEach(doc => {
//     console.log("✅ Company doc found:", doc.id, doc.data());
//   });

//   const companyData = snapshot.docs[0].data();
//   console.log("🏢 Loaded company data:", companyData);

  
  
// } catch (error) {
//   console.error("🚨 Error fetching company profile:", error.message, error.stack);
//   alert("Error occurred while fetching company. Please contact support.");
// }

//   } catch (error) {
//     console.error("❌ Error verifying role or fetching company:", error);
//     alert("An error occurred. Please contact support.");
//     window.location.href = "/login/";
//   }
// });

// Auth check and company job load
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    console.warn("❌ No user logged in. Redirecting to login.");
    window.location.href = "/login/";
    return;
  }

  console.log("✅ User logged in:", user.email);

  try {
    const roleDocRef = doc(db, "login_roles", user.email);
    const roleDocSnap = await getDoc(roleDocRef);

    if (!roleDocSnap.exists()) {
      console.warn("❌ Role document not found for:", user.email);
      alert("Access denied. Role not found.");
      window.location.href = "/";
      return;
    }

    const userRole = roleDocSnap.data().role;
    const companyName = roleDocSnap.data().company;

    console.log("🔐 Role found:", userRole, "| Company:", companyName);

    if (userRole !== "recruiter" && userRole !== "master_admin") {
      alert("Access denied. Recruiter or Master Admin role required.");
      window.location.href = "/";
      return;
    }

    // ✅ Load jobs of that company
    await loadRecruiterJobs(companyName);

  } catch (error) {
    console.error("❌ Error verifying role or fetching company:", error);
    alert("An error occurred. Please contact support.");
    window.location.href = "/login/";
  }
});


// 📦 Function to load jobs for recruiter from companies/{company}/jobs[]
async function loadRecruiterJobs(companyName) {
  const companyKey = companyName.toLowerCase().replace(/\s+/g, "_");

  const companyDocRef = doc(db, "companies", companyKey);
  const companySnap = await getDoc(companyDocRef);

  if (!companySnap.exists()) {
    console.warn("❌ No company doc found for:", companyKey);
    alert("Company not found. Contact admin.");
    return;
  }

  const jobIds = companySnap.data().jobs || [];

  if (jobIds.length === 0) {
    console.log("📭 No jobs posted by this company.");
    return;
  }

  console.log(`🧾 Found ${jobIds.length} job(s) for ${companyName}`);

  for (const jobId of jobIds) {
    const jobDocRef = doc(db, "jobs", jobId);
    const jobSnap = await getDoc(jobDocRef);

    if (jobSnap.exists()) {
      const jobData = jobSnap.data();
      // renderJobCard(jobData);
      // loadJobs(companyData);
    } else {
      console.warn(`⚠️ Job ${jobId} not found.`);
    }
  }
}

