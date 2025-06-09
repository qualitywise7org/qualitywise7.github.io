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
      alert("Access denied. Role not found.");
      window.location.href = "/";
      return;
    }

    const roleData = roleDocSnap.data();
    const userRole = roleData.role;
    const companyCode = roleData.company_code;

    if (!userRole) throw new Error("Missing role in role document.");

    // Save role for later use
    localStorage.setItem("userRole", userRole);

    // If user is recruiter, also save company info
    if (userRole === "recruiter") {
      if (!companyCode) throw new Error("Missing company code for recruiter.");
      localStorage.setItem(
        "companyData",
        JSON.stringify({ code: companyCode, name: companyCode })
      );
    }

    if (userRole !== "recruiter" && userRole !== "master_admin") {
      alert("Access denied. Recruiter or Master Admin role required.");
      window.location.href = "/";
      return;
    }

    // ✅ Successfully handled
    console.log("🔐 Role validated:", userRole);
    
  } catch (error) {
    console.error("❌ Error verifying role:", error.message);
    alert("An error occurred. Please contact support.");
    window.location.href = "/login/";
  }
});


async function loadRecruiterJobs(companyCode) {
  const companyKey = companyCode.toLowerCase().replace(/\s+/g, "_");
  const companyDocRef = doc(db, "companies", companyKey);
  const companySnap = await getDoc(companyDocRef);

  if (!companySnap.exists()) {
    console.warn("❌ No company doc found for:", companyKey);
    alert("Company not found. Contact admin.");
    return;
  }

  const jobRefs = companySnap.data().jobs || [];

  if (jobRefs.length === 0) {
    console.log("📭 No jobs posted by this company.");
  } else {
    console.log(`📦 Found ${jobRefs.length} job(s) for ${companyCode}`);
  }

  for (const jobRef of jobRefs) {
    const jobId = typeof jobRef === "string" ? jobRef : jobRef.jobId;

    if (!jobId || typeof jobId !== "string") {
      console.warn("⚠️ Skipping invalid job reference:", jobRef);
      continue;
    }

    try {
      const jobDocRef = doc(db, "jobs", jobId);
      const jobSnap = await getDoc(jobDocRef);

      if (jobSnap.exists()) {
        const jobData = jobSnap.data();

        if (jobData.timestamp && typeof jobData.timestamp.toDate === "function") {
          jobData.timestamp = jobData.timestamp.toDate();
        } else {
          jobData.timestamp = new Date();
        }

        jobData.jobId = jobId;
        renderJob(jobData);
      }
    } catch (err) {
      console.error(`❌ Error loading job ${jobId}:`, err);
    }
  }

}
