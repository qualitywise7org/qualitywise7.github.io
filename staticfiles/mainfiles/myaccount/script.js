// // Get the authenticated user's ID
// let auditField = {
//   createdAt : "",
//   updateAt : "",
//   createdBy : "",
//   updatedBy : ""
// }
// let userId = null;
// let userData = {};

// onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     userId = user.uid;

//     try {
//       const userDocRef = await doc(db, "users", userId);
//       const userDocSnapshot = await getDoc(userDocRef);

//       if (userDocSnapshot.exists()) {
//         userData = userDocSnapshot.data();
//         var userJSON = JSON.stringify(userData);
//         console.log(userData);
//         localStorage.setItem("userDetails", userJSON);
//         const userName1 = document.getElementById("userName1");
//         userName1.innerText = userData.full_name;
//         await fetchAndUseNames();
//         if (userData.firstLogin) {
//           let myModal = new bootstrap.Modal(
//             document.getElementById("myModal1")
//           );
//           myModal.show();
//           await updateDoc(userDocRef, { firstLogin: false });
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching user details:", error);
//     }
//   } else {
//     window.location.href = "/login/";
//   }
// });

// // Function to populate user details
// function populateUserDetails(
//   twelfthDetails,
//   diplomaDetails,
//   graduationDetails,
//   pgDetails,
//   categoryDetails
// ) {
//   const fullNameElement = document.getElementById("fullName");
//   const emailElement = document.getElementById("email");
//   const twelfthDetailsElement = document.getElementById("twelfthDetails");
//   const diplomaDetailsElement = document.getElementById("diplomaDetails");
//   const graduationDetailsElement = document.getElementById("graduationDetails");
//   const pgDetailsElement = document.getElementById("pgDetails");
//   const categoryElement = document.getElementById("category");
//   const dobElement = document.getElementById("dob");

//   // Populate personal information
//   // fullNameElement.textContent = userData.full_name || "";
//   // emailElement.textContent = userData.email || "";

//   // Populate education details
//   twelfthDetailsElement.textContent = twelfthDetails ? twelfthDetails : " ";
//   diplomaDetailsElement.textContent = diplomaDetails ? diplomaDetails : " ";
//   graduationDetailsElement.textContent = graduationDetails
//     ? graduationDetails
//     : " ";
//   pgDetailsElement.textContent = pgDetails ? pgDetails : " ";

//   // Populate additional information
//   categoryElement.textContent = categoryDetails;
//   dobElement.textContent = userData.dob || "";
// }

// // Function to get the name from collection based on code
// function getNameFromCollection(collection, code) {
//   const foundItem = collection.find((item) => item.code === code);
//   return foundItem ? foundItem.name : "";
// }

// async function fetchAndUseNames() {
//   const twelfthSubjectCode = userData.twelfthSubject || "";
//   const diplomaStreamCode = userData.diplomaStream || "";
//   const diplomaNameCode = userData.diplomaName || "";
//   const graduationStreamCode = userData.graduationStream || "";
//   const graduationDegreeCode = userData.graduationDegree || "";
//   const pgStreamCode = userData.pgStream || "";
//   const pgDegreeCode = userData.pgDegree || "";
//   const categoryCode = userData.category || "";

//   const twelfthSubjectName = await getNameFromCollection(
//     subject_masterdata,
//     twelfthSubjectCode
//   );
//   const diplomaStreamName = await getNameFromCollection(
//     stream_masterdata,
//     diplomaStreamCode
//   );
//   const diplomaName = await getNameFromCollection(
//     qualification_masterdata,
//     diplomaNameCode
//   );
//   const graduationStreamName = await getNameFromCollection(
//     stream_masterdata,
//     graduationStreamCode
//   );
//   const graduationDegreeName = await getNameFromCollection(
//     qualification_masterdata,
//     graduationDegreeCode
//   );
//   const pgStreamName = await getNameFromCollection(
//     stream_masterdata,
//     pgStreamCode
//   );
//   const pgDegreeName = await getNameFromCollection(
//     qualification_masterdata,
//     pgDegreeCode
//   );
//   const categoryName = await getNameFromCollection(
//     category_masterdata,
//     categoryCode
//   );

//   // Hide the loading element
//   // const loadingElement = document.getElementById("overlay");
//   // loadingElement.style.display = "none";

//   const twelfthDetails = `${twelfthSubjectName || ""} - ${
//     userData.twelfthPercentage || ""
//   }`;
//   const diplomaDetails = `${diplomaStreamName || ""} - ${diplomaName || ""}`;
//   const graduationDetails = `${graduationStreamName || ""} - ${
//     graduationDegreeName || ""
//   } - ${userData.graduationPercentage || ""}`;
//   const pgDetails = `${pgStreamName || ""} - ${pgDegreeName || ""} - ${
//     userData.pgPercentage || ""
//   }`;
//   const categoryDetails = `${categoryName || ""}`;

//   populateUserDetails(
//     twelfthDetails,
//     diplomaDetails,
//     graduationDetails,
//     pgDetails,
//     categoryDetails
//   );
// }

// // JavaScript to trigger the modal and populate form fields
// document
//   .getElementById("openModalButton")
//   .addEventListener("click", async () => {
//     document.getElementById("twelfthSubject").value =
//       userData.twelfthSubject || "";
//     document.getElementById("twelfthPercentage").value =
//       userData.twelfthPercentage || "";
//     document.getElementById("diplomaStream").value =
//       userData.diplomaStream || "";
//     document.getElementById("diplomaName").value = userData.diplomaName || "";
//     document.getElementById("graduationStream").value =
//       userData.graduationStream || "";
//     document.getElementById("graduationDegree").value =
//       userData.graduationDegree || "";
//     document.getElementById("graduationPercentage").value =
//       userData.graduationPercentage || "";
//     document.getElementById("pgStream").value = userData.pgStream || "";
//     document.getElementById("pgDegree").value = userData.pgDegree || "";
//     document.getElementById("pgPercentage").value = userData.pgPercentage || "";
//     document.getElementById("categories").value = userData.category || "";
//     document.getElementById("user-dob").value = userData.dob || "";

//     let myModal = new bootstrap.Modal(document.getElementById("myModal1"));
//     myModal.show();
//   });

// async function populateSelectOptions(collection, selectElement) {
//   try {
//     selectElement.innerHTML = `<option value="" selected >Select</option>`;

//     collection?.forEach((elem) => {
//       selectElement.innerHTML += `<option value="${elem.code}">${elem.name}</option>`;
//     });
//   } catch (error) {
//     console.error(`Error fetching options:`, error);
//   }
// }

// // Populate options on page load
// window.addEventListener("DOMContentLoaded", () => {
//   populateSelectOptions(
//     subject_masterdata,
//     document.getElementById("twelfthSubject")
//   );
//   populateSelectOptions(
//     stream_masterdata,
//     document.getElementById("diplomaStream")
//   );
//   populateSelectOptions(
//     stream_masterdata,
//     document.getElementById("graduationStream")
//   );
//   populateSelectOptions(stream_masterdata, document.getElementById("pgStream"));
//   populateSelectOptions(
//     category_masterdata,
//     document.getElementById("categories")
//   );
//   // populateDegreeOptions("diplomaName", "diploma");
//   populateDiplomaOptions("diplomaName");
//   populateDegreeOptions("graduationDegree", "graduation");
//   populateDegreeOptions("pgDegree", "post_graduation");
// });

// async function populateDiplomaOptions(degreeSelectId) {
//   const degreeSelect = document.getElementById(degreeSelectId);

//   try {
//     degreeSelect.innerHTML = `<option value="" selected >Select</option>`;

//     diplomaname_masterdata?.forEach((elem) => {
//       degreeSelect.innerHTML += `<option value="${elem.code}">${elem.name}</option>`;
//     });
//   } catch (error) {
//     console.error(`Error fetching degree options:`, error);
//   }
// }

// async function populateDegreeOptions(degreeSelectId, level) {
//   const degreeSelect = document.getElementById(degreeSelectId);

//   try {
//     degreeSelect.innerHTML = `<option value="" selected >Select</option>`;

//     qualification_masterdata?.forEach((elem) => {
//       if (elem.level === level) {
//         degreeSelect.innerHTML += `<option value="${elem.code}">${elem.name}</option>`;
//       }
//     });
//   } catch (error) {
//     console.error(`Error fetching degree options:`, error);
//   }
// }

// // Handle the form submission
// const saveButton = document.getElementById("saveDetails");
// saveButton.addEventListener("click", async () => {
//   const twelfthSubject = document.getElementById("twelfthSubject").value;
//   const twelfthPercentage = document.getElementById("twelfthPercentage").value;
//   const diplomaStream = document.getElementById("diplomaStream").value;
//   const diplomaName = document.getElementById("diplomaName").value;
//   const graduationStream = document.getElementById("graduationStream").value;
//   const graduationDegree = document.getElementById("graduationDegree").value;
//   const graduationPercentage = document.getElementById(
//     "graduationPercentage"
//   ).value;
//   const pgStream = document.getElementById("pgStream").value;
//   const pgDegree = document.getElementById("pgDegree").value;
//   const pgPercentage = document.getElementById("pgPercentage").value;
//   const category = document.getElementById("categories").value;
//   const dob = document.getElementById("user-dob").value;

//   // Check if any changes have been made
//   if (
//     twelfthSubject !== userData.twelfthSubject ||
//     twelfthPercentage !== userData.twelfthPercentage ||
//     diplomaStream !== userData.diplomaStream ||
//     diplomaName !== userData.diplomaName ||
//     graduationStream !== userData.graduationStream ||
//     graduationDegree !== userData.graduationDegree ||
//     graduationPercentage !== userData.graduationPercentage ||
//     pgStream !== userData.pgStream ||
//     pgDegree !== userData.pgDegree ||
//     pgPercentage !== userData.pgPercentage ||
//     category !== userData.category ||
//     dob !== userData.dob
//   ) {
//     try {
//       await updateUserData(userId, {
//         twelfthSubject,
//         twelfthPercentage,
//         diplomaStream,
//         diplomaName,
//         graduationStream,
//         graduationDegree,
//         graduationPercentage,
//         pgStream,
//         pgDegree,
//         pgPercentage,
//         category,
//         dob,
//       });

//       let myModal = new bootstrap.Modal(document.getElementById("myModal1"));
//       myModal.hide();
//       window.location.reload();
//       console.log("Data saved successfully.");
//     } catch (error) {
//       console.log(error);
//       alert("Error saving data:", error);
//     }
//   }
// });

// // Function to update user data in Firestore
// async function updateUserData(userId, data) {
//   const userRef = doc(db, "users", userId);

//   const updatedData = {};

//   for (const [key, value] of Object.entries(data)) {
//     if (value !== undefined && value !== null) {
//       updatedData[key] = value;
//     }
//   }

//   try {
//     await updateDoc(userRef, updatedData);
//     console.log("Data saved successfully.");
//   } catch (error) {
//     console.error("Error saving data:", error);
//   }
// }

const email = localStorage.getItem("email");
const username = localStorage.getItem("username");
const phonenumber = localStorage.getItem("phonenumber");
// console.log(email);
// console.log(username);
let totalUserAssessment;
let uniqueItems;
let totalAssessments;

// Initialize progress data with default values or load from localStorage
const profile1Percent = localStorage.getItem("profile1Percent") || 35;
const profile2Percent = localStorage.getItem("profile2Percent") || 25;
const profile3Percent = localStorage.getItem("profile3Percent") || 50;

// Store in localStorage for persistence across page refreshes
localStorage.setItem("profile1Percent", profile1Percent);
localStorage.setItem("profile2Percent", profile2Percent);
localStorage.setItem("profile3Percent", profile3Percent);

// var currdate = window.getCurrentDateTime();
// console.log(currdate);
// Function to fetch all user profiles

// ✅ Example Usage

async function updateAuditFields() {
  try {
    var currentDate = window.getCurrentDateTime();
    const querySnapshot = await getDocs(collection(db, "user_profile")); // Fetch all users

    for (const userDoc of querySnapshot.docs) {
      const userRef = doc(db, "user_profile", userDoc.id);
      const docSnap = await getDoc(userRef);
      // const dat = convertToISOAndAdjustTime("January 31, 2025 at 07:27:41 PM UTC")
      // console.log(dat);
      // Audit fields
      if (!docSnap.data().audit_fields) {
        // console.log(docSnap.data());
        const updatedData = {
          createdAt: currentDate,
          createdBy: docSnap.data().about.email,
          updatedAt: "",
          updatedBy: "",
        };
        // console.log(updatedData);

        // Update the document
        // await updateDoc(userRef, {
        //   audit_fields: updatedData,
        // });

        // console.log(`Updated user: ${userDoc.id}`);
      }

      // console.log("✅ All user profiles updated successfully.");
    }
  } catch (error) {
    // console.error("❌ Error updating user profiles:", error);
  }
}

// updateAuditFields();

function loopingForUserdataabout(data, count, n) {
  // console.log(data);

  if (!data || Object.keys(data).length === 0) {
    return 0; // If the data is empty or undefined, return 0%
  }

  for (const key in data) {
    // console.log(data[key]);
    if (data[key] !== "" && data[key] !== undefined) {
      count++;
    }
  }

  const percent = Math.floor((count / n) * 100); // Calculate percentage
  // console.log(percent);
  return percent;
}

function loopingForUserdata(data, count, n) {
  // console.log(data);

  if (!data || Object.keys(data).length === 0) {
    return 0; // If the data is empty or undefined, return 0%
  }

  for (const key in data) {
    // console.log(data[key]);
    if (data[key] !== "" && data[key] !== undefined) {
      count++;
    }
  }

  const percent = Math.floor((count / n) * 100); // Calculate percentage
  // console.log(percent);
  return percent;
}

function showProgress(progressId, textId, percent) {
  // console.log(`Updating progress for ID ${progressId} to ${percent}%`);

  // Update the progress bar width directly
  const progressBar = document.getElementById(`progress-${progressId}`);
  if (progressBar) {
    // console.log(`Found progress bar element: ${progressBar.id}`);
    progressBar.style.width = `${percent}%`;
  } else {
    // console.log(
    //   `Progress bar element with ID progress-${progressId} not found`
    // );
  }
  // Update the text percentage  const progressText = document.getElementById(`text-${textId}`);
  if (progressText) {
    // console.log(`Found text element: ${progressText.id}`);
    progressText.textContent = `${percent}%`;
  } else {
    // console.log(`Text element with ID text-${textId} not found`);
  }
  // Update the specific progress bar
  const specificBar = document.getElementById(`progress-${textId}`);
  if (specificBar) {
    // console.log(`Updating progress bar ${specificBar.id} to ${percent}%`);
    specificBar.style.width = `${percent}%`;
  } else {
    // console.log(`Progress bar with ID progress-${textId} not found`);
  }

  // Update any related text elements
  const allProgTexts = document.querySelectorAll(`[id$="text-${textId}"]`);
  allProgTexts.forEach((text) => {
    text.textContent = `${percent}%`;
  });
}

async function assessmentsPercentage() {
  try {
    const assessmentsRef = collection(db, "assessment");

    // Fetch all documents from the collection
    const docSnapAssessment = await getDocs(assessmentsRef);

    const assessments = docSnapAssessment.docs.map((doc) => ({
      id: doc.id, // Add document ID for reference
      ...doc.data(), // Spread the document data
    }));

    totalAssessments = Object.keys(assessments).length;
    // console.log(totalAssessments);
    totalUserAssessment = await fetchAllAssessmentResults(email);
    // console.log(totalUserAssessment);
    const assessmentPercent = Math.floor(
      (totalUserAssessment / totalAssessments) * 100
    ); // Calculate percentage

    // Store assessment percent in localStorage
    localStorage.setItem("profile3Percent", assessmentPercent);

    setTimeout(() => {
      try {
        // Update assessment progress bar directly
        const progressBar3 = document.getElementById("progress-3");
        if (progressBar3) {
          progressBar3.style.width = assessmentPercent + "%";
          document.getElementById("text-3").textContent =
            assessmentPercent + "%";
          // console.log("Set progress-3 width to", assessmentPercent + "%");
        }
      } catch (err) {
        // console.error("Error updating assessment progress bar:", err);
      }
    }, 500);
    showProgress(3, 3, assessmentPercent);
  } catch (error) {
    // console.error("Error getting user data from user_profile:", error);
  }
}

async function fetchAllAssessmentResults(email) {
  try {
    if (!email) {
      throw new Error("Email is required to fetch assessment results.");
    }

    // Reference to the 'user_assessment_results' collection

    const docSnap = await getDoc(doc(db, "user_assessment_results", email));

    // Fetch all documents from 'user_assessment_results'

    // console.log(docSnap.data().results);
    const userResults = docSnap.data()?.results || [];

    // console.log(userResults);
    uniqueItems = Array.from(
      new Map(
        userResults.map((item) => [item.quizCode.toLowerCase(), item])
      ).values()
    );

    // console.log(uniqueItems);
    return uniqueItems.length;

    // Iterate through each document in 'user_assessment_results'

    // return assessmentLength;
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    return 0; // Return 0 in case of an error
  }
}

//checkbox
let selections = [];
window.updateSelection = updateSelection;

async function updateSelection(checkbox) {
  if (checkbox.checked) {
    selections.push(checkbox.value);
  } else {
    selections = selections.filter((item) => item !== checkbox.value); // ✅ Remove item properly
  }

  selections = [...new Set(selections)]; // ✅ Remove duplicates

  const userProfileRef = doc(db, "user_profile", email);
  try {
    const docSnapshot = await getDoc(userProfileRef);
    const auditForm = docSnapshot.data().audit_fields;

    var currentDate = window.getCurrentDateTime();
    var auditData = {
      createdAt: auditForm.createdAt,
      createdBy: docSnapshot.data().about.email,
      updatedAt: currentDate,
      updatedBy: docSnapshot.data().about.email,
    };

    if (docSnapshot.exists()) {
      const existingData = docSnapshot.data();
      const updatedData = {
        ...existingData,
        preferences: selections, // ✅ Save updated selections array
        audit_fields: auditData,
      };

      await setDoc(userProfileRef, updatedData);
    }
  } catch (error) {
    console.error("Error updating user data: ", error);
  }
}

// let selection = new Set();

async function isUser() {
  // console.log("isUser");
  try {
    const leadDocSnap = await getDoc(doc(db, "lead", email));
    const docSnap = await getDoc(doc(db, "user_profile", email));
    if (docSnap.exists()) {
      const userData = docSnap?.data() || {};
      // console.log(docSnap.data());
      // console.log("userprofle");
      // Update profile image if available
      const profileImgElement = document.querySelector(".profile-img");
      if (profileImgElement && userData.about && userData.about.image) {
        // console.log("Setting profile image:", userData.about.image);
        profileImgElement.src = userData.about.image;
      }

      // Update user name in the header
      const profileNameElement = document.querySelector(
        ".d-flex.align-items-center.mb-4 h5"
      );
      if (profileNameElement && userData.about) {
        const fullName =
          (userData.about.firstName || "") +
          " " +
          (userData.about.lastName || "");
        if (fullName.trim()) {
          // console.log("Setting user name:", fullName);
          profileNameElement.textContent = fullName;
        }
      }

      // Update user email display if it exists
      const userEmailElement = document.getElementById("user-email");
      if (userEmailElement && userData.about && userData.about.email) {
        console.log("Setting user email:", userData.about.email);
        userEmailElement.textContent = userData.about.email;
      }

      document.getElementById("view_cv").href = userData.about.cv || "#";

      // Extract data from user profile
      let aboutData = userData.about || {};
      let socialData = userData.social || {};
      let skillData = userData.skills || {};
      let addressData = userData.address || {};
      let educationData = userData.education || {};
      let experienceData = userData.experience || {};
      const storedSelections = userData?.preferences || []; // Default to empty array
      storedSelections.forEach((item) => selections.push(item)); // ✅ Push items to array      // Update all job/internship checkboxes in both layouts
      const jobCheckboxes = document.querySelectorAll('input[value="job"]');
      jobCheckboxes.forEach((checkbox) => {
        checkbox.checked = selections.includes("job");
      });

      const internshipCheckboxes = document.querySelectorAll(
        'input[value="internship"]'
      );
      internshipCheckboxes.forEach((checkbox) => {
        checkbox.checked = selections.includes("internship");
      });

      // Combine first and last name for aboutData
      // if(aboutData.firstName )
      // console.log(aboutData.firstName);
      // console.log(aboutData.lastName);
      aboutData.fullname = aboutData?.firstName + aboutData?.lastName || "";
      // console.log(aboutData.fullname);

      // Removing unnecessary fields
      const { cv, firstName, lastName, email, phoneNo, ...updatedAboutData } =
        aboutData;
      // console.log(updatedAboutData);

      // Calculate completion percentages for each section
      const personalProfilePercent = loopingForUserdata(updatedAboutData, 0, 4);
      const socialPercent = loopingForUserdata(
        socialData,
        0,
        Object.keys(socialData).length
      );
      const skillsPercent = loopingForUserdata(
        skillData,
        0,
        Object.keys(skillData).length
      );
      const addressPercent = loopingForUserdata(
        addressData,
        0,
        Object.keys(addressData).length
      );
      const educationPercent = loopingForUserdata(
        educationData,
        0,
        Object.keys(educationData).length
      );
      const experiencePercent = loopingForUserdata(
        experienceData,
        0,
        Object.keys(experienceData).length
      );

      // Calculate overall completion (average of all sections)
      const jobProfilePercent = Math.floor(
        ((socialPercent +
          skillsPercent +
          addressPercent +
          educationPercent +
          experiencePercent) /
          500) *
          100
      );
      await assessmentsPercentage();
      console.log("Personal Profile Percent:", personalProfilePercent);
      console.log("Job Profile Percent:", jobProfilePercent);

      // Set a slightly longer timeout to ensure DOM is fully rendered and ready
      setTimeout(() => {
        try {
          console.log("Setting progress bars with timeout");
          // Store percentages in localStorage for persistence
          localStorage.setItem("profile1Percent", personalProfilePercent);
          localStorage.setItem("profile2Percent", jobProfilePercent);

          // Force progress bar update with direct DOM manipulation
          const progressBar1 = document.getElementById("progress-1");
          if (progressBar1) {
            progressBar1.style.width = personalProfilePercent + "%";
            document.getElementById("text-1").textContent =
              personalProfilePercent + "%";
            console.log(
              "Set progress-1 width to",
              personalProfilePercent + "%"
            );
          }

          const progressBar2 = document.getElementById("progress-2");
          if (progressBar2) {
            progressBar2.style.width = jobProfilePercent + "%";
            document.getElementById("text-2").textContent =
              jobProfilePercent + "%"; // console.log("Set progress-2 width to", jobProfilePercent + "%");
          }

          // Use the function too as a fallback
          showProgress(1, 1, personalProfilePercent);
          showProgress(2, 2, jobProfilePercent);
        } catch (err) {
          // console.error("Error updating progress bars:", err);
        }
      }, 500); // Longer delay to ensure DOM is ready

      // Skills Data (replace with actual dynamic data)
      // console.log(skillData);
      let skills = [];

      // Populate skills list dynamically with flex-wrap
      if (Object.keys(skillData).length !== 0) {
        console.log(Object.keys(skillData).length);
        // console.log(skills);

        // console.log(uniqueItems);

        // console.log(totalUserAssessment);
        // console.log(totalAssessments);
        skillData.forEach((item) => {
          if (!skills.includes(item.skillName)) {
            skills.push(item.skillName);
          }
        });
        skills = skills.map((skill) => skill.trim());
        // Log the updated skills array
        let matchingCount = skills.filter((skill) =>
          uniqueItems.some(
            (item) => item.quizCode.toLowerCase() === skill.toLowerCase()
          )
        ).length;

        // console.log(matchingCount);
        document.getElementById(
          "progress-count"
        ).textContent = `${matchingCount}/${totalAssessments}`;

        const skillsList = document.getElementById("skills-list");
        skills.forEach((skill, index) => {
          const skillItem = document.createElement("span");
          // skillItem.className = "badge bg-primary text-light px-3 py-2"; // Bootstrap badge styling
          skillItem.textContent = `${index + 1}. ${skill}`;
          skillsList.appendChild(skillItem);
        });
      }
    } else if (leadDocSnap.exists()) {
      console.log("lead");
      // If user profile does not exist, check the lead collection
      // const docSnap = await getDoc(doc(db, "user_profile", email));
      const userDocRef = doc(db, "user_profile", email);
      // const leadDocSnap = await getDoc(leadDocRef);
      const userData = leadDocSnap.data();
      // console.log(userData);
      // console.log(leadDocSnap.data());
      let v = userData.full_name.split(" ");
      // console.log(v);
      const firstname = v[0];
      const lastname = v[1] || "";

      let formData = {
        about: {
          email: userData.email,
          firstName: firstname,
          lastName: lastname,
          phoneNo: userData.phonenumber,
        },
      };
      var currentDate = window.getCurrentDateTime();
      // console.log(currentDate);
      if (leadDocSnap.exists()) {
        formData.about = { ...formData.about, ...leadDocSnap.data() };
        delete formData.about.full_name;
        delete formData.about.phonenumber;
      }

      // // Add audit fields
      formData.audit_fields = {
        createdAt: currentDate,
        createdBy: email,
        updatedAt: "",
        updatedBy: "",
      };
      formData.remark = null;
      formData.preferences = selections;
      console.log(formData);

      // // Create a new user profile document
      await setDoc(userDocRef, formData);
      // console.log("success");
    } else {
      const userDocRef = doc(db, "user_profile", email);
      const leadDocRef = doc(db, "lead", email);
      console.log("no");
      const userEmail = email;
      const userName = username;
      let phoneNumber = phonenumber;
      if (phoneNumber === "null") {
        phoneNumber = "";
      }
      // console.log(userEmail, userName, phoneNumber);
      const separate = userName.trim();
      var arr = separate.split(" ");
      // console.log(arr[1]);
      let formData = {
        about: {
          firstName: arr[0],
          lastName: arr[1],
          email: userEmail,
          phoneNo: phoneNumber,
        },
      };
      var currentDate = window.getCurrentDateTime();
      formData.audit_fields = {
        createdAt: currentDate,
        createdBy: userEmail,
        updatedAt: "",
        updatedBy: "",
      };
      formData.remark = null;
      formData.preferences = selections;
      console.log(formData);
      await setDoc(userDocRef, formData);
      await setDoc(leadDocRef, {
        full_name: userName,
        email: userEmail,
        phonenumber: phoneNumber,
      });
    }
  } catch (error) {
    console.error("Error getting user data from user_profile:", error);
  }
}
isUser();
