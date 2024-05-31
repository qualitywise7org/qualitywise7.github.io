// Function to display job profiles on the webpage
function displayJobProfiles(profiles, query = "") {
  const jobProfilesContainer = document.getElementById("jobProfiles");

  // Clear existing content
  jobProfilesContainer.innerHTML = "";

  // Loop through each profile and create a card for it
  profiles.forEach((profile) => {
    const profileUrl = `http://jobsdoor360.in/myaccount/jobsforyou/?jobType=all&location=india&profile=${encodeURIComponent(
      query
    )}&page=1`;
    const card = `
      <div class="col-md-6 col-sm-12">
        <div class="card mb-3">
          <div class="card-body">
            <h6 class="text-center card-title fs-5 fw-bold h6 text-white py-2 mb-3">
              ${profile.name}
            </h6>
            <p class="card-text">
              <b>Minimum Qualifications:</b> ${profile.minimum_qualifications.join(
                ", "
              )}
            </p>
            <p class="card-text">
              <b>Minimum Skills Required:</b> ${profile.minimum_skills_required}
            </p>
            <p class="card-text">
              <b>Preferred Streams:</b> ${profile.preferred_streams}
            </p>
            <p class="card-text">
              <b>Entrance Exam:</b> ${profile.entrance_exam}
            </p>
            <p class="text-center fw-bold">
              Ready to seize the opportunity?<br/>
              <a href="${profileUrl}" class="btn btn-outline-success mt-2 mx-2">
                click here
              </a>
              <button class="btn btn-success shareBtn mt-2 mx-2" data-url="${profileUrl}">Share</button>
            </p>
           
          </div>
        </div>
      </div>
    `;
    jobProfilesContainer.innerHTML += card;
  });

  // Add event listeners to share buttons
  document.querySelectorAll(".shareBtn").forEach((button) => {
    button.addEventListener("click", function () {
      const url = this.getAttribute("data-url");
      if (navigator.share) {
        navigator
          .share({
            title: "Job Profile",
            url: url,
          })
          .catch(console.error);
      } else {
        alert("Web Share API not supported in this browser.");
      }
    });
  });
}

// Function to update the profile count
function updateProfileCount(count) {
  const profileCountContainer = document.getElementById("profileCount");
  profileCountContainer.textContent = `Profiles found: ${count}`;
}

// Function to filter job profiles based on search query
function filterJobProfiles(query) {
  const filteredProfiles = profile_masterdata.filter((profile) => {
    const lowerQuery = query.toLowerCase();
    return (
      profile.name.toLowerCase().includes(lowerQuery) ||
      (profile.keywords &&
        profile.keywords.some((keyword) =>
          keyword.toLowerCase().includes(lowerQuery)
        ))
    );
  });

  displayJobProfiles(filteredProfiles, query);
  updateProfileCount(filteredProfiles.length);
}

// Display all job profiles when the page loads
window.onload = function () {
  displayJobProfiles(profile_masterdata);
  updateProfileCount(profile_masterdata.length);

  // Add event listener to search input
  const searchInput = document.getElementById("searchInput");
  let searchTimeout;

  searchInput.addEventListener("input", function () {
    const query = this.value.trim();

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      if (query.length >= 2) {
        filterJobProfiles(query);
      } else {
        // Clear search results if query length is less than 2
        displayJobProfiles(profile_masterdata);
        updateProfileCount(profile_masterdata.length);
      }
    }, 1000); // Reduced delay to 1000ms for a more responsive search experience
  });
};
