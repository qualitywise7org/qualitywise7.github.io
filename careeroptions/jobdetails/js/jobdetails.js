// Function to extract a specific parameter value from URL params
function getParameterByName(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Extract the 'jobCode' from URL params
const jobCode = getParameterByName("jobCode");

let job = null;

// Iterate through the jobs_data array and find the matching job object
for (const jobData of jobs_data) {
  if (jobData.job_code === jobCode) {
    job = jobData;
    break;
  }
}

// Function to update element text content or hide it if it's empty
function updateElementHTMLOrHide(elementId, html) {
  const element = document.getElementById(elementId);
  if (element) {
    if (html) {
      element.innerHTML = html;
      element.style.display = "block";
    } else {
      element.style.display = "none";
    }
  }
}

if (job) {
  updateElementHTMLOrHide(
    "industry",
    job?.posts_data?.industry_masterdata?.name
      ? `<strong>Industry:</strong> ${job?.posts_data?.industry_masterdata?.name}`
      : ""
  );
  updateElementHTMLOrHide(
    "jobType",
    job?.posts_data?.jobtype_masterdata?.name
      ? `<strong>Job Type:</strong> ${job?.posts_data?.jobtype_masterdata?.name}`
      : ""
  );
  updateElementHTMLOrHide(
    "profile",
    job?.posts_data?.profile_masterdata?.name
      ? `<strong>Profile:</strong> ${job?.posts_data?.profile_masterdata?.name}`
      : ""
  );

  const postNameElement = document.getElementById("postName");
  if (postNameElement) {
    postNameElement.textContent = job?.posts_data?.post_name;
  }

  const briefDetailElement = document.getElementById("briefDetail");
  if (briefDetailElement) {
    briefDetailElement.innerHTML = `<strong>Brief Details:</strong> ${job?.brief_info}`;
  }

  const dateElement = document.getElementById("date");
  if (dateElement) {
    dateElement.innerHTML = `<strong>Post Date:</strong> ${job?.post_date} | <strong>Last Date:</strong> ${job?.last_date}`;
  }

  const ageLimitElement = document.getElementById("ageLimit");
  if (ageLimitElement) {
    ageLimitElement.innerHTML = `<strong>Minimum Age Limit:</strong> ${job?.minimum_age} | <strong>Maximum Age Limit:</strong> ${job?.maximum_age}`;
  }

  const recruitmentBoardElement = document.getElementById("recruitmentBoard");
  if (recruitmentBoardElement) {
    recruitmentBoardElement.innerHTML = `<strong>Recruitment Board:</strong> ${job?.recruitment_board}`;
  }

  const eligibilityElement = document.getElementById("eligibility");
  if (eligibilityElement) {
    eligibilityElement.innerHTML = `<strong>Qualification Eligibility:</strong> ${job?.qualification_eligibility}`;
  }

  const moreDetailsLink = document.getElementById("moreDetailsLink");
  if (moreDetailsLink) {
    moreDetailsLink.href = job?.job_link;
  }
}
