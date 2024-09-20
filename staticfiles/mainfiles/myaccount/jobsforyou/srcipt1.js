const jobTypeSelect = document.getElementById("jobType");
const locationSelect = document.getElementById("location");
const qualificationInput = document.getElementById("qualification");
const profileSelect = document.getElementById("profile");
const companySelect = document.getElementById("company");
const submitButton = document.getElementById("submitButton");
const clearAllButton = document.getElementById("clearallButton");
const useProfileQualificationCheckbox = document.getElementById(
  "useProfileQualification"
);
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
  const urlCompany = urlSearchParams.get("company");
  const urlQualification = urlSearchParams.get("qualification");

  const currentPage = parseInt(urlSearchParams.get("page")) || 1;

  setTimeout(() => {
    if (urlJobType) {
      jobTypeSelect.value = urlJobType;
    }
    if (urlLocation) {
      locationSelect.value = urlLocation;
    }
    if (urlQualification) {
      qualificationInput.value = urlQualification;
    }
    if (urlProfile) {
      profileSelect.value = urlProfile;
    }
    if (urlCompany) {
      companySelect.value = urlProfile;
    }

    if (
      urlJobType ||
      urlLocation ||
      urlProfile ||
      urlQualification ||
      urlCompany
    ) {
      displayResults(
        urlJobType,
        urlLocation,
        urlProfile,
        urlCompany,
        currentPage
      );
    } else {
      displayJobs(currentPage);
    }
  }, 1000);

  if (
    !urlJobType &&
    !urlLocation &&
    !urlProfile &&
    !urlQualification &&
    !urlCompany
  ) {
    displayJobs(1);
  }
});

// Function to render paginated jobs and generate pagination controls
function renderPaginatedJobsAndControls(jobs, currentPage) {
  // console.log(jobs);
  jobs.forEach((doc) => { });
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  const jobsPerPage = 30;
  const numPages = Math.ceil(jobs?.length / jobsPerPage);

  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;

  const paginatedJobs = jobs?.slice(startIndex, endIndex);

  const jobsDiv = document.createElement("div");
  jobsDiv.classList.add("row", "g-3");

  // Hide the loading element
  const loadingElement = document.getElementById("loading");
  loadingElement.style.display = "none";

  // Display paginated jobs
  if (paginatedJobs?.length > 0) {
    // about pagination button

    paginatedJobs.forEach((job) => {
      const jobDiv = document.createElement("div");
      jobDiv.classList.add("col-md-4", "col-12");
      jobDiv.innerHTML = `
                <div class="card h-100 w-100 overflow-hidden">
                    <div class="card-body " style=" background-color:rgb(244 242 255)">
                        <h5 class="card-title text-center p-3">${job?.posts_data?.post_name
        }</h5>

                        ${job.last_date
          ? `
                        <p><strong>Post Date : </strong>${job?.post_date} | <strong>Last Date: </strong>${job?.last_date}</p>`
          : `
                        <p><strong>Post Date : </strong>${job?.post_date}</p>`
        }
                         ${job?.company
          ? `
                        <p><strong>Company :</strong> ${job?.company}</p>`
          : ``
        }

                        <p><strong>Eligibility : </strong>${job?.qualification_eligibility
        }</p>
                        ${job?.recruitment_board
          ? `
                        <p><strong>Recruitment Board :</strong> ${job?.recruitment_board}</p>`
          : `
                        <p><strong>Location :</strong> ${job?.location}</p>`
        }

                        ${job?.minimum_age || job?.maximum_age
          ? `
                        <p><strong>Minimum Age :</strong> ${job?.minimum_age} | <strong>Maximum Age :</strong> ${job?.maximum_age}</p>`
          : job?.company_name
            ? `
                        <p><strong>Company Name : </strong>${job?.company_name}</p>`
            : ``
        }
                        <a href="/careeroptions/jobdetails/?jobCode=${job?.job_code
        }" target="_blank" class="btn btn-sm btn-secondary">Know More</a>
                    </div>
                </div>    
            `;

      jobsDiv.appendChild(jobDiv);
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

// Function to get the current URL search parameters
function getSearchParams() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const selectedJobType = jobTypeSelect.value;
  const selectedLocation = locationSelect.value;
  const selectedQualification = qualificationInput.value;
  const selectedProfile = profileSelect.value;
  const selectedCompany = companySelect.value;

  // Remove existing "page" parameter if it exists
  urlSearchParams.delete("page");

  urlSearchParams.set("jobType", selectedJobType);
  urlSearchParams.set("location", selectedLocation);
  urlSearchParams.set("qualification", selectedQualification);
  urlSearchParams.set("profile", selectedProfile);
  urlSearchParams.set("company", selectedCompany);

  // Return the formatted search parameters
  return `&${urlSearchParams.toString()}`;
}

// Function to display paginated jobs
async function displayJobs(page) {
  const jobs = jobs_data;
  console.log(jobs);
  renderPaginatedJobsAndControls(jobs, page);
}

// Array for filtering qualifications
const qualificationMapping = {
  graduation: ["b.a", "b.sc", "b.com", "b.tech", "b.e", "bba"],
  postGraduation: ["m.a", "m.sc", "m.com", "m.tech", "mba"],
  // Add other mappings as needed
};

let userQualificationFromProfile = ""; // Variable to store user's qualification

// Function to fetch user profile based on email
async function fetchUserProfile() {
  const user = window.auth.currentUser;

  if (user) {
    const userEmail = user.email;

    try {
      const userProfileDocRef = doc(window.db, "user_profile", userEmail);
      const docSnapshot = await getDoc(userProfileDocRef);

      if (docSnapshot.exists()) {
        const userProfileData = docSnapshot.data();
        // Store user's qualifications
        userQualificationFromProfile =
          userProfileData.education[0].degree || "";

        // Populate qualification input field with user's qualifications
        if (useProfileQualificationCheckbox.checked) {
          qualificationInput.value = userQualificationFromProfile;
        }
      } else {
        console.log("No user profile found for email:", userEmail);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  } else {
    console.log("No user is signed in.");
  }
}

// Event listener to handle checkbox state change
useProfileQualificationCheckbox.addEventListener("change", () => {
  if (useProfileQualificationCheckbox.checked) {
    // Disable qualification input and use user profile qualification
    qualificationInput.value = userQualificationFromProfile;
    qualificationInput.disabled = true;
  } else {
    // Enable qualification input for manual entry
    qualificationInput.disabled = false;
    qualificationInput.value = "";
  }
});

// Call fetchUserProfile when the user is authenticated
window.auth.onAuthStateChanged((user) => {
  if (user) {
    fetchUserProfile();
  }
});

// Function to handle Google Analytics tracking
function trackSearchResults(jobs) {
  jobs.length > 0
    ? gtag("event", "search_results", {
      status: "jobs_found",
      job_codes: jobs.map((job) => job.job_code), // Send job codes of found jobs
      debug_mode: true, // Enable debug mode for development
    })
    : gtag("event", "search_results", {
      status: "no_jobs_found",
      job_codes: "nojob", // Send 'nojob' if no jobs found
      debug_mode: true, // Enable debug mode for development
    });

  // Log the result for debugging purposes
  console.log(
    jobs.length > 0
      ? `Jobs Found: ${jobs.map((job) => job.job_code)}`
      : "No Jobs Found"
  );
}

// Function to track the filters that are applied
function trackFiltersApplied(
  selectedJobType,
  selectedLocation,
  selectedQualification,
  selectedProfile,
  selectedCompany
) {
  const appliedFilters = {};

  // Check and add only applied filters to the event if they have a valid value
  if (
    selectedJobType &&
    selectedJobType !== "none"
  ) {
    appliedFilters.job_type = selectedJobType;
  }
  if (selectedLocation && selectedLocation !== "none" && selectedLocation !== "") {
    appliedFilters.location = selectedLocation;
  }
  if (selectedQualification && selectedQualification !== "none" && selectedQualification !== "") {
    appliedFilters.qualification = selectedQualification;
  }
  if (selectedProfile && selectedProfile !== "none" && selectedProfile !== "") {
    appliedFilters.profile = selectedProfile;
  }
  if (selectedCompany && selectedCompany !== "none" && selectedCompany !== "") {
    appliedFilters.company = selectedCompany;
  }

  // Send event if at least one filter is applied
  if (Object.keys(appliedFilters).length > 0) {
    gtag("event", "filters_applied", {
      ...appliedFilters,
      debug_mode: true, // Enable debug mode for development
    });

    // Log the applied filters for debugging purposes
    console.log(`Filters Applied: `, appliedFilters);
  } else {
    console.log("No filters applied.");
  }
}

// Function to display results based on user input
async function displayResults(
  selectedJobType,
  selectedLocation,
  selectedQualification,
  selectedProfile,
  selectedCompany,
  page
) {
  // Split comma-separated values for each filter
  const locationArray = selectedLocation
    ? selectedLocation.split(",").map((loc) => loc.trim().toLowerCase())
    : [];
  const jobTypeArray = selectedJobType
    ? selectedJobType.split(",").map((type) => type.trim().toLowerCase())
    : [];
  const profileArray = selectedProfile
    ? selectedProfile.split(",").map((profile) => profile.trim().toLowerCase())
    : [];
  const companyArray = selectedCompany
    ? selectedCompany.split(",").map((company) => company.trim().toLowerCase())
    : [];

  // Check if "Graduation" is entered, and expand it to all relevant degrees
  const qualificationArray = selectedQualification
    ? selectedQualification.split(",").map((qual) => qual.trim().toLowerCase())
    : [];
  if (qualificationArray.includes("graduation")) {
    qualificationArray.push(...qualificationMapping.graduation);
  }
  if (qualificationArray.includes("post graduation")) {
    qualificationArray.push(...qualificationMapping.postGraduation);
  }

  const jobs = jobs_data.filter((job) => {
    // Match job type
    const jobTypeMatch =
      !jobTypeArray.length ||
      jobTypeArray.includes("all") ||
      jobTypeArray.includes(job?.job_type?.toLowerCase());

    // Match location
    const locationMatch =
      !locationArray.length ||
      locationArray.includes("india") ||
      job?.location?.trim() === "" ||
      locationArray.some((loc) => job?.location?.toLowerCase().includes(loc));

    // Match qualification (with expanded qualifications like Graduation)
    const qualificationMatch =
      !qualificationArray.length ||
      qualificationArray.some((qual) =>
        job?.qualification_eligibility?.toLowerCase().includes(qual)
      );

    // Match profile
    const profileMatch =
      !profileArray.length ||
      profileArray.some(
        (profile) =>
          job?.job_code?.toLowerCase().includes(profile) ||
          job?.post_code?.toLowerCase().includes(profile)
      );

    // Match company
    const companyMatch =
      !companyArray.length ||
      companyArray.some(
        (company) =>
          job?.company?.toLowerCase().includes(company) ||
          job?.recruitment_board?.toLowerCase().includes(company)
      );

    // Return true if all conditions match
    return (
      jobTypeMatch &&
      locationMatch &&
      qualificationMatch &&
      profileMatch &&
      companyMatch
    );
  });

  console.log("Filtered Jobs:", jobs); // Check filtered jobs in console

  // Track the filtered jobs (Google Analytics tracking)
  trackSearchResults(jobs);
  // Render filtered and paginated jobs
  renderPaginatedJobsAndControls(jobs, page);
}

// Event listener to clear filters data when the user clicks the "clear All" button
clearAllButton.addEventListener("click", (e) => {
  e.preventDefault();
  jobTypeSelect.value = "all";
  locationSelect.value = "";
  qualificationInput.value = "";
  profileSelect.value = "";
  companySelect.value = "";
  qualificationInput.disabled = false;
  useProfileQualificationCheckbox.checked = false;
});

// Event listener to apply filters when the user clicks the "submit" button

submitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const selectedJobType = jobTypeSelect.value;
  const selectedLocation = locationSelect.value;
  const selectedQualification = qualificationInput.value;
  const selectedProfile = profileSelect.value;
  const selectedCompany = companySelect.value;

  // Track the filters applied by the user
  trackFiltersApplied(
    selectedJobType,
    selectedLocation,
    selectedQualification,
    selectedProfile,
    selectedCompany
  );

  // Update the URL with selected parameters
  const url = `?jobType=${selectedJobType}&location=${selectedLocation}&qualification=${selectedQualification}&profile=${selectedProfile}&company=${selectedCompany}`;
  history.pushState(null, "", url);

  // Display results based on the selected filters
  await displayResults(
    selectedJobType,
    selectedLocation,
    selectedQualification,
    selectedProfile,
    selectedCompany,
    1
  );

  // Google Analytics tracking event
});
