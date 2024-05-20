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
// Function to truncate text if it exceeds a certain length or line count
function truncateText(text, maxLines) {
  const lines = text.split("\n");
  if (lines.length <= maxLines) {
    return text;
  } else {
    return lines.slice(0, maxLines).join("\n");
  }
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
}

// Display all job profiles when the page loads
window.onload = function () {
  displayJobProfiles(profile_masterdata);

  // Add event listener to search input
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", function () {
    const query = this.value.trim();
    if (query.length >= 2) {
      // Change the condition to check for a minimum of 2 characters
      // Delay filtering by 1 second
      setTimeout(() => {
        filterJobProfiles(query);
      }, 1000);
    } else {
      // Clear search results if query length is less than 2
      displayJobProfiles(profile_masterdata);
    }
  });
};
