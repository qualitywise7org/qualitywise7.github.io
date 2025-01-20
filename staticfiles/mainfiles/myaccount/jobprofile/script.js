var presentAddressDatabase = {};

const email = localStorage.getItem("email");
// console.log(email);
var userData = {};

if (!email) {
  window.location.href = "/login/";
}
async function isUser() {
  // console.log("isUser");

  const docRef = doc(db, "user_profile", email);
  try {
    const docSnap = await getDoc(docRef);
    //   console.log(docSnap);
    if (docSnap.exists()) {
      userData = docSnap.data();
      populateImage(userData.about.image);
    }
    // else {
    //   await fetchFromLeadCollection();
    // }
  } catch (error) {
    console.error("Error getting user data from user_profile:", error);
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
    document.getElementById("github").href = userData.social.github || "#";
    document.getElementById("leetcode").href = userData.social.leetcode || "#";
    document.getElementById("linkedin").href = userData.social.linkedin || "#";
    document.getElementById("instagram").href =
      userData.social.instagram || "#";
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

isUser();



// Get references to the button and the form
const editButton = document.getElementById("edit-social-button");
const editForm = document.getElementById("edit-form-social");
const cancelButton = document.getElementById("cancel-button-social");

// Show the edit form when the edit button is clicked
editButton.addEventListener("click", () => {
  editForm.classList.remove("d-none"); // Show the form overlay
});

// Hide the edit form when the cancel button is clicked
cancelButton.addEventListener("click", () => {
  editForm.classList.add("d-none"); // Hide the form overlay
});

async function saveFormDataToDatabase(event) {
  event.preventDefault(); // Prevent default form submission behavior
  console.log("Saving social links to database...");

  // Collect social links data from the form
  var socialData = {
    github: $("#edit-github").val() || "",
    linkedin: $("#edit-linkedin").val() || "",
    leetcode: $("#edit-leetcode").val() || "",
    instagram: $("#edit-instagram").val() || "",
  };

  // Log the social links for debugging
  // console.log("Collected Social Data:", socialData);

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
      };

      // Save the merged data back to Firestore
      await setDoc(userProfileRef, updatedData);
      // console.log("Social links successfully updated!");
    } else {
      // If the document does not exist, create a new one with only social links
      const newData = {
        social: socialData,
      };
      await setDoc(userProfileRef, newData);
      // console.log("New profile created with social links!");
    }

    // Reload the page after saving
    window.location.reload();
  } catch (error) {
    // Handle errors gracefully
    console.error("Error updating social links: ", error);
  }
}

// Attach event listener to the save button
document
  .getElementById("save-button-social")
  .addEventListener("click", saveFormDataToDatabase);

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
  document.getElementById("edit-skill-modal").classList.add("d-none");
});

addSkillButton.addEventListener("click", () => {
  document.getElementById("edit-skill-modal").classList.remove("d-none");
});

// Delete skills
async function deleteSkill(id) {
  // console.log("delete")
  const docSnap = await getDoc(skillsCollection);
  // console.log(docSnap.data());
  const auditForm = docSnap.data().audit_fields;
  
  var currentDate = window.getCurrentDateTime();
  if (docSnap.exists) {
    var auditData = {
      createdAt: auditForm.createdAt,
      createdBy: docSnap.data().about.email,
      updatedAt: currentDate,
      updatedBy: docSnap.data().about.email,
    };
    let skillList = docSnap.data().skills || [];
    skillList = skillList.filter((exp) => exp.id !== id);

    // Update Firestore
    //   await userDocRef.update({ experience: skillList });
    await updateDoc(skillsCollection, {
      skills: skillList,
      audit_fields: auditData,
    });
    loadSkills();
  }
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
  // console.log("clikc");

  const skillname = document.getElementById("skill-name").value.split(",");
  // console.log(skillName.length);

  //    console.log(skillName);
  const docSnap = await getDoc(skillsCollection);

  if (docSnap.exists) {
    const userData = docSnap.data();
    let skillList = userData.skills || [];

    if (isEditSkillMode) {
      // Update existing entry
      skillList = skillList.map((sk) =>
        sk.id === editingSkillId ? { id: sk.id, skillName } : sk
      );
    } else {
      // Add new entry
      if (skillname.length == 1) {
        // console.log("one");
        const newSkills = {
          id: new Date().getTime().toString(),
          skillName: skillname,
        };
        skillList.push(newSkills);
      } else {
        let skillsArray = {};
        for (let i = 0; i < skillname.length; i++) {
          const newSkills = {
            id: new Date().getTime().toString() + i,
            skillName: skillname[i],
          };
          // skillsArray[i] = newSkills;
          skillList.push(newSkills);
        }
        // console.log(skillList);
      }
    }
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
    window.location.reload();
    //   console.log("skills success");
    loadSkills();
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
  const addressData = {
    address: document.getElementById("address-input").value,
    city: document.getElementById("city-input").value,
    state: document.getElementById("state-input").value,
    zip: document.getElementById("zip-input").value,
  };

  if (currentEditing === "present") {
    presentAddress = addressData;
  } else if (currentEditing === "permanent") {
    permanentAddress = addressData;
  }

  // Update address display
  updateAddressDisplay(currentEditing);

  // Save to Firebase (optional)
  saveAddresses();

  // Close the modal
  closeEditModal();
}

async function loadAddress() {
  try {
    const docSnapshot = await getDoc(skillsCollection);
    // console.log(docSnapshot.data());
    const userAddress = docSnapshot.data().address;
    // console.log(userAddress);
    // permanentAddressDatabase = userAddress.permanent;
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
  // console.log(docSnap.data());
  // db.ref('addresses').set({
  //   present: presentAddress,
  //   permanent: permanentAddress
  // })
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
      // If the document exists, merge the new social links with existing data
      const existingData = docSnapshot.data();
      // console.log(existingData);
      const updatedData = {
        ...existingData,
        address: addressData, // Update only the "social" field
        audit_fields: auditData,
      };
      // console.log(updatedData)

      // Save the merged data back to Firestore
      await setDoc(skillsCollection, updatedData);
      // console.log("Social links successfully updated!");
    } else {
      // If the document does not exist, create a new one with only social links
      const newData = {
        address: addressData,
      };
      await setDoc(skillsCollection, newData);
      // console.log("New profile created with social links!");
    }

    // Reload the page after saving
    // window.location.reload();
  } catch (error) {
    // Handle errors gracefully
    console.error("Error updating social links: ", error);
  }
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
  document.getElementById("edit-modal-education").classList.remove("d-none");
});

// Close Modal
document
  .getElementById("cancel-button-education")
  .addEventListener("click", () => {
    document.getElementById("edit-modal-education").classList.add("d-none");
  });

//load education
async function loadEducation() {
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
    // console.log("clikc");

    const degree = document.getElementById("edit-degree").value.trim();
    const institution = document
      .getElementById("edit-institution")
      .value.trim();
    const year = document.getElementById("edit-year").value.trim();
    //    console.log(degree);
    const docSnap = await getDoc(userProfileRef);
    // console.log(docSnap.data());
    //     const docRef = doc(db, "user_profile", email);
    //
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
      window.location.reload();
      //   console.log("education success");
      loadEducation();
    }
  });

// Delete Education
async function deleteEducation(id) {
  // console.log("delete")
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
    let educationList = docSnap.data().education || [];
    educationList = educationList.filter((edu) => edu.id !== id);

    // Update Firestore
    //   await userDocRef.update({ education: educationList });
    await updateDoc(userProfileRef, {
      education: educationList,
      audit_fields: auditData,
    });
    loadEducation();
  }
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
  document.getElementById("edit-modal-experience").classList.remove("d-none");
});

// Close Modal
document
  .getElementById("cancel-button-experience")
  .addEventListener("click", () => {
    document.getElementById("edit-modal-experience").classList.add("d-none");
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
    // console.log("clikc");

    const jobTitle = document.getElementById("job-title").value.trim();
    const companyName = document.getElementById("company-name").value.trim();
    const startDate = document.getElementById("start-date").value.trim();
    const endDate = document.getElementById("end-date").value.trim();
    const jobDescription = document
      .getElementById("job-description")
      .value.trim();
    //    console.log(jobTitle);
    const docSnap = await getDoc(userProfileRef);
    // console.log(docSnap.data());
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
        // console.log('isedit true');
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
        // console.log('isedit not true');
        const newEperience = {
          id: new Date().getTime().toString(),
          jobTitle,
          companyName,
          startDate,
          endDate,
          jobDescription,
        };
        experienceList.push(newEperience);
      }

      // Update Firestore
      await updateDoc(userProfileRef, {
        experience: experienceList,
        audit_fields: auditData,
      });
      window.location.reload();
      //   console.log("education success");
      loadExperience();
    }
  });

// Delete Experience
async function deleteExperience(id) {
  // console.log("delete")
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
    let experienceList = docSnap.data().experience || [];
    experienceList = experienceList.filter((exp) => exp.id !== id);

    // Update Firestore
    //   await userDocRef.update({ experience: experienceList });
    await updateDoc(userProfileRef, { experience: experienceList , audit_fields : auditData});
    loadExperience();
  }
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
