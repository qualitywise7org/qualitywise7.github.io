// DOM Ready Event Progress bar

document.addEventListener("DOMContentLoaded", function () {
  // console.log("DOM fully loaded and parsed");
  initializeProgressBars();
  setupToggleSwitches();
  updateUserName();

  // Also set up a global event listener for user data updates
  window.addEventListener("userDataUpdated", function (event) {
    if (event.detail && event.detail.userData) {
      console.log("User data updated event received");
      window.setUserData(event.detail.userData);
    }
  });
});

// Initialize all progress bars on the page
function initializeProgressBars() {
  // Reset all progress bars to zero first
  document.querySelectorAll(".progress-bar-custom").forEach((bar) => {
    // Ensure no transition for initialization
    bar.style.transition = "none";
    bar.style.width = "0%";
    // Force reflow to apply changes immediately
    void bar.offsetWidth;
  });

  // Reset text values
  document.getElementById("text-1").textContent = "0%";
  document.getElementById("text-2").textContent = "0%";
  document.getElementById("text-3").textContent = "0%";

  // Reset assessment count
  const progressCount = document.getElementById("progress-count");
  if (progressCount) {
    progressCount.textContent = "0/0";
  }
  // Brief delay before checking for user data
  setTimeout(() => {
    // Check if user data is already available
    if (window.userData) {
      updateProgressFromUserData(window.userData);
    }
  }, 100);
}

// Update a progress bar element by ID
function updateProgressBar(id, percent) {
  const progressBar = document.getElementById(id);
  if (progressBar) {
    // Ensure percent is a valid number between 0-100
    percent = Math.min(100, Math.max(0, parseInt(percent) || 0));

    // Direct update without transitions for consistent behavior
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";

    // Force reflow
    void progressBar.offsetWidth;

    // Now set transition for animation and update width
    progressBar.style.transition = "width 0.6s ease";
    progressBar.style.width = percent + "%";
    progressBar.setAttribute("aria-valuenow", percent);
  } else {
    console.error(`Progress bar with ID ${id} not found`);
  }
}

// Validate user data to ensure it's properly formatted
function validateUserData(userData) {
  if (!userData) return null;

  // Create a sanitized copy to avoid modifying the original
  const validatedData = { ...userData };

  // Ensure lookingFor exists
  if (!validatedData.lookingFor) {
    validatedData.lookingFor = { internship: false, job: false };
  }

  // Ensure assessments are numbers
  validatedData.completedAssessments = parseInt(
    validatedData.completedAssessments || 0
  );
  validatedData.totalAssessments = parseInt(
    validatedData.totalAssessments || 5
  );

  // Ensure skills is an array
  if (validatedData.skills && !Array.isArray(validatedData.skills)) {
    if (typeof validatedData.skills === "string") {
      validatedData.skills = validatedData.skills
        .split(",")
        .map((s) => s.trim());
    } else {
      validatedData.skills = [];
    }
  }

  return validatedData;
}

// Function to update progress based on user data from the database
function updateProgressFromUserData(userData) {
  if (!userData) return;

  // Validate data before processing
  const validatedData = validateUserData(userData);
  if (!validatedData) return;

  // Calculate profile completion percentages
  const profile1Percent = calculatePersonalProfileCompletion(validatedData);
  const profile2Percent = calculateJobProfileCompletion(validatedData);
  const profile3Percent = calculateAssessmentCompletion(validatedData);

  // Update the progress bars
  requestAnimationFrame(() => {
    updateProgressBar("progress-1", profile1Percent);
    updateProgressBar("progress-2", profile2Percent);
    updateProgressBar("progress-3", profile3Percent);

    // Update corresponding text elements
    updateProgressText("text-1", profile1Percent);
    updateProgressText("text-2", profile2Percent);
    updateProgressText("text-3", profile3Percent);

    // Update assessment count
    updateAssessmentCount(validatedData);
  });
}

// Calculate Personal Profile completion percentage
function calculatePersonalProfileCompletion(userData) {
  if (!userData) return 0;

  // Using strictly defined field percentage values
  // Each field contributes exactly to the total 100%
  const fieldPercentages = {
    full_name: 15,
    email: 15,
    phone: 14,
    dob: 14,
    address: 14,
    gender: 14,
    category: 14,
  };

  // Start with 0 percent
  let totalPercent = 0;

  // Add percentage for each completed field
  Object.keys(fieldPercentages).forEach((field) => {
    // Check if the field has a value
    if (userData[field]) {
      if (typeof userData[field] === "string") {
        if (userData[field].trim() !== "") {
          totalPercent += fieldPercentages[field];
        }
      } else if (userData[field] !== null && userData[field] !== undefined) {
        totalPercent += fieldPercentages[field];
      }
    }
  });

  // Return the exact percentage without any rounding
  return totalPercent;
}

// Calculate Job Profile completion percentage
function calculateJobProfileCompletion(userData) {
  if (!userData) return 0;

  // Using strictly defined field percentage values for exact control
  // Each field contributes an exact percentage to the total
  const fieldPercentages = {
    skills: 12,
    experience: 12,
    graduationStream: 12,
    graduationDegree: 12,
    preferredLocation: 12,
    jobType: 12,
    expectedSalary: 12,
    jobRole: 12,
    preferences: 4, // Looking for job/internship
  };

  // Start with 0 percent
  let totalPercent = 0;

  // Add percentage for each completed field
  Object.keys(fieldPercentages).forEach((field) => {
    if (field === "preferences") {
      // Special case for preferences
      if (
        userData.lookingFor &&
        (userData.lookingFor.internship === true ||
          userData.lookingFor.job === true)
      ) {
        totalPercent += fieldPercentages[field];
      }
    } else if (userData[field]) {
      // Check different data types
      if (Array.isArray(userData[field])) {
        if (userData[field].length > 0) {
          totalPercent += fieldPercentages[field];
        }
      } else if (typeof userData[field] === "string") {
        if (userData[field].trim() !== "") {
          totalPercent += fieldPercentages[field];
        }
      } else if (userData[field] !== null && userData[field] !== undefined) {
        totalPercent += fieldPercentages[field];
      }
    }
  });

  // Return the exact percentage without any rounding
  return totalPercent;
}

// Calculate Assessment completion percentage
function calculateAssessmentCompletion(userData) {
  if (!userData) return 0;

  // Default to 0/5 if no data
  let completedAssessments = 0;
  let totalAssessments = 5;

  // Try to get values from userData
  if (userData.completedAssessments !== undefined) {
    completedAssessments = parseInt(userData.completedAssessments);
    if (isNaN(completedAssessments)) completedAssessments = 0;
  }

  if (userData.totalAssessments !== undefined) {
    totalAssessments = parseInt(userData.totalAssessments);
    if (isNaN(totalAssessments) || totalAssessments <= 0) totalAssessments = 5;
  }

  // Use a simple percentage calculation with exact multiples of 20% for 5 assessments
  if (totalAssessments === 0) return 0;

  // Calculate percentage ensuring it's a clean multiple of 20 for 5 tests
  // This ensures consistent progress bar visuals
  const exactPercentage = (completedAssessments / totalAssessments) * 100;

  return exactPercentage;
}

// Update the assessment count text from user data
function updateAssessmentCount(userData) {
  const progressCount = document.getElementById("progress-count");
  if (progressCount) {
    // Get assessment data from user data
    const completedAssessments = userData?.completedAssessments || 0;
    const totalAssessments = userData?.totalAssessments || 5;

    progressCount.textContent = `${completedAssessments}/${totalAssessments}`;
  }
}

// Update a progress text element by ID
function updateProgressText(id, percent) {
  const textElement = document.getElementById(id);
  if (textElement) {
    // Convert to integer to avoid decimal points
    const displayPercent = Math.round(percent);
    textElement.textContent = displayPercent + "%";
  } else {
    console.error(`Text element with ID ${id} not found`);
  }
}

// Setup toggle switches for job preferences
function setupToggleSwitches() {
  // Only setup if we have userData globally available
  if (!window.userData) return;

  const internSwitch = document.getElementById("internSwitch");
  const jobSwitch = document.getElementById("jobSwitch");

  // Set initial state from userData
  if (internSwitch) {
    internSwitch.checked = window.userData?.lookingFor?.internship === true;
  }

  if (jobSwitch) {
    jobSwitch.checked = window.userData?.lookingFor?.job === true;
  }

  // Add event listeners for real-time updates
  if (internSwitch) {
    internSwitch.addEventListener("change", function () {
      updateSelection(this);
    });
  }

  if (jobSwitch) {
    jobSwitch.addEventListener("change", function () {
      updateSelection(this);
    });
  }
}

// Handle toggle switch changes
function updateSelection(checkbox) {
  if (!window.userData) return;

  // Update userData in memory
  if (!window.userData.lookingFor) {
    window.userData.lookingFor = {};
  }

  // Set the preference in the userData
  if (checkbox.id === "internSwitch") {
    window.userData.lookingFor.internship = checkbox.checked;
  } else if (checkbox.id === "jobSwitch") {
    window.userData.lookingFor.job = checkbox.checked;
  }

  // Update database with new preferences
  updateUserPreferencesInDB(checkbox.id, checkbox.checked);

  // Update job profile progress immediately in UI
  const newPercent = calculateJobProfileCompletion(window.userData);
  updateProgressBar("progress-2", newPercent);
  updateProgressText("text-2", newPercent);
}

// Update job preferences in database
function updateUserPreferencesInDB(preferenceId, value) {
  // This is a placeholder for the actual database update
  // In a real implementation, this would use Firebase/Firestore or another DB
  console.log(`Updating preference ${preferenceId} to ${value} in database`);

  // Example of what the code might look like with Firebase:
  /*
  if (!userId) return;
  
  const userDocRef = doc(db, "users", userId);
  const preferenceField = preferenceId === "internSwitch" ? "lookingFor.internship" : "lookingFor.job";
  
  updateDoc(userDocRef, {
    [preferenceField]: value
  }).catch(error => {
    console.error("Error updating user preference:", error);
  });
  */
}

// Update the user name display from user data
function updateUserName() {
  const userNameElement = document.getElementById("userName");
  if (userNameElement && window.userData) {
    if (window.userData.full_name) {
      userNameElement.textContent = window.userData.full_name;
    }
  }
}

// Make updateSelection available globally for HTML onclick
window.updateSelection = updateSelection;

// Function to update user data from external sources (like auth state change)
function setUserData(data) {
  window.userData = data;

  // Update UI based on the new data
  updateProgressFromUserData(data);
  updateUserName();
  setupToggleSwitches();
}

// Make function available globally
window.setUserData = setUserData;

// Initialize CV View functionality
document.addEventListener("DOMContentLoaded", function () {
  const viewCvLink = document.getElementById("view_cv");
  if (viewCvLink) {
    viewCvLink.addEventListener("click", function (e) {
      e.preventDefault();
      // Try to get CV URL from localStorage
      const cvUrl = localStorage.getItem("cvUrl");
      if (cvUrl) {
        window.open(cvUrl, "_blank");
      } else {
        // Redirect to CV upload page if no CV is available
        window.location.href = "/myaccount/cv_upload/";
      }
    });
  }
});

// Debugging tool to test progress calculations
window.testProgressCalculation = function (dataSet) {
  console.log("Testing progress calculation with data set:", dataSet);

  // Get mock data if a string is provided
  let testData;
  if (typeof dataSet === "string" && window.getMockDataByLevel) {
    const mockDataSets = {
      empty: { mockLevel: "empty" },
      minimal: { mockLevel: "minimal" },
      partial: { mockLevel: "partial" },
      full: { mockLevel: "full" },
    };
    testData = window.getMockDataByLevel(
      mockDataSets[dataSet]?.mockLevel || dataSet
    );
  } else if (typeof dataSet === "object") {
    testData = dataSet;
  } else {
    testData = window.userData || {};
  }

  // Calculate percentages
  const personalPercent = calculatePersonalProfileCompletion(testData);
  const jobPercent = calculateJobProfileCompletion(testData);
  const assessmentPercent = calculateAssessmentCompletion(testData);

  console.log("Personal profile completion: " + personalPercent + "%");
  console.log("Job profile completion: " + jobPercent + "%");
  console.log("Assessment completion: " + assessmentPercent + "%");

  return {
    personal: personalPercent,
    job: jobPercent,
    assessment: assessmentPercent,
  };
};

// Function to show debug information for progress calculation
window.showProgressDebug = function () {
  // Create or get debug overlay
  let debugDiv = document.getElementById("progress-debug");
  if (!debugDiv) {
    debugDiv = document.createElement("div");
    debugDiv.id = "progress-debug";
    debugDiv.style.position = "fixed";
    debugDiv.style.top = "10px";
    debugDiv.style.right = "10px";
    debugDiv.style.backgroundColor = "rgba(0,0,0,0.8)";
    debugDiv.style.color = "white";
    debugDiv.style.padding = "10px";
    debugDiv.style.borderRadius = "5px";
    debugDiv.style.zIndex = "9999";
    debugDiv.style.maxWidth = "400px";
    debugDiv.style.fontSize = "12px";
    document.body.appendChild(debugDiv);
  }

  // Get the current userData
  const userData = window.userData || {};

  // Personal Profile Fields
  const personalFields = [
    "full_name",
    "email",
    "phone",
    "dob",
    "address",
    "gender",
    "category",
  ];

  // Job Profile Fields
  const jobFields = [
    "skills",
    "experience",
    "graduationStream",
    "graduationDegree",
    "preferredLocation",
    "jobType",
    "expectedSalary",
    "jobRole",
  ];

  // Build HTML
  let html = "<h3>Progress Debug</h3>";

  // Personal Profile
  html += "<h4>Personal Profile</h4>";
  let personalComplete = 0;
  personalFields.forEach((field) => {
    const isComplete = userData[field] ? true : false;
    personalComplete += isComplete ? 1 : 0;
    html += `<div>${field}: ${isComplete ? "✓" : "✗"}</div>`;
  });
  const personalPercent = Math.floor(
    (personalComplete / personalFields.length) * 100
  );
  html += `<div><strong>Total: ${personalComplete}/${personalFields.length} = ${personalPercent}%</strong></div>`;

  // Job Profile
  html += "<h4>Job Profile</h4>";
  let jobComplete = 0;
  jobFields.forEach((field) => {
    const isComplete = userData[field] ? true : false;
    jobComplete += isComplete ? 1 : 0;
    html += `<div>${field}: ${isComplete ? "✓" : "✗"}</div>`;
  });

  // Preferences
  const prefComplete =
    userData.lookingFor &&
    (userData.lookingFor.internship || userData.lookingFor.job)
      ? 1
      : 0;
  html += `<div>Preferences: ${prefComplete ? "✓" : "✗"}</div>`;
  jobComplete += prefComplete;

  const jobPercent = Math.floor((jobComplete / (jobFields.length + 1)) * 100);
  html += `<div><strong>Total: ${jobComplete}/${
    jobFields.length + 1
  } = ${jobPercent}%</strong></div>`;

  // Assessments
  html += "<h4>Assessments</h4>";
  const completedAssessments = userData.completedAssessments || 0;
  const totalAssessments = userData.totalAssessments || 5;
  const assessmentPercent = Math.floor(
    (completedAssessments / totalAssessments) * 100
  );
  html += `<div><strong>${completedAssessments}/${totalAssessments} = ${assessmentPercent}%</strong></div>`;

  // Add close button
  html +=
    "<button onclick=\"document.getElementById('progress-debug').remove()\">Close</button>";

  // Set content
  debugDiv.innerHTML = html;

  return {
    personal: personalPercent,
    job: jobPercent,
    assessment: assessmentPercent,
  };
};
