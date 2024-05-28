const jobTypeSelect = document.getElementById("jobType");
const locationSelect = document.getElementById("location");
const profileSelect = document.getElementById("profile");
const submitButton = document.getElementById("submitButton");
const resultsContainer = document.getElementById("results");

// Function to populate select options
async function populateSelectOptions(optionsMasterData, selectElement) {
  // Add an "All" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = `All`;
  selectElement.appendChild(allOption);

  optionsMasterData.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.code;
    option.textContent = item.name;
    selectElement.appendChild(option);
  });
}

// Call the function to populate select options when the page is loaded
window.addEventListener("load", async () => {
  // Call the function to populate select options from local storage
  populateSelectOptions(jobtype_masterdata, jobTypeSelect);
  populateSelectOptions(industry_masterdata, locationSelect);
  populateSelectOptions(profile_masterdata, profileSelect);

  // Check if URL parameters are present and apply them
  const urlSearchParams = new URLSearchParams(window.location.search);

  const urlJobType = urlSearchParams.get("jobType");
  const urlLocation = urlSearchParams.get("location");
  const urlProfile = urlSearchParams.get("profile");

  const currentPage = parseInt(urlSearchParams.get("page")) || 1;

  setTimeout(() => {
    if (urlJobType) {
      jobTypeSelect.value = urlJobType;
    }
    if (urlLocation) {
      locationSelect.value = urlLocation;
    }
    if (urlProfile) {
      profileSelect.value = urlProfile;
    }

    if (urlJobType || urlLocation || urlProfile) {
      displayResults(urlJobType, urlLocation, urlProfile, currentPage);
    } else {
      displayJobs(currentPage);
    }
  }, 1000);

  if (!urlJobType && !urlLocation && !urlProfile) {
    displayJobs(1);
  }
});

// Function to render paginated jobs and generate pagination controls
function renderPaginatedJobsAndControls(jobs, currentPage) {
  console.log(jobs);
  jobs.forEach((doc)=>{
    console.log(doc.posts_data.post_name, "location")
  })
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  const profileCardStyles = {
    // width: "fit-content",
    // margin: "0 auto",
  };

  const groupedJobs = groupJobsByProfile(jobs);

  const jobsPerPage = 2;
  const numPages = Math.ceil(jobs?.length / jobsPerPage);

  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;

  const paginatedJobs = groupedJobs?.slice(startIndex, endIndex);

  const jobsDiv = document.createElement("div");
  jobsDiv.classList.add("row", "g-3");

  // Hide the loading element
  const loadingElement = document.getElementById("loading");
  loadingElement.style.display = "none";

  // Display paginated jobs
  if (paginatedJobs?.length > 0) {
    // about pagination button

    paginatedJobs.forEach((profileJobs) => {
      const profileCard = document.createElement("div");
      profileCard.classList.add("card", "col-12");

      Object.keys(profileCardStyles).forEach((styleKey) => {
        profileCard.style[styleKey] = profileCardStyles[styleKey];
      });

      profileCard.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title" style="color:white; background-color:#4f92ef; padding:5px;">${
                      profileJobs[0]?.posts_data?.profile_masterdata?.name
                        ? profileJobs[0]?.posts_data?.profile_masterdata?.name
                        : "Other"
                    }</h5>
                    <p><strong>Job Type: </strong>${
                      profileJobs[0]?.posts_data?.jobtype_masterdata?.name
                    } | <strong>Industry: </strong>${
        profileJobs[0]?.posts_data?.industry_masterdata?.name
      }</p>
            <p>
                        <strong>Minimum Skills Required: </strong>${
                          profileJobs[0]?.posts_data?.profile_masterdata
                            ?.minimum_skills_required
                            ? profileJobs[0]?.posts_data?.profile_masterdata
                                ?.minimum_skills_required
                            : ""
                        } | 
                        <strong>Minimum Qualifications: </strong>${
                          profileJobs[0]?.posts_data?.profile_masterdata
                            ?.minimum_qualifications
                            ? profileJobs[0]?.posts_data?.profile_masterdata?.minimum_qualifications
                                ?.map((elem) => `${elem}`)
                                .join(",")
                            : ""
                        } | 
                        <strong>Preferred Streams: </strong>${
                          profileJobs[0]?.posts_data?.profile_masterdata
                            ?.preferred_streams
                            ? profileJobs[0]?.posts_data?.profile_masterdata
                                ?.preferred_streams ||
                              profileJobs[0]?.posts_data?.profile_masterdata?.preferred_streams
                                ?.map((elem) => `${elem}`)
                                .join(",")
                            : ""
                        } | 
                        <strong>Entrance Exam: </strong>${
                          profileJobs[0]?.posts_data?.profile_masterdata
                            ?.entrance_exam
                            ? profileJobs[0]?.posts_data?.profile_masterdata?.entrance_exam
                                ?.map((elem) => `${elem}`)
                                .join(",")
                            : ""
                        }
                    </p>
                    <p><strong>Lifestyle: </strong>${
                      profileJobs[0]?.posts_data?.profile_masterdata
                        ? profileJobs[0]?.posts_data?.profile_masterdata?.life_style
                            .map(
                              (video) =>
                                `<div><a href="${video.url}">👉 ${video.title}</a></div>`
                            )
                            .join(" ")
                        : ""
                    }</p>
                </div>
            `;

      jobsDiv.appendChild(profileCard);

      profileJobs.forEach((job) => {
        const jobDiv = document.createElement("div");
        jobDiv.classList.add("col-md-4", "col-12");
        jobDiv.innerHTML = `
                    <div class="card h-100 overflow-hidden">
                        <div class="card-body " style=" background-color:rgb(244 242 255)">
                            <h5 class="card-title text-center">${
                              job?.posts_data?.post_name
                            }</h5>

                            ${
                              job.last_date
                                ? `
                            <p><strong>Post Date : </strong>${job?.post_date} | <strong>Last Date: </strong>${job?.last_date}</p>  
                            `
                                : `
                            <p><strong>Post Date : </strong>${job?.post_date}</p>
                            `
                            }

                            <p><strong>Eligibility : </strong>${
                              job?.qualification_eligibility
                            }</p>

                            ${
                              job?.recruitment_board
                                ? `
                            <p><strong>Recruitment Board :</strong> ${job?.recruitment_board}</p>
                            `
                                : `
                            <p><strong>Location :</strong> ${job?.location}</p>
                            `
                            }

                            ${
                              job?.minimum_age || job?.maximum_age
                                ? `<p><strong>Minimum Age :</strong> ${job?.minimum_age} | <strong>Maximum Age :</strong> ${job?.maximum_age}</p>`
                                : job?.company_name
                                ? `<p><strong>Company Name : </strong>${job?.company_name}</p>`
                                : ``
                            }
                            <a href="/careeroptions/jobdetails/?jobCode=${
                              job?.job_code
                            }" target="_blank" class="btn btn-sm btn-secondary">Know More</a>
                        </div>
                    </div>    
                `;

        jobsDiv.appendChild(jobDiv);
      });
    });

    const paginationContainer = document.createElement("nav");
    paginationContainer.classList.add("d-flex", "justify-content-center");

    const paginationUl = document.createElement("ul");
    paginationUl.classList.add("pagination");

    // Create "Previous" button
    const prevPageLi = document.createElement("li");
    prevPageLi.classList.add("page-item");
    if (currentPage === 1) {
      prevPageLi.classList.add("disabled");
    }
    const prevPageLink = document.createElement("a");
    prevPageLink.classList.add("page-link");
    prevPageLink.href = `?${getSearchParams()}&page=${currentPage - 1}`;
    prevPageLink.textContent = "Previous";
    prevPageLi.appendChild(prevPageLink);
    paginationUl.appendChild(prevPageLi);

    // Create page number buttons
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(numPages, currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      const pageLi = document.createElement("li");
      pageLi.classList.add("page-item");
      if (i === currentPage) {
        pageLi.classList.add("active");
      }
      const pageLink = document.createElement("a");
      pageLink.classList.add("page-link");
      pageLink.href = `?${getSearchParams()}&page=${i}`;
      pageLink.textContent = i;
      pageLi.appendChild(pageLink);
      paginationUl.appendChild(pageLi);
    }

    // Create "Next" button
    const nextPageLi = document.createElement("li");
    nextPageLi.classList.add("page-item");
    if (currentPage === numPages) {
      nextPageLi.classList.add("disabled");
    }
    const nextPageLink = document.createElement("a");
    nextPageLink.classList.add("page-link");
    nextPageLink.href = `?${getSearchParams()}&page=${currentPage + 1}`;
    nextPageLink.textContent = "Next";
    nextPageLi.appendChild(nextPageLink);
    paginationUl.appendChild(nextPageLi);

    paginationContainer.appendChild(paginationUl);
    jobsDiv.appendChild(paginationContainer);
  } else {
    jobsDiv.innerHTML = `<p class="text-center">No jobs found.</p>`;
  }

  resultsContainer.appendChild(jobsDiv);
}

function groupJobsByProfile(jobs) {
  const groupedJobs = [];

  // Separate jobs with a profile and jobs without a profile
  const jobsWithProfile = jobs.filter(
    (job) => job?.posts_data?.profile_masterdata?.code
  );
  const jobsWithoutProfile = jobs.filter(
    (job) => !job?.posts_data?.profile_masterdata?.code
  );

  // Group jobs with the same profile together
  const uniqueProfiles = [
    ...new Set(
      jobsWithProfile.map((job) => job?.posts_data?.profile_masterdata?.code)
    ),
  ];

  // Sort the unique profile codes alphabetically
  uniqueProfiles.sort();

  uniqueProfiles.forEach((profile) => {
    const profileJobs = jobsWithProfile
      .filter((job) => job?.posts_data?.profile_masterdata?.code === profile)
      .sort((a, b) => {
        const dateA = parseDate(a?.post_date);
        const dateB = parseDate(b?.post_date);

        return dateB - dateA;
      });

    groupedJobs.push(profileJobs);
  });

  // Add jobs without a profile to the end
  if (jobsWithoutProfile != "") {
    groupedJobs.push(jobsWithoutProfile);
  }

  return groupedJobs;
}

function parseDate(dateString) {
  const parts = dateString.split("/");
  const year = parseInt(parts[2], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[0], 10);
  return new Date(year, month, day);
}

// Function to get the current URL search parameters
function getSearchParams() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const selectedJobType = jobTypeSelect.value;
  const selectedLocation = locationSelect.value;
  const selectedProfile = profileSelect.value;

  // Remove existing "page" parameter if it exists
  urlSearchParams.delete("page");

  urlSearchParams.set("jobType", selectedJobType);

  urlSearchParams.set("location", selectedLocation);

  urlSearchParams.set("profile", selectedProfile);

  // Return the formatted search parameters
  return `&${urlSearchParams.toString()}`;
}

// Function to display paginated jobs
async function displayJobs(page) {
  const jobs = jobs_data;
  console.log(jobs);
  renderPaginatedJobsAndControls(jobs, page);
}

// Function to display results in the resultsContainer
async function displayResults(
  selectedJobType,
  selectedLocation,
  selectedProfile,
  page
) {
  const jobs = [];
  console.log(selectedJobType, selectedLocation, selectedProfile);

  for (const job of jobs_data) {
    const jobTypeMatch =
      !selectedJobType || selectedJobType === "all" || job.posts_data?.jobtype_masterdata?.code === selectedJobType;

    const locationMatch =
      !selectedLocation || selectedLocation.toLowerCase() === "india" ||
      job?.location?.trim() === "" ||
      job?.location?.toLowerCase().includes(selectedLocation.toLowerCase());

    const profileMatch =
      !selectedProfile || selectedProfile === "all" ||
      job.posts_data?.post_name.toLowerCase().includes(selectedProfile.toLowerCase());

    // Check each condition only if it's provided by the user
    const matches = jobTypeMatch && locationMatch && profileMatch;

    if (matches) {
      jobs.push(job);
    }
  }

  // Render paginated jobs and generate pagination controls
  renderPaginatedJobsAndControls(jobs, page);
}

// Function to display results based on user selections
submitButton.addEventListener("click", async () => {
  const selectedJobType = jobTypeSelect.value;
  const selectedLocation = locationSelect.value;
  const selectedProfile = profileSelect.value;

  // Reset the page parameter to 1 in the URL
  const urlSearchParams = new URLSearchParams(window.location.search);

  // Clear previous results
  resultsContainer.textContent = "";
  resultsContainer.classList.add("results-visible");

  displayResults(selectedJobType, selectedLocation, selectedProfile, 1);

  // Set the parameters for jobType, industry, and profile
  urlSearchParams.set("jobType", selectedJobType);
  urlSearchParams.set("location", selectedLocation);
  urlSearchParams.set("profile", selectedProfile);
  urlSearchParams.set("page", "1");

  // Update the URL with the new parameters
  window.history.pushState({}, "", `?${urlSearchParams.toString()}`);
});
