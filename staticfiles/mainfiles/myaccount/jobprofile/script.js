var presentAddressDatabase = {};

const email = localStorage.getItem("email");
// console.log(email);
var userData = {};

if (!email) {
  window.location.href = "/login/";
}
async function isUser() {
  showLoading(); // Show loading indicator

  const docRef = doc(db, "user_profile", email);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      userData = docSnap.data();
      populateImage(userData.about.image);
      hideLoading(); // Hide loading indicator on success
    } else {
      hideLoading(); // Hide loading indicator
      showStatusMessage(
        "No user profile found. Please complete your profile.",
        "warning"
      );
    }
  } catch (error) {
    hideLoading(); // Hide loading indicator on error
    console.error("Error getting user data from user_profile:", error);
    showStatusMessage("Failed to load profile data", "danger");
  }
}

function populateImage(Image) {
  const imageUrl =
    Image || "https://www.pngall.com/wp-content/uploads/5/Profile.png";
  // cvUrl = userData.about?.cv || "";

  const profileImage = document.getElementById("show_image");
  if (imageUrl) {
    profileImage.src = imageUrl;
  }
  // console.log(userData);
  if (userData.social) {
    // document.getElementById("github").href = userData.social.github || "#";
    // document.getElementById("leetcode").href = userData.social.leetcode || "#";
    // document.getElementById("linkedin").href = userData.social.linkedin || "#";
    // document.getElementById("instagram").href =
    //   userData.social.instagram || "#";
    loadSocial();

    document.getElementById("edit-github").value = userData.social.github || "";
    document.getElementById("edit-linkedin").value =
      userData.social.linkedin || "";
    document.getElementById("edit-leetcode").value =
      userData.social.leetcode || "";
    document.getElementById("edit-instagram").value =
      userData.social.instagram || "";
  }

  if (userData.address) {
    // const userAddress = userData.address;
    loadAddress();
  }
  if (userData.education) {
    loadEducation();
  }
  if (userData.experience) {
    loadExperience();
  }
  if (userData.skills) {
    loadSkills();
  }
}

// Loading overlay functions
function showLoading() {
  document.getElementById("loading-overlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loading-overlay").style.display = "none";
}

// Add utility function for improved status messages with toast-like appearance
function showStatusMessage(message, type = "info") {
  // Remove all existing alerts to prevent duplicates
  const existingAlerts = document.querySelectorAll(".status-alert");
  existingAlerts.forEach((alert) => {
    if (alert && alert.parentNode) {
      alert.remove();
    }
  });

  // Create toast element
  const toastDiv = document.createElement("div");
  toastDiv.className = `toast status-alert show`;
  toastDiv.style.position = "fixed";
  toastDiv.style.top = "20px";
  toastDiv.style.right = "20px";
  toastDiv.style.zIndex = "9999";
  toastDiv.style.backgroundColor = "#fff";
  toastDiv.style.boxShadow = "0 0.5rem 1rem rgba(0, 0, 0, 0.15)";
  toastDiv.style.minWidth = "250px";
  toastDiv.style.maxWidth = "350px";
  toastDiv.style.border = "none";
  toastDiv.style.borderRadius = "0.25rem";
  toastDiv.style.overflow = "hidden";

  // Add toast header with icon based on type
  const toastHeader = document.createElement("div");
  toastHeader.className = `toast-header`;
  toastHeader.style.padding = "0.5rem 1rem";
  toastHeader.style.backgroundColor = getHeaderColor(type);
  toastHeader.style.color = "#fff";
  toastHeader.style.fontWeight = "500";
  toastHeader.style.display = "flex";
  toastHeader.style.justifyContent = "space-between";
  toastHeader.style.alignItems = "center";

  // Add icon
  const icon = document.createElement("i");
  icon.className = getIconClass(type);
  icon.style.marginRight = "0.5rem";

  // Add title text
  const titleText = document.createElement("span");
  titleText.textContent = getTitleText(type);
  titleText.style.flexGrow = "1";

  // Add close button
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "btn-close btn-close-white";
  closeButton.dataset.bsDismiss = "toast";
  closeButton.style.marginLeft = "auto";
  closeButton.style.fontSize = "0.875rem";
  closeButton.addEventListener("click", () => toastDiv.remove());

  toastHeader.appendChild(icon);
  toastHeader.appendChild(titleText);
  toastHeader.appendChild(closeButton);

  // Add toast body with message
  const toastBody = document.createElement("div");
  toastBody.className = "toast-body";
  toastBody.style.padding = "0.75rem 1rem";
  toastBody.textContent = message;

  // Assemble toast
  toastDiv.appendChild(toastHeader);
  toastDiv.appendChild(toastBody);

  // Add to body
  document.body.appendChild(toastDiv);

  // Add animation
  toastDiv.style.transition =
    "opacity 0.5s ease-in-out, transform 0.3s ease-out";
  toastDiv.style.opacity = "0";
  toastDiv.style.transform = "translateX(20px)";

  // Trigger animation
  setTimeout(() => {
    toastDiv.style.opacity = "1";
    toastDiv.style.transform = "translateX(0)";
  }, 10);
  // Auto remove after 4 seconds with fade-out animation
  setTimeout(() => {
    if (toastDiv.parentNode) {
      toastDiv.style.opacity = "0";
      toastDiv.style.transform = "translateX(20px)";
      setTimeout(() => {
        if (toastDiv.parentNode) {
          toastDiv.remove();
        }
      }, 300);
    }
  }, 4000);

  // Helper functions for toast styling
  function getHeaderColor(type) {
    switch (type) {
      case "success":
        return "#198754";
      case "warning":
        return "#ffc107";
      case "danger":
        return "#dc3545";
      case "info":
      default:
        return "#0d6efd";
    }
  }

  function getIconClass(type) {
    switch (type) {
      case "success":
        return "fas fa-check-circle";
      case "warning":
        return "fas fa-exclamation-triangle";
      case "danger":
        return "fas fa-times-circle";
      case "info":
      default:
        return "fas fa-info-circle";
    }
  }

  function getTitleText(type) {
    switch (type) {
      case "success":
        return "Success";
      case "warning":
        return "Warning";
      case "danger":
        return "Error";
      case "info":
      default:
        return "Information";
    }
  }
}

// Add modal utilities for consistent behavior
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    // Check if it's a Bootstrap modal or custom modal
    if (modal.classList.contains("modal")) {
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
    } else {
      modal.classList.remove("d-none");
    }
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    // Check if it's a Bootstrap modal or custom modal
    if (modal.classList.contains("modal")) {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    } else {
      modal.classList.add("d-none");
    }
  }
}

isUser();

// Get references to the button and the form
const editButton = document.getElementById("edit-social-button");
const editForm = document.getElementById("edit-form-social");
const cancelButton = document.getElementById("cancel-button-social");

// Function to check for invalid social media URLs
function checkForInvalidSocialUrls() {
  if (!userData.social) return false;

  const socialLinks = userData.social;
  let invalidLinks = [];

  for (let key in socialLinks) {
    if (socialLinks[key] && !isValidURL(socialLinks[key], key)) {
      invalidLinks.push(key);
    }
  }

  return invalidLinks;
}

// Show the edit form when the edit button is clicked
editButton.addEventListener("click", () => {
  // Just show the modal without alerts
  showModal("edit-form-social");

  // Validate silently in background
  setTimeout(() => {
    const fields = [
      { id: "edit-github", type: "github" },
      { id: "edit-linkedin", type: "linkedin" },
      { id: "edit-leetcode", type: "leetcode" },
      { id: "edit-instagram", type: "instagram" },
    ];

    fields.forEach((field) => {
      const input = document.getElementById(field.id);
      if (input && input.value.trim()) {
        validateSocialField(input, field.type);
      }
    });
  }, 200);
});

// Function to reset all validation states
function resetAllValidationStates() {
  const fields = [
    { id: "edit-github", type: "github" },
    { id: "edit-linkedin", type: "linkedin" },
    { id: "edit-leetcode", type: "leetcode" },
    { id: "edit-instagram", type: "instagram" },
  ];

  // Reset each field
  fields.forEach((field) => {
    const input = document.getElementById(field.id);
    if (input) {
      input.classList.remove("is-valid", "is-invalid");
      const inputGroup = input.closest(".input-group");
      if (inputGroup) {
        inputGroup.classList.remove("is-valid", "is-invalid");
      }

      // Reset help text
      const helpTextId = input.getAttribute("aria-describedby");
      const helpText = document.getElementById(helpTextId);
      if (helpText) {
        helpText.textContent = `Enter your ${field.type} profile URL or leave blank`;
        helpText.style.color = "";
      }
    }
  });

  // Hide validation summary
  const validationSummary = document.getElementById("validation-summary");
  if (validationSummary) {
    validationSummary.classList.add("d-none");
  }
}

// Hide the edit form when the cancel button is clicked
cancelButton.addEventListener("click", () => {
  resetAllValidationStates();
  hideModal("edit-form-social");
});

const socialLinkList = document.getElementById("social-profile");
//load skills
// Helper function to get social media icons and properly format URLs
function getSocialIcon(platform, url) {
  // Make sure URL has a protocol
  let formattedUrl = url;
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    formattedUrl = "https://" + url;
  }

  // Get appropriate icon class
  let iconClass = "";
  switch (platform.toLowerCase()) {
    case "github":
      iconClass = "fab fa-github";
      break;
    case "linkedin":
      iconClass = "fab fa-linkedin";
      break;
    case "leetcode":
      iconClass = "fas fa-code"; // Using standard Font Awesome icon
      break;
    case "instagram":
      iconClass = "fab fa-instagram";
      break;
    default:
      iconClass = "fas fa-link";
  }

  return {
    url: formattedUrl,
    icon: iconClass,
  };
}

async function loadSocial() {
  try {
    const docRef = doc(db, "user_profile", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists) {
      const userData = docSnap.data();
      const socialLinks = userData.social || [];

      socialLinkList.innerHTML = "";

      for (let key in socialLinks) {
        if (socialLinks[key]) {
          const socialInfo = getSocialIcon(key, socialLinks[key]);
          const url = socialLinks[key];
          const isValid = isValidURL(url, key);

          // Add different styling based on URL validity
          const btnClass = isValid
            ? "btn btn-outline-dark rounded-pill mb-2 me-2"
            : "btn btn-outline-danger rounded-pill mb-2 me-2";

          // Add a tooltip for invalid URLs
          const tooltip = isValid
            ? ""
            : `data-bs-toggle="tooltip" data-bs-placement="top" title="This URL may be invalid. Please edit your profile to fix it."`;

          socialLinkList.innerHTML += `
            <a href="${
              socialInfo.url
            }" id="${key}" target="_blank" rel="noopener noreferrer" 
               class="${btnClass}" ${tooltip}>
              <i class="${socialInfo.icon} me-1"></i>${key}
              ${
                !isValid
                  ? '<i class="fas fa-exclamation-circle ms-1 text-danger"></i>'
                  : ""
              }
            </a>`;
        }
      }

      // Initialize tooltips
      const tooltips = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltips.map(function (tooltip) {
        return new bootstrap.Tooltip(tooltip);
      });
    }
  } catch (error) {
    console.error("Error loading social links:", error);
    showStatusMessage("Failed to load social links", "danger");
  }
}

// URL validation function with domain-specific validation
function isValidURL(url, type = null) {
  if (!url) return true; // Empty URLs are allowed

  try {
    const parsedUrl = new URL(url);

    // If a specific type is provided, verify the domain matches expected pattern
    if (type) {
      switch (type.toLowerCase()) {
        case "github":
          return parsedUrl.hostname === "github.com";
        case "linkedin":
          return (
            parsedUrl.hostname === "linkedin.com" ||
            parsedUrl.hostname === "www.linkedin.com"
          );
        case "leetcode":
          return (
            parsedUrl.hostname === "leetcode.com" ||
            parsedUrl.hostname === "www.leetcode.com"
          );
        case "instagram":
          return (
            parsedUrl.hostname === "instagram.com" ||
            parsedUrl.hostname === "www.instagram.com"
          );
      }
    }

    return true;
  } catch (e) {
    return false;
  }
}

// Function to validate a specific field and show inline validation
function validateSocialField(inputElement, type) {
  const url = inputElement.value.trim();
  const isValid = !url || isValidURL(url, type);
  // Find the input group
  const inputGroup = inputElement.closest(".input-group");

  // Try to get help text element if it exists
  const helpTextId = inputElement.getAttribute("aria-describedby");
  const helpText = helpTextId ? document.getElementById(helpTextId) : null;

  // Remove any existing feedback elements to prevent duplicates
  const existingFeedback =
    inputGroup.parentNode.querySelectorAll(".invalid-feedback");
  existingFeedback.forEach((el) => el.remove());

  // Create a new feedback element
  let feedbackElement = document.createElement("div");
  feedbackElement.className = "invalid-feedback";
  // Insert after the input-group
  inputGroup.parentNode.insertBefore(feedbackElement, helpText || null);

  if (isValid) {
    // Valid URL or empty
    inputElement.classList.remove("is-invalid");
    inputElement.classList.add("is-valid");

    // Affect the input group too for styling
    inputGroup.classList.remove("is-invalid");
    inputGroup.classList.add("is-valid");

    // Hide the feedback element
    feedbackElement.style.display = "none"; // Show success message in help text if it exists and URL is valid (not empty)
    if (helpText) {
      if (url) {
        helpText.textContent = `Valid ${type} URL format`;
        helpText.style.color = "#198754";
      } else {
        // Reset help text for empty field
        helpText.textContent = `Enter your ${type} profile URL or leave blank`;
        helpText.style.color = "";
      }
    }

    return true;
  } else {
    // Invalid URL
    inputElement.classList.remove("is-valid");
    inputElement.classList.add("is-invalid");

    // Affect the input group too for styling
    inputGroup.classList.remove("is-valid");
    inputGroup.classList.add("is-invalid");
    // Add domain-specific error messages with examples
    let errorMessage = `Please enter a valid ${type} URL`;
    switch (type.toLowerCase()) {
      case "github":
        errorMessage =
          "URL must be from github.com domain, e.g., https://github.com/username";
        break;
      case "linkedin":
        errorMessage =
          "URL must be from linkedin.com domain, e.g., https://linkedin.com/in/username";
        break;
      case "leetcode":
        errorMessage =
          "URL must be from leetcode.com domain, e.g., https://leetcode.com/username";
        break;
      case "instagram":
        errorMessage =
          "URL must be from instagram.com domain, e.g., https://instagram.com/username";
        break;
    } // Update feedback message
    feedbackElement.innerText = errorMessage;
    feedbackElement.style.display = "block";

    // Update help text color if it exists
    if (helpText) {
      helpText.style.color = "#dc3545";
    }

    return false;
  }
}

async function saveFormDataToDatabase(event) {
  event.preventDefault(); // Prevent default form submission behavior

  // Get input elements
  const githubInput = document.getElementById("edit-github");
  const linkedinInput = document.getElementById("edit-linkedin");
  const leetcodeInput = document.getElementById("edit-leetcode");
  const instagramInput = document.getElementById("edit-instagram");

  // Get social links from form
  const githubUrl = githubInput.value.trim();
  const linkedinUrl = linkedinInput.value.trim();
  const leetcodeUrl = leetcodeInput.value.trim();
  const instagramUrl = instagramInput.value.trim();

  // Validate all fields and gather results
  const isGithubValid = validateSocialField(githubInput, "github");
  const isLinkedinValid = validateSocialField(linkedinInput, "linkedin");
  const isLeetcodeValid = validateSocialField(leetcodeInput, "leetcode");
  const isInstagramValid = validateSocialField(instagramInput, "instagram");
  // If any field is invalid, show a summary message and return
  if (
    !isGithubValid ||
    !isLinkedinValid ||
    !isLeetcodeValid ||
    !isInstagramValid
  ) {
    // Collect the invalid field types for a better message
    const invalidTypes = [];
    if (!isGithubValid) invalidTypes.push("GitHub");
    if (!isLinkedinValid) invalidTypes.push("LinkedIn");
    if (!isLeetcodeValid) invalidTypes.push("LeetCode");
    if (!isInstagramValid) invalidTypes.push("Instagram");

    // Remove any existing status alerts before showing this one
    const existingAlerts = document.querySelectorAll(".status-alert");
    existingAlerts.forEach((alert) => alert.remove());

    showStatusMessage(
      `Please correct the invalid ${invalidTypes.join(
        ", "
      )} URLs highlighted in red.`,
      "warning"
    );
    return;
  }

  // Collect social links data from the form
  var socialData = {
    github: githubUrl,
    linkedin: linkedinUrl,
    leetcode: leetcodeUrl,
    instagram: instagramUrl,
  };

  // Reference to Firestore document (uses `email` as the document ID)
  const userProfileRef = doc(db, "user_profile", email);

  try {
    // Fetch the existing document data
    const docSnapshot = await getDoc(userProfileRef);
    const auditForm = docSnapshot.data().audit_fields;
    // const currentDate = getCurrentDateTime();
    var currentDate = window.getCurrentDateTime();
    var auditData = {
      createdAt: auditForm.createdAt,
      createdBy: docSnapshot.data().about.email,
      updatedAt: currentDate,
      updatedBy: docSnapshot.data().about.email,
    };
    if (docSnapshot.exists()) {
      // If the document exists, merge the new social links with existing data
      const existingData = docSnapshot.data();
      const updatedData = {
        ...existingData,
        social: socialData, // Update only the "social" field
        audit_fields: auditData,
      }; // Show saving status
      document.getElementById("save-button-social").textContent = "Saving...";
      document.getElementById("save-button-social").disabled = true;
      // Save the merged data back to Firestore
      await setDoc(userProfileRef, updatedData);
      // Show success message
      showStatusMessage("Social links successfully updated!", "success");
    } else {
      // If the document does not exist, create a new one with only social links
      const newData = {
        social: socialData,
      };
      await setDoc(userProfileRef, newData);
      showStatusMessage("New profile created with social links!", "success");
    } // Update UI instead of page reload
    loadSocial();

    // Reset validation states and hide the modal
    resetAllValidationStates();
    hideModal("edit-form-social");

    // Reset button state
    document.getElementById("save-button-social").textContent = "Save";
    document.getElementById("save-button-social").disabled = false;
  } catch (error) {
    // Handle errors gracefully
    console.error("Error updating social links: ", error);

    // Reset button state
    const saveButton = document.getElementById("save-button-social");
    if (saveButton) {
      saveButton.textContent = "Save";
      saveButton.disabled = false;
    }

    showStatusMessage(
      "Failed to update social links: " + (error.message || "Unknown error"),
      "danger"
    );
  }
}

// Set up real-time validation for social media fields
function setupSocialFieldValidation(enable = true) {
  const fields = [
    { id: "edit-github", type: "github" },
    { id: "edit-linkedin", type: "linkedin" },
    { id: "edit-leetcode", type: "leetcode" },
    { id: "edit-instagram", type: "instagram" },
  ];
  // Clean previous validation state when modal opens
  const socialEditButton = document.getElementById("edit-button-social");
  if (socialEditButton) {
    // Remove existing event listeners to avoid duplicates
    const newSocialEditButton = socialEditButton.cloneNode(true);
    socialEditButton.parentNode.replaceChild(
      newSocialEditButton,
      socialEditButton
    );

    // Add the click event listener to the new button
    newSocialEditButton.addEventListener("click", function () {
      // Reset all fields
      fields.forEach((field) => {
        const input = document.getElementById(field.id);
        if (input) {
          input.classList.remove("is-valid", "is-invalid");
          const inputGroup = input.closest(".input-group");
          if (inputGroup) {
            inputGroup.classList.remove("is-valid", "is-invalid");
          }

          // Reset help text
          const helpTextId = input.getAttribute("aria-describedby");
          const helpText = document.getElementById(helpTextId);
          if (helpText) {
            helpText.textContent = `Enter your ${field.type} profile URL or leave blank`;
            helpText.style.color = "";
          }

          // Remove any feedback messages
          const feedback =
            input.parentNode.parentNode.querySelector(".invalid-feedback");
          if (feedback) {
            feedback.style.display = "none";
          }
        }
      });

      // Clear any existing status alerts
      const existingAlerts = document.querySelectorAll(".status-alert");
      existingAlerts.forEach((alert) => alert.remove());
    });
  } // Remove existing event listeners (to avoid duplicates when re-setting up)
  fields.forEach((field) => {
    const input = document.getElementById(field.id);
    if (input) {
      // Clone the node to remove all event listeners
      const clone = input.cloneNode(true);
      input.parentNode.replaceChild(clone, input);

      // Also clear any related validation UI
      const inputGroup = clone.closest(".input-group");
      if (inputGroup) {
        inputGroup.classList.remove("is-valid", "is-invalid");
      }

      // Clear any feedback messages
      const feedback =
        inputGroup?.parentNode?.querySelector(".invalid-feedback");
      if (feedback) {
        feedback.style.display = "none";
      }
    }
  });

  // Set up new event listeners if validation is enabled
  if (enable) {
    fields.forEach((field) => {
      const input = document.getElementById(field.id);
      if (input) {
        // Add input event listener for real-time validation with debounce
        let debounceTimer;
        input.addEventListener("input", function () {
          clearTimeout(debounceTimer);

          // Reset immediate visual state
          const inputGroup = this.closest(".input-group");
          if (inputGroup) {
            inputGroup.classList.remove("is-valid", "is-invalid");
          }
          this.classList.remove("is-valid", "is-invalid");

          // Debounce validation to avoid too frequent checks while typing
          debounceTimer = setTimeout(() => {
            // Only validate after user has typed a few characters
            if (this.value.trim().length > 5) {
              validateSocialField(this, field.type);
            } else {
              // Reset validation state for short inputs
              this.classList.remove("is-valid", "is-invalid");
              const inputGroup = this.closest(".input-group");
              if (inputGroup) {
                inputGroup.classList.remove("is-valid", "is-invalid");
              }

              // Reset help text
              const helpTextId = this.getAttribute("aria-describedby");
              const helpText = document.getElementById(helpTextId);
              if (helpText) {
                helpText.textContent = `Enter your ${field.type} profile URL or leave blank`;
                helpText.style.color = "";
              }

              // Hide any feedback
              const feedback =
                this.parentNode.parentNode.querySelector(".invalid-feedback");
              if (feedback) {
                feedback.style.display = "none";
              }
            }
          }, 600); // Delay validation by 600ms while typing
        });

        // Validate immediately on blur (when user leaves the field)
        input.addEventListener("blur", function () {
          clearTimeout(debounceTimer);
          if (this.value.trim()) {
            validateSocialField(this, field.type);
          } else {
            // Reset validation for empty fields
            this.classList.remove("is-valid", "is-invalid");
            const inputGroup = this.closest(".input-group");
            if (inputGroup) {
              inputGroup.classList.remove("is-valid", "is-invalid");
            }

            // Reset help text
            const helpTextId = this.getAttribute("aria-describedby");
            const helpText = document.getElementById(helpTextId);
            if (helpText) {
              helpText.textContent = `Enter your ${field.type} profile URL or leave blank`;
              helpText.style.color = "";
            }

            // Hide any feedback
            const feedback =
              this.parentNode.parentNode.querySelector(".invalid-feedback");
            if (feedback) {
              feedback.style.display = "none";
            }
          }
        });
      }
    });
  }
}

// Function to validate all social URLs internally
function validateAllSocialURLs() {
  const fields = [
    { id: "edit-github", type: "github" },
    { id: "edit-linkedin", type: "linkedin" },
    { id: "edit-leetcode", type: "leetcode" },
    { id: "edit-instagram", type: "instagram" },
  ];

  let allValid = true;
  let invalidFields = [];

  fields.forEach((field) => {
    const input = document.getElementById(field.id);
    if (input && input.value.trim()) {
      const isValid = validateSocialField(input, field.type);
      if (!isValid) {
        allValid = false;
        invalidFields.push(field.type);
      }
    }
  });

  // Only show a single validation message if there are invalid fields
  // We're not calling showStatusMessage here to avoid duplicates
  // Messages will be shown by individual field validations

  return allValid;
}

// Initialize validation when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Setup validation with always-on behavior
  setupSocialFieldValidation(true);
});

// Attach event listener to the save button
const saveButton = document.getElementById("save-button-social");
if (saveButton) {
  saveButton.addEventListener("click", saveFormDataToDatabase);
} else {
  console.warn("Save button for social links not found in the DOM");
}

// SKills

// async function saveSkillsToDatabase(event) {
//   event.preventDefault(); // Prevent default form submission behavior
//   console.log("Saving social links to database...");

//   // Collect social links data from the form

//   // Reference to Firestore document (uses `email` as the document ID)
//   const userProfileRef = doc(db, "user_profile", email);

//   try {
//     // Fetch the existing document data
//     const docSnapshot = await getDoc(userProfileRef);

//     if (docSnapshot.exists()) {
//       // If the document exists, merge the new social links with existing data
//       const existingData = docSnapshot.data();
//       console.log(existingData);
//     }

//     // Reload the page after saving
//     window.location.reload();
//   } catch (error) {
//     // Handle errors gracefully
//     console.error("Error updating social links: ", error);
//   }
// }

// Attach event listener to the save button

const skillsCollection = doc(db, "user_profile", email);
// DOM Elements
const skillsContainer = document.getElementById("skills-container");
const editSkillModal = document.getElementById("edit-skill-modal");
const editSkillForm = document.getElementById("edit-skill-form");
const skillNameInput = document.getElementById("skill-name");
const addSkillButton = document.getElementById("add-skill-button");
const cancelSkillsButton = document.getElementById("cancel-button-skills");
let isEditSkillMode = false;
let editingSkillId = null;

// // Load Skills from Firestore
// async function loadSkills() {
//     const docRef = doc(db, "user_profile", email);

//     try {
//         const docSnap = await getDoc(docRef);
//         //   console.log(docSnap);
//         if (docSnap.exists()) {
//           userData = docSnap.data();
//           console.log(userData);

//         }

//     //   Ensure querySnapshot is valid and has 'forEach' method
//       if (userData.skills && typeof userData.skills.forEach === 'function') {
//         userData.skills.forEach((doc) => {

//         //   console.log(skill);

//           // Dynamically add the skill to the container
//           skillsContainer.innerHTML += `

//           `;
//         });
//       } else {
//         console.error('Error: userData.skills is not valid.');
//       }
//     } catch (error) {
//       console.error("Error loading skills:", error);
//     }
//   }

//   // Initial load
//   loadSkills();
//open modal

cancelSkillsButton.addEventListener("click", () => {
  hideModal("edit-skill-modal");
});

addSkillButton.addEventListener("click", () => {
  // Reset the form when opening
  document.getElementById("skill-name").value = "";
  showModal("edit-skill-modal");
});

// Delete skills
function deleteSkill(id) {
  // Show delete confirmation toast
  showDeleteConfirmation("skill", async function () {
    showLoading();
    try {
      const docSnap = await getDoc(skillsCollection);

      if (!docSnap.exists()) {
        throw new Error("User profile not found");
      }

      const auditForm = docSnap.data().audit_fields;
      var currentDate = window.getCurrentDateTime();
      var auditData = {
        createdAt: auditForm.createdAt,
        createdBy: docSnap.data().about.email,
        updatedAt: currentDate,
        updatedBy: docSnap.data().about.email,
      };

      let skillList = docSnap.data().skills || [];
      skillList = skillList.filter((exp) => exp.id !== id);

      // Update Firestore
      await updateDoc(skillsCollection, {
        skills: skillList,
        audit_fields: auditData,
      });

      showStatusMessage("Skill deleted successfully", "success");
      loadSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
      showStatusMessage("Failed to delete skill: " + error.message, "danger");
    } finally {
      hideLoading();
    }
  });
}
window.deleteSkill = deleteSkill;

//load skills
async function loadSkills() {
  const docSnap = await getDoc(skillsCollection);
  // console.log(docSnap.data());
  if (docSnap.exists) {
    const userData = docSnap.data();
    const skillList = userData.skills || [];

    skillsContainer.innerHTML = "";

    skillList.forEach((sk) => {
      skillsContainer.innerHTML += `
          <div class="col">
    <div class="card position-relative">
  <div class="card-body">
    <h4 class="card-title">${sk.skillName}</h4>
    <!-- Close Button -->
    <button onclick="deleteSkill('${sk.id}')" type="button" class="btn-close position-absolute top-0 end-0" aria-label="Close"></button>
  </div>
</div>
  </div>
  

        `;
    });
  }
}

//add skill
editSkillForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Check if skill name is empty
  const skillNameInput = document.getElementById("skill-name").value.trim();
  if (!skillNameInput) {
    showStatusMessage("Please enter at least one skill", "warning");
    return;
  }

  showLoading(); // Show loading indicator

  try {
    let skillname = skillNameInput.split(",");
    skillname = skillname
      .map((skill) => skill.trim())
      .filter((skill) => skill !== "");

    // Additional validation - make sure we have at least one skill after filtering
    if (skillname.length === 0) {
      showStatusMessage("Please enter at least one valid skill", "warning");
      hideLoading();
      return;
    }

    const docSnap = await getDoc(skillsCollection);

    if (!docSnap.exists()) {
      throw new Error("User profile not found");
    }

    const userData = docSnap.data();
    let skillList = userData.skills || [];

    if (isEditSkillMode) {
      // Update existing entry
      skillList = skillList.map((sk) =>
        sk.id === editingSkillId ? { id: sk.id, skillName: skillname[0] } : sk
      );
    } else {
      // Add new entry
      if (skillname.length == 1) {
        const newSkills = {
          id: new Date().getTime().toString(),
          skillName: skillname[0],
        };
        skillList.push(newSkills);
      } else {
        for (let i = 0; i < skillname.length; i++) {
          const newSkills = {
            id: new Date().getTime().toString() + i,
            skillName: skillname[i],
          };
          skillList.push(newSkills);
        }
      }
    }

    // Remove duplicates by skill name (case insensitive)
    skillList = [
      ...new Map(
        skillList.map((skill) => [
          skill.skillName.toLowerCase(),
          { ...skill }, // Keep original case in the actual skillName
        ])
      ).values(),
    ];

    const auditForm = docSnap.data().audit_fields;
    var currentDate = window.getCurrentDateTime();

    var auditData = {
      createdAt: auditForm.createdAt,
      createdBy: docSnap.data().about.email,
      updatedAt: currentDate,
      updatedBy: docSnap.data().about.email,
    };

    // Update Firestore
    await updateDoc(skillsCollection, {
      skills: skillList,
      audit_fields: auditData,
    });

    // Reset form and UI state
    document.getElementById("skill-name").value = "";
    isEditSkillMode = false;
    editingSkillId = null;

    hideModal("edit-skill-modal");
    showStatusMessage("Skills saved successfully!", "success");
    loadSkills(); // Just reload the skills section
  } catch (error) {
    console.error("Error saving skills:", error);
    showStatusMessage("Failed to save skills: " + error.message, "danger");
  } finally {
    hideLoading();
  }
});

//Address Section
let presentAddress = {
  address: "",
  city: "",
  state: "",
  zip: "",
};
let permanentAddress = {
  address: "",
  city: "",
  state: "",
  zip: "",
};

let currentEditing = ""; // 'present' or 'permanent'

// Function to edit address
function openEditModal(addressType) {
  currentEditing = addressType;
  const addressData =
    addressType === "present" ? presentAddress : permanentAddress;
  // console.log(currentEditing);
  console.log(addressData);
  // Set the input fields with current data
  document.getElementById("address-input").value = addressData.address || "";
  document.getElementById("city-input").value = addressData.city || "";
  document.getElementById("state-input").value = addressData.state || "";
  document.getElementById("zip-input").value = addressData.zip || "";

  // Show the modal
  const editModal = new bootstrap.Modal(
    document.getElementById("edit-modal-address")
  );
  editModal.show();
}

// Close the modal-address
function closeEditModal() {
  const modalElement = document.getElementById("edit-modal-address");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  if (modalInstance) modalInstance.hide();
}

// Save edited address
function saveEditedAddress() {
  const addressInput = document.getElementById("address-input").value.trim();
  const cityInput = document.getElementById("city-input").value.trim();
  const stateInput = document.getElementById("state-input").value.trim();
  const zipInput = document.getElementById("zip-input").value.trim();

  // Enhanced validation
  if (!addressInput) {
    showStatusMessage("Please enter your address", "warning");
    return;
  }
  if (!cityInput) {
    showStatusMessage("Please enter your city", "warning");
    return;
  }
  if (!stateInput) {
    showStatusMessage("Please enter your state", "warning");
    return;
  }
  if (!zipInput) {
    showStatusMessage("Please enter your pin code", "warning");
    return;
  }

  // ZIP/PIN code validation - numeric and 5-6 digits
  if (!/^\d{5,6}$/.test(zipInput)) {
    showStatusMessage("Please enter a valid 5-6 digit PIN/ZIP code", "warning");
    return;
  }

  // Create address object
  const addressData = {
    address: addressInput,
    city: cityInput,
    state: stateInput,
    zip: zipInput,
  };

  if (currentEditing === "present") {
    presentAddress = addressData;
  } else if (currentEditing === "permanent") {
    permanentAddress = addressData;
  }

  // Update address display
  updateAddressDisplay(currentEditing);

  // Save to Firebase
  showLoading();
  saveAddresses()
    .then(() => {
      showStatusMessage(
        `${
          currentEditing.charAt(0).toUpperCase() + currentEditing.slice(1)
        } address updated successfully!`,
        "success"
      );
    })
    .catch((error) => {
      console.error("Failed to save address:", error);
      showStatusMessage("Failed to save address: " + error.message, "danger");
    })
    .finally(() => {
      hideLoading();
      closeEditModal();
    });
}

async function loadAddress() {
  try {
    const docSnapshot = await getDoc(skillsCollection);
    // console.log(docSnapshot.data());
    const userAddress = docSnapshot.data().address;
    // console.log(userAddress);
    // permanentAddressDatabase = userAddress.permanent;
    presentAddress = userAddress.present;
    permanentAddress = userAddress.permanent;
    document.getElementById(`present-address-text`).innerText =
      userAddress.present.address || "";
    document.getElementById(`present-city-text`).innerText =
      userAddress.present.city || "";
    document.getElementById(`present-state-text`).innerText =
      userAddress.present.state || "";
    document.getElementById(`present-zip-text`).innerText =
      userAddress.present.zip || "";
    document.getElementById(`permanent-address-text`).innerText =
      userAddress.permanent.address || "";
    document.getElementById(`permanent-city-text`).innerText =
      userAddress.permanent.city || "";
    document.getElementById(`permanent-state-text`).innerText =
      userAddress.permanent.state || "";
    document.getElementById(`permanent-zip-text`).innerText =
      userAddress.permanent.zip || "";
    // presentAddressDatabase = userAddress.present;
    // console.log(presentAddressDatabase)
  } catch (error) {
    console.log("error in loading the data");
  }
}
// Update address display dynamically
function updateAddressDisplay(addressType) {
  const addressData =
    addressType === "present" ? presentAddress : permanentAddress;
  // console.log(addressData);
  document.getElementById(`${addressType}-address-text`).innerText =
    addressData.address;
  document.getElementById(`${addressType}-city-text`).innerText =
    addressData.city;
  document.getElementById(`${addressType}-state-text`).innerText =
    addressData.state;
  document.getElementById(`${addressType}-zip-text`).innerText =
    addressData.zip;
}

function toggleCopyAddress() {
  const isChecked = document.getElementById("copy-address-checkbox").checked;
  if (isChecked) {
    permanentAddress = { ...presentAddress }; // Copy present to permanent
    // console.log(permanentAddress);
    updateAddressDisplay("permanent");
    saveAddresses();
  }
}

async function saveAddresses() {
  // Return a promise to allow promise chaining
  return new Promise(async (resolve, reject) => {
    const addressData = {
      present: presentAddress,
      permanent: permanentAddress,
    };

    try {
      // Fetch the existing document data
      const docSnapshot = await getDoc(skillsCollection);
      const auditForm = docSnapshot.data().audit_fields;
      var currentDate = window.getCurrentDateTime();

      var auditData = {
        createdAt: auditForm.createdAt,
        createdBy: docSnapshot.data().about.email,
        updatedAt: currentDate,
        updatedBy: docSnapshot.data().about.email,
      };

      if (docSnapshot.exists()) {
        // If the document exists, merge the new address data with existing data
        const existingData = docSnapshot.data();
        const updatedData = {
          ...existingData,
          address: addressData,
          audit_fields: auditData,
        };

        // Save the merged data back to Firestore
        await setDoc(skillsCollection, updatedData);
        resolve(); // Success
      } else {
        // If the document does not exist, create a new one with address data
        const newData = {
          address: addressData,
        };
        await setDoc(skillsCollection, newData);
        resolve(); // Success
      }
    } catch (error) {
      // Handle errors gracefully
      console.error("Error updating addresses: ", error);
      reject(error); // Forward error
    }
  });
}
window.closeEditModal = closeEditModal;
window.saveEditedAddress = saveEditedAddress;
window.toggleCopyAddress = toggleCopyAddress;
window.openEditModal = openEditModal;
window.saveAddresses = saveAddresses;

//education

// var data = {
//     about : {
//         name : "Ashish Narawariya",
//         dob : "02-02-2001"
//     },
//     social : {
//         github : "xyz.github.com"
//     },
//     address : {
//         address : "DD-Nagar"
//     },
// }

const userProfileRef = doc(db, "user_profile", email);
// console.log(userProfileRef);
const editButtonEducation = document.getElementById("edit-button-address");

const cancelButtonEducation = document.getElementById("cancel-button-address");

let isEditModeEducation = false;
let editingEducationId = null;

document.getElementById("addEducation").addEventListener("click", () => {
  isEditModeEducation = false;
  editingEducationId = null;
  // Reset form
  document.getElementById("edit-degree").value = "";
  document.getElementById("edit-institution").value = "";
  document.getElementById("edit-year").value = "";
  showModal("edit-modal-education");
});

// Close Modal
document
  .getElementById("cancel-button-education")
  .addEventListener("click", () => {
    hideModal("edit-modal-education");
  });

//load education
async function loadEducation() {
  const userProfileRef = doc(db, "user_profile", email);
  const docSnap = await getDoc(userProfileRef);
  // console.log(docSnap.data());
  if (docSnap.exists) {
    const userData = docSnap.data();
    const educationList = userData.education || [];

    const educationContainer = document.getElementById("education-list");
    educationContainer.innerHTML = "";

    educationList.forEach((edu) => {
      educationContainer.innerHTML += `
          

      
  <div class="card">
    <div class="card-body">
      <!-- Heading -->
      <h1 class="card-title fs-3 text-primary">${edu.degree}</h1>
      <!-- Description -->
      <p class="card-text text-muted">
        ${edu.institution} (${edu.year})
      </p>
      <!-- Buttons -->
      <div class="d-flex justify-content-start gap-3 mt-4">
        <button onclick="editEducation('${edu.id}', '${edu.degree}', '${edu.institution}', '${edu.year}')" class="btn btn-primary">Edit</button>
        <button onclick="deleteEducation('${edu.id}')" class="btn btn-secondary">Delete</button>
      </div>
    </div>
  </div>


        `;
    });
  }
}

//add education
document
  .getElementById("edit-form-education")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const degree = document.getElementById("edit-degree").value.trim();
    const institution = document
      .getElementById("edit-institution")
      .value.trim();
    const year = document.getElementById("edit-year").value.trim();

    // Form validation
    if (!degree) {
      showStatusMessage("Please enter your degree", "warning");
      return;
    }
    if (!institution) {
      showStatusMessage("Please enter your institution", "warning");
      return;
    }
    if (!year) {
      showStatusMessage("Please enter graduation year", "warning");
      return;
    }

    // Validate year format (numeric, 4 digits)
    if (!/^\d{4}$/.test(year)) {
      showStatusMessage("Please enter a valid 4-digit year", "warning");
      return;
    }

    showLoading(); // Show loading indicator

    try {
      const userProfileRef = doc(db, "user_profile", email);
      const docSnap = await getDoc(userProfileRef);

      if (!docSnap.exists()) {
        throw new Error("User profile not found");
      }

      const auditForm = docSnap.data().audit_fields;
      var currentDate = window.getCurrentDateTime();

      var auditData = {
        createdAt: auditForm.createdAt,
        createdBy: docSnap.data().about.email,
        updatedAt: currentDate,
        updatedBy: docSnap.data().about.email,
      };

      const userData = docSnap.data();
      let educationList = userData.education || [];

      if (isEditModeEducation) {
        // Update existing entry
        educationList = educationList.map((edu) =>
          edu.id === editingEducationId
            ? { id: edu.id, degree, institution, year }
            : edu
        );
      } else {
        // Add new entry
        const newEducation = {
          id: new Date().getTime().toString(),
          degree,
          institution,
          year,
        };
        educationList.push(newEducation);
      }

      // Update Firestore
      await updateDoc(userProfileRef, {
        education: educationList,
        audit_fields: auditData,
      });

      // Reset form and UI state
      document.getElementById("edit-degree").value = "";
      document.getElementById("edit-institution").value = "";
      document.getElementById("edit-year").value = "";
      isEditModeEducation = false;
      editingEducationId = null;

      // Success feedback
      showStatusMessage("Education details saved successfully!", "success");
      hideModal("edit-modal-education");
      loadEducation(); // Just reload the education section
    } catch (error) {
      console.error("Error saving education:", error);
      showStatusMessage("Failed to save education: " + error.message, "danger");
    } finally {
      hideLoading();
    }
  });

// Delete Education
function deleteEducation(id) {
  // Show delete confirmation toast
  showDeleteConfirmation("education entry", async function () {
    showLoading();
    try {
      const docSnap = await getDoc(userProfileRef);

      if (!docSnap.exists()) {
        throw new Error("User profile not found");
      }

      const auditForm = docSnap.data().audit_fields;
      var currentDate = window.getCurrentDateTime();
      var auditData = {
        createdAt: auditForm.createdAt,
        createdBy: docSnap.data().about.email,
        updatedAt: currentDate,
        updatedBy: docSnap.data().about.email,
      };

      let educationList = docSnap.data().education || [];
      educationList = educationList.filter((edu) => edu.id !== id);

      // Update Firestore
      await updateDoc(userProfileRef, {
        education: educationList,
        audit_fields: auditData,
      });

      showStatusMessage("Education entry deleted successfully", "success");
      loadEducation();
    } catch (error) {
      console.error("Error deleting education entry:", error);
      showStatusMessage(
        "Failed to delete education entry: " + error.message,
        "danger"
      );
    } finally {
      hideLoading();
    }
  });
}
window.deleteEducation = deleteEducation;

function editEducation(id, degree, institution, year) {
  isEditModeEducation = true;
  editingEducationId = id;

  document.getElementById("edit-degree").value = degree;
  document.getElementById("edit-institution").value = institution;
  document.getElementById("edit-year").value = year;
  // console.log(document.getElementById("edit-degree").value);
  document.getElementById("edit-modal-education").classList.remove("d-none");
}
window.editEducation = editEducation;
// Initial Load
loadEducation();

//experience
const editButtonExperience = document.getElementById("edit-button-experience");

const cancelButtonExperience = document.getElementById(
  "cancel-button-experience"
);
let isEditModeExperience = false;
let editingExperienceId = null;

document.getElementById("addExperience").addEventListener("click", () => {
  isEditModeExperience = false;
  editingExperienceId = null;
  // Reset form fields
  document.getElementById("job-title").value = "";
  document.getElementById("company-name").value = "";
  document.getElementById("start-date").value = "";
  document.getElementById("end-date").value = "";
  document.getElementById("job-description").value = "";
  showModal("edit-modal-experience");
});

// Close Modal
document
  .getElementById("cancel-button-experience")
  .addEventListener("click", () => {
    hideModal("edit-modal-experience");
  });

async function loadExperience() {
  const docSnap = await getDoc(userProfileRef);
  // console.log(docSnap.data());
  if (docSnap.exists) {
    const userData = docSnap.data();
    const experienceList = userData.experience || [];

    const educationContainer = document.getElementById("experience-list");
    educationContainer.innerHTML = "";

    experienceList.forEach((exp) => {
      educationContainer.innerHTML += `
<div class="card-body">
      <!-- Job Title -->
      <h3 class="card-title text-muted">Company Name : ${exp.companyName}</h3>
      <!-- Company Name -->
      <h4 class="card-subtitle mb-3 text-muted">Job-Title : ${exp.jobTitle}</h4>
      <!-- Start Date -->
      <h5 class="mb-2 text-muted">Start Date: ${exp.startDate}</h5>
      <!-- End Date -->
      <h5 class="mb-4 text-muted">End Date: ${exp.endDate}</h5>
      <!-- Job Description -->
      <p class="card-text">
        ${exp.jobDescription}
      </p>
      <!-- Action Buttons -->
      <div class="d-flex justify-content-between">
        <button onclick="editExperience('${exp.id}', '${exp.jobTitle}', '${exp.companyName}', '${exp.startDate}' , '${exp.endDate}' , '${exp.jobDescription}')"  class="btn btn-primary">Edit</button>
        <button onclick="deleteExperience('${exp.id}')"  class="btn btn-danger">Delete</button>
      </div>
    </div>
  </div>
        `;
    });
  }
}

//add experience
document
  .getElementById("edit-form-experience")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const jobTitle = document.getElementById("job-title").value.trim();
    const companyName = document.getElementById("company-name").value.trim();
    const startDate = document.getElementById("start-date").value.trim();
    const endDate = document.getElementById("end-date").value.trim();
    const jobDescription = document
      .getElementById("job-description")
      .value.trim();

    // Validation
    if (!jobTitle) {
      showStatusMessage("Please enter job title", "warning");
      return;
    }
    if (!companyName) {
      showStatusMessage("Please enter company name", "warning");
      return;
    }
    if (!startDate) {
      showStatusMessage("Please enter start date", "warning");
      return;
    }
    if (!jobDescription) {
      showStatusMessage("Please enter job description", "warning");
      return;
    }

    showLoading(); // Show loading indicator

    try {
      const docSnap = await getDoc(userProfileRef);
      const auditForm = docSnap.data().audit_fields;
      var currentDate = window.getCurrentDateTime();

      var auditData = {
        createdAt: auditForm.createdAt,
        createdBy: docSnap.data().about.email,
        updatedAt: currentDate,
        updatedBy: docSnap.data().about.email,
      };

      if (docSnap.exists) {
        const userData = docSnap.data();
        let experienceList = userData.experience || [];

        if (isEditModeExperience) {
          // Update existing entry
          experienceList = experienceList.map((exp) =>
            exp.id === editingExperienceId
              ? {
                  id: exp.id,
                  jobTitle,
                  companyName,
                  startDate,
                  endDate,
                  jobDescription,
                }
              : exp
          );
        } else {
          // Add new entry
          const newExperience = {
            id: new Date().getTime().toString(),
            jobTitle,
            companyName,
            startDate,
            endDate,
            jobDescription,
          };
          experienceList.push(newExperience);
        }

        // Update Firestore
        await updateDoc(userProfileRef, {
          experience: experienceList,
          audit_fields: auditData,
        });

        hideModal("edit-modal-experience");
        showStatusMessage("Experience saved successfully!", "success");
        loadExperience(); // Reload just the experience section
      }
    } catch (error) {
      console.error("Error saving experience:", error);
      showStatusMessage("Failed to save experience", "danger");
    } finally {
      hideLoading();
    }
  });

// Delete Experience
function deleteExperience(id) {
  // Show delete confirmation toast
  showDeleteConfirmation("experience entry", async function () {
    showLoading();
    try {
      const docSnap = await getDoc(userProfileRef);

      if (!docSnap.exists()) {
        throw new Error("User profile not found");
      }

      const auditForm = docSnap.data().audit_fields;
      var currentDate = window.getCurrentDateTime();
      var auditData = {
        createdAt: auditForm.createdAt,
        createdBy: docSnap.data().about.email,
        updatedAt: currentDate,
        updatedBy: docSnap.data().about.email,
      };

      let experienceList = docSnap.data().experience || [];
      experienceList = experienceList.filter((exp) => exp.id !== id);

      // Update Firestore
      await updateDoc(userProfileRef, {
        experience: experienceList,
        audit_fields: auditData,
      });

      showStatusMessage("Experience entry deleted successfully", "success");
      loadExperience();
    } catch (error) {
      console.error("Error deleting experience entry:", error);
      showStatusMessage(
        "Failed to delete experience entry: " + error.message,
        "danger"
      );
    } finally {
      hideLoading();
    }
  });
}
window.deleteExperience = deleteExperience;

function editExperience(
  id,
  jobTitle,
  companyName,
  startDate,
  endDate,
  jobDescription
) {
  isEditModeExperience = true;
  editingExperienceId = id;
  // console.log('edit');

  document.getElementById("job-title").value = jobTitle;
  document.getElementById("company-name").value = companyName;
  document.getElementById("start-date").value = startDate;
  document.getElementById("end-date").value = endDate;
  document.getElementById("job-description").value = jobDescription;
  // console.log(jobDescription);

  document.getElementById("edit-modal-experience").classList.remove("d-none");
}
window.editExperience = editExperience;
// Initial Load
loadExperience();

// Confirmation dialog with toast
function showDeleteConfirmation(itemName, deleteFunction) {
  const existingAlerts = document.querySelectorAll(".deletion-confirm");
  existingAlerts.forEach((alert) => alert.remove());

  // Create container
  const confirmContainer = document.createElement("div");
  confirmContainer.className = "toast deletion-confirm show";
  confirmContainer.style.position = "fixed";
  confirmContainer.style.top = "50%";
  confirmContainer.style.left = "50%";
  confirmContainer.style.transform = "translate(-50%, -50%)";
  confirmContainer.style.zIndex = "10000";
  confirmContainer.style.minWidth = "300px";
  confirmContainer.style.backgroundColor = "white";
  confirmContainer.style.boxShadow = "0 0.5rem 1rem rgba(0, 0, 0, 0.15)";
  confirmContainer.style.border = "none";
  confirmContainer.style.borderRadius = "0.25rem";

  // Create header
  const header = document.createElement("div");
  header.className = "toast-header bg-danger text-white";
  header.style.borderTopLeftRadius = "0.25rem";
  header.style.borderTopRightRadius = "0.25rem";
  header.style.padding = "0.75rem 1rem";

  const icon = document.createElement("i");
  icon.className = "fas fa-exclamation-triangle me-2";

  const title = document.createElement("strong");
  title.className = "me-auto";
  title.textContent = "Confirm Deletion";

  header.appendChild(icon);
  header.appendChild(title);

  // Create body
  const body = document.createElement("div");
  body.className = "toast-body py-3";
  body.style.textAlign = "center";
  body.innerHTML = `Are you sure you want to delete this ${itemName}?`;

  // Create buttons container
  const btnContainer = document.createElement("div");
  btnContainer.className = "d-flex justify-content-end gap-2 p-3 pt-0";

  // Cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.className = "btn btn-secondary btn-sm";
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = function () {
    confirmContainer.remove();

    // Show cancel message
    showStatusMessage(`${itemName} deletion cancelled`, "info");
  };

  // Confirm button
  const confirmBtn = document.createElement("button");
  confirmBtn.className = "btn btn-danger btn-sm";
  confirmBtn.textContent = "Delete";
  confirmBtn.onclick = function () {
    confirmContainer.remove();
    deleteFunction(); // Call the actual delete function
  };

  // Add overlay behind the confirmation
  const overlay = document.createElement("div");
  overlay.className = "modal-backdrop fade show";
  overlay.style.zIndex = "9999";
  overlay.onclick = function () {
    confirmContainer.remove();
    overlay.remove();
  };

  // Assemble confirmation dialog
  btnContainer.appendChild(cancelBtn);
  btnContainer.appendChild(confirmBtn);
  confirmContainer.appendChild(header);
  confirmContainer.appendChild(body);
  confirmContainer.appendChild(btnContainer);

  // Add to DOM
  document.body.appendChild(overlay);
  document.body.appendChild(confirmContainer);
}
