const jobTypeSelect = document.getElementById("jobType");
const locationSelect = document.getElementById("location");
const qualificationInput = document.getElementById("qualification");
const profileSelect = document.getElementById("profile");
const companySelect = document.getElementById("company");
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

    if (urlJobType || urlLocation || urlProfile || urlQualification || urlCompany) {
      displayResults(urlJobType, urlLocation, urlProfile, urlCompany, currentPage);
    } else {
      displayJobs(currentPage);
    }
  }, 1000);

  if (!urlJobType && !urlLocation && !urlProfile && !urlQualification && !urlCompany) {
    displayJobs(1);
  }
});

// Function to render paginated jobs and generate pagination controls
function renderPaginatedJobsAndControls(jobs, currentPage) {
  // console.log(jobs);
  jobs.forEach((doc) => {
  });
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
                        <h5 class="card-title text-center p-3">${
                          job?.posts_data?.post_name
                        }</h5>

                        ${
                          job.last_date
                            ? `
                        <p><strong>Post Date : </strong>${job?.post_date} | <strong>Last Date: </strong>${job?.last_date}</p>`
                            : `
                        <p><strong>Post Date : </strong>${job?.post_date}</p>`
                        }
                         ${
                          job?.company
                            ? `
                        <p><strong>Company :</strong> ${job?.company}</p>`
                            : ``
                        }

                        <p><strong>Eligibility : </strong>${
                          job?.qualification_eligibility
                        }</p>
                        ${
                          job?.recruitment_board
                            ? `
                        <p><strong>Recruitment Board :</strong> ${job?.recruitment_board}</p>`
                            : `
                        <p><strong>Location :</strong> ${job?.location}</p>`
                        }

                        ${
                          job?.minimum_age || job?.maximum_age
                            ? `
                        <p><strong>Minimum Age :</strong> ${job?.minimum_age} | <strong>Maximum Age :</strong> ${job?.maximum_age}</p>`
                            : job?.company_name
                            ? `
                        <p><strong>Company Name : </strong>${job?.company_name}</p>`
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
// function to display results
async function displayResults(
  selectedJobType,
  selectedLocation,
  selectedQualification,
  selectedProfile,
  selectedCompany,
  page
) {
  const jobs = jobs_data.filter((job) => {
    const jobTypeMatch =
      !selectedJobType ||
      selectedJobType === "all" ||
      job.job_type === selectedJobType;
    const locationMatch =
      !selectedLocation ||
      selectedLocation.toLowerCase() === "india" ||
      job?.location?.trim() === "" ||
      job?.location?.toLowerCase().includes(selectedLocation.toLowerCase());
    const qualificationMatch =
      !selectedQualification ||
      job?.qualification_eligibility
        ?.toLowerCase()
        .includes(selectedQualification.toLowerCase());
    const ProfileMatch =
      !selectedProfile ||
      job?.job_code?.toLowerCase().includes(selectedProfile?.toLowerCase()) ||
      job?.post_code?.toLowerCase().includes(selectedProfile?.toLowerCase());
    const CompanyMatch =
      !selectedCompany ||
      job?.company?.toLowerCase().includes(selectedCompany?.toLowerCase()) ||
      job?.recruitment_board?.toLowerCase().includes(selectedCompany?.toLowerCase());

    return jobTypeMatch && locationMatch && qualificationMatch && ProfileMatch && CompanyMatch;
  });

  console.log("Filtered Jobs:", jobs); // Check filtered jobs in console

  renderPaginatedJobsAndControls(jobs, page);
}

// Function to display results based on user selections
submitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const selectedJobType = jobTypeSelect.value;
  const selectedLocation = locationSelect.value;
  const selectedQualification = qualificationInput.value;
  const selectedProfile = profileSelect.value;
  const selectedCompany = companySelect.value
  
  // Update the URL with selected parameters
  const url = `?jobType=${selectedJobType}&location=${selectedLocation}&qualification=${selectedQualification}&profile=${selectedProfile}&company=${selectedCompany}`;
  history.pushState(null, "", url);

  // Call displayResults function with selected parameters
  displayResults(
    selectedJobType,
    selectedLocation,
    selectedQualification,
    selectedProfile,
    selectedCompany,
    1
  );
});
