// DOM Ready Event Progress bar

document.addEventListener("DOMContentLoaded", function () {
  // console.log("DOM fully loaded and parsed");
  initializeProgressBars();
  setupToggleSwitches();
});

// Initialize all progress bars on the page
function initializeProgressBars() {
  // Set default values if not already set in localStorage
  if (!localStorage.getItem("profile1Percent")) {
    localStorage.setItem("profile1Percent", "25");
  }

  if (!localStorage.getItem("profile2Percent")) {
    localStorage.setItem("profile2Percent", "40");
  }

  if (!localStorage.getItem("profile3Percent")) {
    localStorage.setItem("profile3Percent", "60");
  }

  // Get values from localStorage
  const profile1 = localStorage.getItem("profile1Percent");
  const profile2 = localStorage.getItem("profile2Percent");
  const profile3 = localStorage.getItem("profile3Percent");

  // Make sure all progress bars are initially set to 0% to enable animation
  document.querySelectorAll(".progress-bar-custom").forEach((bar) => {
    bar.style.width = "0%";
  });

  // Use requestAnimationFrame to ensure smooth animations
  requestAnimationFrame(() => {
    // Update the progress bars with a small delay to allow the initial rendering
    setTimeout(() => {
      updateProgressBar("progress-1", profile1);
      updateProgressBar("progress-2", profile2);
      updateProgressBar("progress-3", profile3);

      // Update corresponding text elements
      updateProgressText("text-1", profile1);
      updateProgressText("text-2", profile2);
      updateProgressText("text-3", profile3);

      // Update the assessment count text (example: 3/5 completed)
      const progressCount = document.getElementById("progress-count");
      if (progressCount) {
        progressCount.textContent = "3/5";
      }
    }, 100);
  });
}

// Update a progress bar element by ID
function updateProgressBar(id, percent) {
  const progressBar = document.getElementById(id);
  if (progressBar) {
    // Force a reflow to ensure style update is applied
    progressBar.style.width = "0%";
    setTimeout(() => {
      progressBar.style.width = percent + "%";
      progressBar.setAttribute("aria-valuenow", percent);
      // console.log(`Updated progress bar ${id} to ${percent}%`);
    }, 50);
  } else {
    // console.error(`Progress bar with ID ${id} not found`);
  }
}

// Update a progress text element by ID
function updateProgressText(id, percent) {
  const textElement = document.getElementById(id);
  if (textElement) {
    textElement.textContent = percent + "%";
    // console.log(`Updated text ${id} to ${percent}%`);
  } else {
    // console.error(`Text element with ID ${id} not found`);
  }
}

// Setup toggle switches for job preferences
function setupToggleSwitches() {
  // Set initial state from localStorage
  const internSwitch = document.getElementById("internSwitch");
  const jobSwitch = document.getElementById("jobSwitch");

  if (internSwitch) {
    internSwitch.checked = localStorage.getItem("internship") === "true";
  }

  if (jobSwitch) {
    jobSwitch.checked = localStorage.getItem("job") === "true";
  }
}

// Handle toggle switch changes
function updateSelection(checkbox) {
  // console.log(`Toggle changed: ${checkbox.id} = ${checkbox.checked}`);
  localStorage.setItem(checkbox.value, checkbox.checked);
}

// Make updateSelection available globally for HTML onclick
window.updateSelection = updateSelection;
