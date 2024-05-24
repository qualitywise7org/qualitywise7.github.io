// Function to display job profiles on the webpage
function displayJobProfiles(profiles) {
  const jobProfilesContainer = document.getElementById("jobProfiles");

  // Clear existing content
  jobProfilesContainer.innerHTML = "";

  // Loop through each profile and create a card for it
  profiles.forEach((profile) => {
    const card = `
      <div class="col-md-4">
        <div class="card mb-3">
          <div class="card-body">
            <h6 class="text-center card-title fw-bold h6 text-white py-2 mb-3">${
              profile.name
            }</h6>
            <p class="card-text"><b>Minimum Qualifications:</b> ${profile.minimum_qualifications.join(
              ", "
            )}</p>
            <p class="card-text"><b>Minimum Skills Required:</b> ${
              profile.minimum_skills_required
            }</p>
            <p class="text-center fw-bold">Ready to seize the opportunity?</br><a href="/myaccount/jobsforyou/" class="btn btn-outline-success mt-2">click here</a></p>
          </div>
        </div>
      </div>
    `;
    jobProfilesContainer.innerHTML += card;
  });
}

// Function to update the profile count
function updateProfileCount(count) {
  const profileCountContainer = document.getElementById("profileCount");
  profileCountContainer.innerHTML = `Profiles found: ${count}`;
}

// Function to filter job profiles based on search query
function filterJobProfiles(query) {
  const filteredProfiles = profile_masterdata.filter((profile) => {
    // Filter by profile name and keywords
    return (
      profile.name.toLowerCase().includes(query.toLowerCase()) ||
      (profile.keywords &&
        profile.keywords.some((keyword) =>
          keyword.toLowerCase().includes(query.toLowerCase())
        ))
    );
  });

  displayJobProfiles(filteredProfiles);
  updateProfileCount(filteredProfiles.length); // Update the profile count with filtered profiles
}

// Display all job profiles when the page loads
window.onload = function () {
  displayJobProfiles(profile_masterdata);
  updateProfileCount(profile_masterdata.length); // Display the total profile count

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
        updateProfileCount(profile_masterdata.length); // Reset to total profile count
      }
    }, 1000);
  });
};
