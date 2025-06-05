const db = getFirestore(app);

  const email = localStorage.getItem("email");
  if (!email) {
    window.location.href = "/login/?redirect_url=hiring";
  }

  document.addEventListener("DOMContentLoaded", async function () {
    const jobListings = document.getElementById("users_data");

    try {
      const jobsSnapshot = await getDocs(collection(db, "jobs"));
      const applicantEmails = new Set();

      // Collect all applicant emails from all jobs
      jobsSnapshot.forEach((jobDoc) => {
        const jobData = jobDoc.data();
        const applicants = jobData.applicants || [];
        applicants.forEach((email) => applicantEmails.add(email));
      });

      if (applicantEmails.size === 0) {
        jobListings.innerHTML = `<tr><td colspan="5">No candidates have applied for any jobs.</td></tr>`;
        return;
      }

      const userProfilesSnapshot = await getDocs(collection(db, "user_profile"));
      let id = 1;

      userProfilesSnapshot.forEach((doc) => {
        const data = doc.data();
        const email = data.about?.email;

        if (applicantEmails.has(email)) {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${id++}</td>
            <td>${data.about.firstName || "not found"}</td>
            <td>${email}</td>
            <td>${data.education.degree || "not found"}</td>
            <td>${data.skills || "not found"}</td>`;
          jobListings.appendChild(row);
        }
      });

      // Search functionality
      const searchInput = document.getElementById("searchInput");
      searchInput.addEventListener("input", function () {
        const query = searchInput.value.toLowerCase();
        const rows = jobListings.querySelectorAll("tr");

        rows.forEach((row) => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(query) ? "" : "none";
        });
      });

    } catch (error) {
      console.error("Error fetching candidate data:", error);
      jobListings.innerHTML = `<tr><td colspan="5">Failed to load candidates.</td></tr>`;
    }
  });