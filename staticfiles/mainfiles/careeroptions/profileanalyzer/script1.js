// Function to display job profiles on the webpage
function displayJobProfiles(profiles, query = "") {
  const jobProfilesContainer = document.getElementById("jobProfiles");

  // Clear existing content
  jobProfilesContainer.innerHTML = " ";

  // Create a document fragment for better performance
  const fragment = document.createDocumentFragment();

  // Loop through each profile and create a card for it
  profiles.forEach((profile, index) => {
    const serialNumber = index + 1;
    const profileUrl = `http://jobsdoor360.in/myaccount/jobsforyou/?jobType=all&location=india&profile=${encodeURIComponent(
      profile.name
    )}&page=1`;
    const card = document.createElement("div");
    card.className = "col-md-6 col-sm-12";
    card.innerHTML = `
      <div class="card mb-3">
        <div class="card-body">
          <h6 class="text-center card-title fs-5 fw-bold h6 text-white py-2 mb-3">
             ${serialNumber}. ${profile.name}
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
          ${
            profile.life_style && profile.life_style.length > 0
              ? `<p class="card-text">
                   <b>Lifestyle:</b>
                   <ul class="lifestyle-list">
                     ${profile.life_style
                       .map(
                         (item) =>
                           `<li><a href="${item.url}" target="_blank">${item.title}</a></li>`
                       )
                       .join("")}
                   </ul>
                 </p>`
              : ""
          }
          <p class="text-center fw-bold">
            See Job Options?<br/>
            <a href="${profileUrl}" class="btn btn-outline-success mt-2 mx-2 clickHereBtn">Click here</a>
          </p>
        </div>
      </div>
    `;
    fragment.appendChild(card);
  });

  jobProfilesContainer.appendChild(fragment);

  // Add event listeners to "Click here" buttons
  document.querySelectorAll(".clickHereBtn").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const url = this.getAttribute("href");
      window.location.href = url;
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
    }, 1000); // Delay to 1000ms for a more responsive search experience
  });
};