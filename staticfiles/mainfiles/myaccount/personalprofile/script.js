// import { getCurrentDateTime } from "../../../utils";

const email = localStorage.getItem("email");
// console.log(email);
let imageUrl = "";
let cvUrl = "";
let editImageUrl = null; // Initialize as null to properly detect if a new image is selected
let userPhoneNumber = "";

if (!email) {
  window.location.href = "/login/";
}

async function isUser() {
  // console.log("isUser");

  try {
    const docRef = doc(db, "user_profile", email);
    const docSnap = await getDoc(docRef);
    //   console.log(docSnap);
    if (docSnap.exists()) {
      var userData = docSnap.data();
      // console.log(userData);
      userPhoneNumber = userData.about.phoneNo;
      populateForm(userData);
    } else {
      await fetchFromLeadCollection();
    }
  } catch (error) {
    console.error("Error getting user data from user_profile:", error);
  }
}

async function fetchFromLeadCollection() {
  const leadRef = doc(db, "lead", email);
  try {
    const leadSnapshot = await getDoc(leadRef);
    if (!leadSnapshot.empty) {
      const leadData = leadSnapshot.data();
      // console.log(leadData);
      userPhoneNumber = leadData.phonenumber;
      populateForm(leadData);
    } else {
      console.log("No data found in lead collection either.");
    }
  } catch (error) {
    console.error("Error getting data from lead collection:", error);
  }
}

async function populateForm(userData) {
  // console.log(userData.about)
  if (userData.full_name) {
    console.log("fullname");
    document.getElementById("fullname").innerText = userData?.full_name || "";
    document.getElementById("edit-name").value =
      userData?.full_name || "John Doe";
  } else {
    const fullName = userData.about.firstName + " " + userData.about.lastName;
    document.getElementById("fullname").innerText = fullName;
    document.getElementById("edit-name").value = fullName || "John Doe";
  }
  // console.log(userData);

  document.getElementById("email").innerText =
    userData.about?.email || userData?.email || "";
  document.getElementById("dob").innerText =
    userData.about?.dob || userData?.dob || "";
  document.getElementById("mob").innerText =
    userData.about?.phoneNo ||
    userData.about?.phonenumber ||
    userData.phonenumber ||
    "";
  document.getElementById("gender").innerText = userData.about?.gender || "";
  document.getElementById("edit-email").value =
    userData.about?.email || userData?.email || "xyz@gmail.com";
  document.getElementById("edit-phone").value =
    userData.about?.phoneNo ||
    userData.about?.phonenumber ||
    userData?.phonenumber ||
    "1234567890";

  document.getElementById("edit-dob").value =
    userData.about?.dob || userData?.dob || "2000-01-02"; // Set gender radio button based on stored value
  const storedGender = userData.about?.gender || userData?.gender || "";
  document.getElementById("edit-gender").value = storedGender;

  // Check the appropriate radio button based on stored gender
  if (storedGender === "Male") {
    document.getElementById("gender-male").checked = true;
  } else if (storedGender === "Female") {
    document.getElementById("gender-female").checked = true;
  } else if (storedGender === "Other") {
    document.getElementById("gender-other").checked = true;
  } else {
    // Default to male if no gender is stored
    document.getElementById("gender-male").checked = true;
  }

  imageUrl = userData.about?.image || "";
  
  // Fetch and display user rank
  await displayUserRank();
  // cvUrl = userData.about?.cv || "";

  const profileImage = document.getElementById("show_image");
  profileImage.src = imageUrl;
}

//   edit form

// Get references to the button and the form
const editButton = document.getElementById("edit-button");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");

// Show the modal when the edit button is clicked
editButton.addEventListener("click", () => {
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();
  // Reset editImageUrl to null each time modal is opened
  editImageUrl = null;
  // Reset the file input value
  document.getElementById("file-input").value = "";

  // Example: If user has no phone number
  const phoneInput = document.getElementById("edit-phone");

  if (userPhoneNumber.trim() !== "") {
    phoneInput.value = userPhoneNumber;
    phoneInput.disabled = true; // Disable input if phone exists
  } else {
    phoneInput.disabled = false; // Enable input if no phone exists
  }
});
cancelButton.addEventListener("click", () => {
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.hide();
});

isUser();

//saving profile
// References to elements
const fileInput = document.getElementById("file-input");
// const imagePreview = document.getElementById("image-preview");
// const placeholder = document.getElementById("placeholder");

// Event listener for file input
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0]; // Get the selected file
  if (file) {
    editImageUrl = file; // Only set editImageUrl if a file is selected
    const reader = new FileReader(); // FileReader for reading file content
    // Optional: Show a preview of the selected image in the modal
    reader.onload = (e) => {
      // You could add a preview image in the modal if desired
      // For now we're just reading the file to ensure it's valid
    };
    reader.readAsDataURL(file); // Read the image file as a data URL
  } else {
    editImageUrl = null; // Reset if no file is selected
  }
});

// Event listeners for gender radio buttons
document.querySelectorAll('input[name="gender-option"]').forEach((radio) => {
  radio.addEventListener("change", function () {
    document.getElementById("edit-gender").value = this.value;
  });
});

//getting hosted url for profile
async function uploadImageAndGetURL(file) {
  const imageRef = ref(storage, "user_images/" + file.name);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);
  return url; // Return empty string if URL is undefined
}

//sending the data to database.
// Function to save form data to the database
async function saveFormDataToDatabase(event) {
  event.preventDefault(); // Prevent default form submission behavior
  // console.log("save to database");

  var formData = {};
  var aboutData = {};

  // console.log(aboutData.firstName);
  const fullname = $("#edit-name").val() || "";
  const separate = fullname.trim();
  console.log(separate);
  var arr = separate.split(" ");
  console.log(arr[0]);
  aboutData.firstName = arr[0];
  aboutData.lastName = arr[1] || "";

  // Get selected gender from radio buttons
  const selectedGender = document.querySelector(
    'input[name="gender-option"]:checked'
  );
  aboutData.gender = selectedGender ? selectedGender.value : "Male";
  // Update the hidden input with the selected gender
  document.getElementById("edit-gender").value = aboutData.gender;

  aboutData.email = email;
  aboutData.dob = $("#edit-dob").val();
  aboutData.phoneNo = $("#edit-phone").val();
  // aboutData.cv = cvUrl || "";

  // Only upload and update image if a new one is selected
  if (editImageUrl) {
    const newImageUrl = await uploadImageAndGetURL(editImageUrl);
    aboutData.image = newImageUrl;
  } else {
    // Keep the existing image URL if no new image is selected
    aboutData.image = imageUrl;
  }
  // console.log(newImageUrl);

  formData.about = aboutData;
  // console.log(formData);

  // Reference to Firestore document
  const userProfileRef = doc(db, "user_profile", email);
  //   console.log(userProfileRef);
  try {
    // Collect form data
    // const formData = collectFormData();

    var currentDate = window.getCurrentDateTime();
    // console.log(currentDate);
    const docSnap = await getDoc(userProfileRef);
    const auditForm = docSnap.data()?.audit_fields || {};
    // console.log(docSnap.data());
    var auditData = {
      createdAt: auditForm?.createdAt || currentDate,
      createdBy: docSnap.data()?.about?.email || email,
      updatedAt: currentDate,
      updatedBy: docSnap.data()?.about?.email || email,
    };

    // console.log(auditData);
    // Save data to Firestore
    if (docSnap.exists()) {
      formData = { ...formData, ...docSnap.data() };
      // console.log(formData);
      // console.log("exist");

      await updateDoc(userProfileRef, {
        about: aboutData, // Updated 'about' data
        audit_fields: auditData,
      });
    } else {
      // console.log("noy exist");
      formData.audit_fields = auditData;
      // console.log(formData);
      await setDoc(userProfileRef, formData);
    }

    //   console.log("Data successfully saved to Firestore");
    window.location.reload();
    // Show success message (uncomment if using Toastify)
    //   Toastify({
    //     text: "Details Successfully Submitted",
    //     duration: 3000,
    //     newWindow: true,
    //     close: true,
    //     gravity: "top",
    //     position: "right",
    //     stopOnFocus: true,
    //     style: {
    //       background: "linear-gradient(to right, #0d6efd, #586ba6)",
    //       borderRadius: "10px",
    //     },
    //   }).showToast();

    //   Redirect after success (optional)
    //   setTimeout(() => {
    //     window.location.href = "/myaccount/yourprofile/profile_saved";
    //   }, 3000);
  } catch (error) {
    // Handle error
    console.error("Error writing document: ", error);
  }
}

// Attach event listener to the save button
document
  .getElementById("save-button")
  .addEventListener("click", saveFormDataToDatabase);

// Function to display user rank
async function displayUserRank() {
  try {
    const email = localStorage.getItem("email");
    if (!email) {
      return;
    }

    const rankingRef = doc(db, "user_rankings", "assessment_rankings");
    const rankingDoc = await getDoc(rankingRef);
    
    if (rankingDoc.exists()) {
      const data = rankingDoc.data();
      const userRanking = data.rankings.find(user => user.email === email);
      
      if (userRanking) {
        const rankText = userRanking.rank <= 10 ? `#${userRanking.rank}` : `Rank ${userRanking.rank}`;
        const scoreText = `${userRanking.weightedScore}%`;
        const attemptsText = `${userRanking.totalAttempts} test${userRanking.totalAttempts > 1 ? 's' : ''}`;
        
        const rankingClass = await getRankingClass(email);
        document.getElementById("user-rank").innerHTML = `
          <span class="badge ${rankingClass}">${rankText} (${scoreText}, ${attemptsText})</span>
        `;
      } else {
        document.getElementById("user-rank").innerText = "No Assessment Completed";
      }
    } else {
      document.getElementById("user-rank").innerText = "No Rankings Available";
    }
  } catch (error) {
    console.error("Error fetching user rank:", error);
    document.getElementById("user-rank").innerText = "Error Loading Rank";
  }
}

// Function to get ranking class for styling
async function getRankingClass(userEmail) {
  try {
    const rankingRef = doc(db, "user_rankings", "assessment_rankings");
    const rankingDoc = await getDoc(rankingRef);
    
    if (rankingDoc.exists()) {
      const data = rankingDoc.data();
      const userRanking = data.rankings.find(user => user.email === userEmail);
      
      if (!userRanking) return "ranking-none";
      
      if (userRanking.rank <= 3) return "ranking-top";
      if (userRanking.rank <= 10) return "ranking-excellent";
      if (userRanking.rank <= 25) return "ranking-good";
      if (userRanking.rank <= 50) return "ranking-average";
      return "ranking-below-average";
    }
    return "ranking-none";
  } catch (error) {
    console.error("Error getting ranking class:", error);
    return "ranking-none";
  }
}
