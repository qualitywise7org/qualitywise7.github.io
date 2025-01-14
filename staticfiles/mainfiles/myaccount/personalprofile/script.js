// import { getCurrentDateTime } from "../../../utils";


const email = localStorage.getItem("email");
// console.log(email);
let imageUrl = "";
let cvUrl = "";
let editImageUrl = "";



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
      var userData = docSnap.data();
      // console.log(userData);
      populateForm(userData);
    } else {
      await fetchFromLeadCollection();
    }
  } catch (error) {
    console.error("Error getting user data from user_profile:", error);
  }
}

async function fetchFromLeadCollection() {
  const leadRef = collection(db, "lead");
  const leadQuery = query(leadRef, where("email", "==", email));
  try {
    const leadSnapshot = await getDocs(leadQuery);
    if (!leadSnapshot.empty) {
      const leadData = leadSnapshot.docs[0].data();
      // console.log(leadData);
      populateForm(leadData);
    } else {
      console.log("No data found in lead collection either.");
    }
  } catch (error) {
    console.error("Error getting data from lead collection:", error);
  }
}

function populateForm(userData) {
  // console.log(userData.about)
  if (userData.about.full_name) {
    document.getElementById("fullname").innerText =
      userData.about?.full_name || "";
    document.getElementById("edit-name").value =
      userData.about?.full_name || "John Doe";
  } else {
    const fullName = userData.about.firstname + " " + userData.about.lastname;
    document.getElementById("fullname").innerText = fullName;
    document.getElementById("edit-name").value = fullName || "John Doe";
  }
  // console.log(userData);

  document.getElementById("email").innerText = userData.about?.email || "";
  document.getElementById("dob").innerText = userData.about?.dob || "";
  document.getElementById("mob").innerText =
    userData.about?.phoneNo || userData.about?.phonenumber || "";
  document.getElementById("gender").innerText = userData.about?.gender || "";
  document.getElementById("edit-email").value =
    userData.about?.email || "xyz@gmail.com";
  document.getElementById("edit-phone").value =
    userData.about?.phoneNo || userData.about?.phonenumber || "1234567890";

  document.getElementById("edit-dob").value =
    userData.about?.dob || "2000-01-02";
  document.getElementById("edit-gender").value =
    userData.about?.gender || "Male / Female";

  imageUrl =
    userData.about?.image ||
    "https://www.pngall.com/wp-content/uploads/5/Profile.png";
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
  editImageUrl = file;
  if (file) {
    const reader = new FileReader(); // FileReader for reading file content
    // reader.onload = (e) => {
    //   // imagePreview.src = e.target.result; // Set image preview source
    //   // imagePreview.classList.remove("hidden"); // Show the image preview
    //   // placeholder.classList.add("hidden"); // Hide the placeholder
    // };
    reader.readAsDataURL(file); // Read the image file as a data URL
  } 
  // else {
  //   // Reset if no file is selected
  //   imagePreview.src = "";
  //   imagePreview.classList.add("hidden");
  //   placeholder.classList.remove("hidden");
  // }
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
  const separate = fullname;
  var arr = separate.split(" ");
  // console.log(arr[1]);
  aboutData.firstname = arr[0];
  aboutData.lastname = arr[1];
  aboutData.gender = $("#edit-gender").val() || "";
  aboutData.email = email;
  aboutData.dob = $("#edit-dob").val();

  aboutData.phoneNo = $("#edit-phone").val();
  // aboutData.cv = cvUrl || "";
  const imageFile = editImageUrl;
  // console.log(imageFile);
  const newImageUrl = await uploadImageAndGetURL(imageFile);
  aboutData.image = newImageUrl || "";
  //   console.log(aboutData);

  formData.about = aboutData;
  // console.log(formData);

  // Reference to Firestore document
  const userProfileRef = doc(db, "user_profile", email);
  //   console.log(userProfileRef);
  try {
    // Collect form data
    // const formData = collectFormData();
    
    var currentDate = window.getCurrentDateTime()
    const docSnap = await getDoc(userProfileRef);
    const auditForm = docSnap.data().audit_fields;
    // console.log(auditForm);
    var auditData = {
      createdAt: auditForm.createdAt,
      createdBy: docSnap.data().about.email,
      updatedAt: currentDate,
      updatedBy: docSnap.data().about.email,
    };

    // console.log(auditData);
    // Save data to Firestore
    if (docSnap.exists) {
      formData = { ...formData, ...docSnap.data() };
      // console.log(formData);

      await updateDoc(userProfileRef, { about: aboutData, // Updated 'about' data
        audit_fields: auditData, });
    } else {
      formData.audit_fields = auditData;
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
