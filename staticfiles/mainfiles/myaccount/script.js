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
// console.log(email);
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

function showProgress(progressId, textId, personalProfilePercent) {
  const progressBarPersonalProfile = document.getElementById(
    `progress-${progressId}`
  );
  progressBarPersonalProfile.style.setProperty(
    "--progress",
    personalProfilePercent
  );

  // Update the text inside the circle
  const progressTextPersonalProfile = document.getElementById(`text-${textId}`);
  progressTextPersonalProfile.textContent = `${personalProfilePercent}%`;
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

    const totalAssessments = Object.keys(assessments).length;
    // console.log(totalAssessments);
    const totalUserAssessment = await fetchAllAssessmentResults(email);
    console.log(totalUserAssessment);
    const assessmentPercent = Math.floor(
      (totalUserAssessment / totalAssessments) * 100
    ); // Calculate percentage
    showProgress(3, 3, assessmentPercent);
  } catch (error) {
    console.error("Error getting user data from user_profile:", error);
  }
}

async function fetchAllAssessmentResults(email) {
  try {
    if (!email) {
      throw new Error("Email is required to fetch assessment results.");
    }

    // Reference to the 'user_assessment_results' collection
    const userAssessmentResultsRef = collection(db, "user_assessment_results");

    // Fetch all documents from 'user_assessment_results'
    const userDocsSnapshot = await getDocs(userAssessmentResultsRef);
    // console.log(userDocsSnapshot);

    let allAssessmentResults = [];

    // Iterate through each document in 'user_assessment_results'
    for (const userDoc of userDocsSnapshot.docs) {
      const userId = userDoc.id; // Get the document ID (user ID)
      // console.log(userId);
      // console.log(email);

      // Check if the document ID matches the email
      if (userId === email) {
        // Reference to the 'assessment_results' subcollection

        const assessmentResultsRef = collection(
          db,
          `user_assessment_results/${email}/assessment_results`
        );

        // Fetch all documents from the 'assessment_results' subcollection
        const assessmentResultsSnapshot = await getDocs(assessmentResultsRef);
        console.log(assessmentResultsSnapshot);
        // Map the assessment results
        const assessmentResults = assessmentResultsSnapshot.docs.map((doc) => ({
          id: doc.id, // Document ID
          ...doc.data(), // Document data
        }));

        allAssessmentResults.push({
          userId,
          assessmentResults,
        });

        break; // Exit loop once matching email is found
      }
    }

    if (allAssessmentResults.length === 0) {
      // console.log("No assessment results found for the provided email.");
      return 0; // No results found
    }

    console.log(
      "All Assessment Results:",
      allAssessmentResults[0].assessmentResults
    );

    const assessmentsList = allAssessmentResults[0].assessmentResults;
    const assessmentLength = assessmentsList.length; // Directly get the length
    console.log("Assessment Length:", assessmentLength);
    return assessmentLength;
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    return 0; // Return 0 in case of an error
  }
}

async function isUser() {
  // console.log("isUser");
  try {
    const docSnap = await getDoc(doc(db, "user_profile", email));
    if (docSnap.exists()) {
      const userData = docSnap.data();
      // console.log(userData);

      document.getElementById("view_cv").href = userData.about.cv || "#";

      // Extract data from user profile
      let aboutData = userData.about || {};
      let socialData = userData.social || {};
      let skillData = userData.skills || {};
      let addressData = userData.address || {};
      let educationData = userData.education || {};
      let experienceData = userData.experience || {};

      // Combine first and last name for aboutData
      // if(aboutData.firstname )
      aboutData.fullname = aboutData.firstname + " " + aboutData.lastname || "";

      // Removing unnecessary fields
      const {cv , firstname, lastname, email, phoneNo, ...updatedAboutData } =
        aboutData;
        // console.log(updatedAboutData);

      // Calculate completion percentages for each section
      const personalProfilePercent = loopingForUserdata(
        updatedAboutData,
        0,
        4
      );
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
      showProgress(1, 1, personalProfilePercent);
      showProgress(2, 2, jobProfilePercent);
    } else {
      // If user profile does not exist, check the lead collection
      // const docSnap = await getDoc(doc(db, "user_profile", email));
      const userDocRef = doc(db, "user_profile", email);
      const leadDocRef = doc(db, "lead", email);
      const leadDocSnap = await getDoc(leadDocRef);
      const userData = leadDocSnap.data();
      // console.log(userData);
      let v = userData.full_name.split(" ");
      // console.log(v);
      const firstName = v[0];
      const lastName = v[1] || "";
      
      let formData = { about: { email : userData.email, firstname: firstName , lastname : lastName } };
      var currentDate = window.getCurrentDateTime();
      // console.log(currentDate);
      if (leadDocSnap.exists()) {
        formData.about = { ...formData.about, ...leadDocSnap.data()};
        delete formData.about.full_name;
      }
      
      // // Add audit fields
      formData.audit_fields = {
        createdAt: currentDate,
        createdBy: email,
        updatedAt: "",
        updatedBy: "",
      };
      // console.log(formData);

      // // Create a new user profile document
      await setDoc(userDocRef, formData);
      // console.log("success");
      
    }
  } catch (error) {
    console.error("Error getting user data from user_profile:", error);
  }
}
isUser();
