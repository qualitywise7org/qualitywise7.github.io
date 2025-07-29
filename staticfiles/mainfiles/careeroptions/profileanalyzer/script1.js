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
      <div class="card mb-3 h-100">
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
            <b>Minimum Skills Required:</b> ${
              Array.isArray(profile.minimum_skills_required)
                ? profile.minimum_skills_required.join(", ")
                : profile.minimum_skills_required
            }
          </p>
          <p class="card-text">
            <b>Preferred Streams:</b> ${
              Array.isArray(profile.preferred_streams)
                ? profile.preferred_streams.join(", ")
                : profile.preferred_streams || "N/A"
            }
          </p>
          ${
            profile.entrance_exam && profile.entrance_exam.length > 0
              ? `<p class="card-text"><b>Entrance Exam:</b> ${profile.entrance_exam.join(
                  ", "
                )}</p>`
              : ""
          }
          ${
            profile.life_style && profile.life_style.length > 0
              ? `<p class="card-text">
                   <b>Lifestyle:</b>
                   <ul class="lifestyle-list">
                     <li><a href="${profile.life_style[0].url}" target="_blank">${profile.life_style[0].title}</a></li>
                   </ul>
                 </p>
                 <p class="card-text">
                   <b>Salary Range:</b> 
                 </p>
                 <p class="card-text">
                   <ul class="lifestyle-list">
                     <li><a href="${profile.life_style[1].url}" target="_blank">${profile.life_style[1].title}</a></li>
                   </ul>
                 </p>
                 `
              : ""
          }
          ${
            profile.colleges && profile.colleges.length > 0
              ? `<p class="card-text"><b>Top Colleges:</b>
                  <ul class="college-list">
                    ${profile.colleges
                      .map((college, i) =>
                        i % 3 === 0
                          ? `<li>${profile.colleges
                              .slice(i, i + 3)
                              .join(", ")}</li>`
                          : ""
                      )
                      .join("")}
                  </ul>
                 </p>`
              : ""
          }
               
          ${
            profile.industries && profile.industries.length > 0
              ? `<p class="card-text"><b>Industries:</b> ${profile.industries.join(
                  ", "
                )}</p>`
              : ""
          }
  
          <p class="card-text">
             <b>Syllabus</b>
             <ul class="lifestyle-list">
               <li>
                 <a href="/careeroptions/profileanalyzer/syllabus/?profilecode=${profile.code}" target="_blank">
                   Checkout the Syllabus
                </a>
               </li>
             </ul>
          </p>
  
          ${
            profile.code === "web_developer, software engineer, web developer, system engineer"
              ? `<p class="card-text">
                   <b>Assessment</b>
                   <ul class="lifestyle-list">
                     
                       <a href="https://jobsdoor360.in/test/quiz/?quizcode=html" target="_blank">
                         1. Html, Css, Javascript
                       </a> </br>
                        <a href="https://jobsdoor360.in/test/quiz/?quizcode=react" target="_blank">
                         2. Reactjs
                       </a>
                    
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
