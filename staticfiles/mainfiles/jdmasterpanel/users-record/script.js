const email = localStorage.getItem("email");
console.log(email);
var userRole;
if (!email) {
  window.location.href = "/login/";
}

async function isUser() {
  try {
    const docRef = doc(db, "login_roles", email);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      // console.log("User Role from Firestore:", userData.role);
      userRole = userData.role;
      if(userRole === "master_admin"){
        await populateUserProfilesTable();
        console.log("admin")
      }
      else{
        console.log("non");
        window.location.href = "/login/";
      }
    } else {
      console.error("No user role found for email:", email);
    }
  } catch (error) {
    window.location.href = "/login/";
    console.error("Error getting user data from user_profile:", error);
  }
}


// console.log(userRole);
document.addEventListener("DOMContentLoaded", async function () {
  await isUser();
  // console.log(userRole);
  // populateUserProfilesTable();
});

  
  
  
  
  async function populateUserProfilesTable() {
  // console.log(userRole);
  const tableBody = document.querySelector("#userProfilesTable tbody");

  const docRef = doc(db, "login_roles", email);
  try {
  
    const docSnap = await getDoc(docRef);
    const userData = docSnap.data();
    // role = userData.role;
    if(userData.role === "master_admin"){
      // console.log(userData);

      const querySnapshot = await getDocs(collection(db, "user_profile"));
    let count = 0;
    querySnapshot.forEach((documentSnapshot) => {
      const userProfile = documentSnapshot.data();

      const row = document.createElement("tr");

      // Serial number
      const sno = document.createElement("td");
      sno.textContent = ++count;
      row.appendChild(sno);

      try {
        // Profile Photo
        const profilePhotoCell = document.createElement("td");
        const profilePhotoImg = document.createElement("img");
        profilePhotoImg.src =
          userProfile.about && userProfile.about.image
            ? userProfile.about.image
            : "https://th.bing.com/th/id/OIP.yYUwl3GDU07Q5J5ttyW9fQHaHa?rs=1&pid=ImgDetMain";
        profilePhotoImg.alt = "Profile Photo";
        profilePhotoImg.style.width = "50px"; // Set image size
        profilePhotoImg.style.height = "50px";
        profilePhotoCell.appendChild(profilePhotoImg);
        row.appendChild(profilePhotoCell);

        // Name
        const nameCell = document.createElement("td");
        nameCell.textContent = `${userProfile.about.firstName} ${userProfile.about.lastName}`;
        row.appendChild(nameCell);

        // Email
        const emailCell = document.createElement("td");
        emailCell.textContent = userProfile.about.email;
        row.appendChild(emailCell);

        // Gender
        const genderCell = document.createElement("td");
        genderCell.textContent = userProfile.about.gender;
        row.appendChild(genderCell);

        // School
        const schoolCell = document.createElement("td");
        schoolCell.textContent = userProfile.education[0].school;
        row.appendChild(schoolCell);

        // Degree
        const degreeCell = document.createElement("td");
        degreeCell.textContent = userProfile.education[0].degree;
        row.appendChild(degreeCell);

        // Graduation Date
        const graduationDateCell = document.createElement("td");
        graduationDateCell.textContent =
          userProfile.education[0].graduation_date;
        row.appendChild(graduationDateCell);

        // Skills
        const skillsCell = document.createElement("td");
        skillsCell.textContent = userProfile.skills.join(", ");
        row.appendChild(skillsCell);

        // Rating Select
        const ratingCell = document.createElement("td");
        const ratingSelect = document.createElement("select");

        // Define options for ratings (from 0 to 5)
        for (let i = 0; i <= 5; i++) {
          const option = document.createElement("option");
          option.value = i;
          option.textContent = i;
          ratingSelect.appendChild(option);
        }

        // Set default selected value based on userProfile.rating, if available
        if (
          userProfile.rating &&
          userProfile.rating >= 1 &&
          userProfile.rating <= 5
        ) {
          ratingSelect.value = userProfile.rating.toString();
        }

        ratingSelect.addEventListener("change", function () {
          userProfile.rating = parseInt(ratingSelect.value);
        });

        ratingCell.appendChild(ratingSelect);
        row.appendChild(ratingCell);

        // Description Textarea
        const descriptionCell = document.createElement("td");
        const descriptionInput = document.createElement("textarea");
        descriptionInput.rows = 3;
        descriptionInput.value = userProfile.description || "";
        descriptionInput.placeholder = "Enter your experience...";
        descriptionInput.style.width = "100%"; // Ensure textarea takes full width
        descriptionInput.style.textAlign = "center"; // Center-align text

        descriptionInput.addEventListener("input", function () {
          userProfile.description = descriptionInput.value;
        });

        descriptionCell.appendChild(descriptionInput);
        row.appendChild(descriptionCell);

        // Action (Edit Button)
        const actionCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Applied_Job";
        editButton.addEventListener("click", () => {
          const userEmail = userProfile.about.email;
          window.open("jobs_applied/?user=" + userEmail, "_blank");
        });
        // Create the "Review" button

        const reviewButton = document.createElement("button");
        reviewButton.textContent = "Show Remarks";
        reviewButton.addEventListener("click", () => {
          const userEmail = userProfile.about.email;
          window.open("remarks/?user=" + encodeURIComponent(userEmail), "_blank");
        });

        // Action (Submit Button)
        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit";
        submitButton.addEventListener("click", async () => {
          try {
            const userProfileRef = doc(db, "user_profile", userProfile.about.email);
            await setDoc(userProfileRef, userProfile);
            alert("You have submitted successfully!"); // Show alert on successful submission
          } catch (error) {
            console.error("Error updating user profile:", error);
          }
        });

        actionCell.appendChild(editButton);
        actionCell.appendChild(submitButton);
        actionCell.appendChild(reviewButton);
        actionCell.classList.add("action");
        row.appendChild(actionCell);

        // Consultancy Remarks Section
        const remarksCell = document.createElement("td");

        // Date input (default to today's date)
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.value = new Date().toISOString().slice(0, 10);
        remarksCell.appendChild(dateInput);

        // Textarea for remark
        const remarkTextarea = document.createElement("textarea");
        remarkTextarea.rows = 3;
        remarkTextarea.placeholder = "Enter consultancy remark...";
        remarksCell.appendChild(remarkTextarea);

        // Submit Remark Button
        const submitRemarkButton = document.createElement("button");
        submitRemarkButton.textContent = "Add Remark";
        submitRemarkButton.addEventListener("click", async () => {
          await addConsultancyRemark(userProfile.about.email, remarkTextarea.value.trim(), dateInput.value);
          remarkTextarea.value = "";
          dateInput.value = new Date().toISOString().slice(0, 10);
        });
        remarksCell.appendChild(submitRemarkButton);
        row.appendChild(remarksCell);

        // Interview Form Section
        const interviewCell = document.createElement("td");

        // Date input (default to today's date)
        const interviewDateInput = document.createElement("input");
        interviewDateInput.type = "date";
        interviewDateInput.value = new Date().toISOString().slice(0, 10);
        interviewCell.appendChild(interviewDateInput);

        // Textarea for interview feedback
        const feedbackTextarea = document.createElement("textarea");
        feedbackTextarea.rows = 3;
        feedbackTextarea.placeholder = "Enter interview feedback...";
        interviewCell.appendChild(feedbackTextarea);

        // Submit Interview Button
        const submitInterviewButton = document.createElement("button");
        submitInterviewButton.textContent = "Add Interview Details";
        submitInterviewButton.addEventListener("click", () => {
          addInterviewDetails(userProfile.about.email, feedbackTextarea.value.trim(), interviewDateInput.value);
          feedbackTextarea.value = "";
          interviewDateInput.value = new Date().toISOString().slice(0, 10);
        });
        interviewCell.appendChild(submitInterviewButton);
        row.appendChild(interviewCell);


      }
      catch (error) {
        console.error("Error creating user profile row:", error);
      }

      tableBody.appendChild(row);
    });



      
    }
  } catch (error) {
    console.error("Error getting user profiles:", error);
  }
}

// Function to perform search
function searchProfiles() {
  // Get input value
  var input = document.getElementById("searchInput");
  var filter = input.value.toUpperCase();

  // Get table and table rows
  var table = document.getElementById("userProfilesTable");
  var rows = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those that don't match the search query
  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].getElementsByTagName("td");
    var found = false;
    for (var j = 0; j < cells.length; j++) {
      var cell = cells[j];
      if (cell) {
        var txtValue = cell.textContent || cell.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          found = true;
          break;
        }
      }
    }
    if (found) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
}

// Add event listener to search input for real-time filtering
var searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", function () {
  searchProfiles();
});

// Function to search for remarks
function searchRemarks() {
  console.log("Executing searchRemarks function"); // Debug statement

  var input = document.getElementById("remarksSearchInput");
  var filter = input.value.toUpperCase();

  var table = document.getElementById("userProfilesTable");
  var rows = table.getElementsByTagName("tr");

  for (var i = 1; i < rows.length; i++) { // Start from 1 to skip the header row
    var descriptionCell = rows[i].getElementsByTagName("td")[10]; // 10 is the index of the Remarks column
    if (descriptionCell) {
      var descriptionValue = descriptionCell.querySelector("textarea").value.trim().toUpperCase();

      if (filter === "PRESENT") {
        if (descriptionValue) {
          rows[i].style.display = "";
        } else {
          rows[i].style.display = "none";
        }
      } else if (filter === "ABSENT") {
        if (!descriptionValue) {
          rows[i].style.display = "";
        } else {
          rows[i].style.display = "none";
        }
      } else {
        rows[i].style.display = "";
      }
    }
  }
}
// Add event listener for remarks input for real-time filtering
var remarksSearchInput = document.getElementById("remarksSearchInput");
remarksSearchInput.addEventListener("input", function () {
  searchRemarks();
});

// Call the populateUserProfilesTable function to populate the table

// Function to perform search based on rating
function searchByRating() {
    var input = document.getElementById("ratingSearchInput");
    var filter = parseInt(input.value, 10);
  
    var table = document.getElementById("userProfilesTable");
    var rows = table.getElementsByTagName("tr");
  
    for (var i = 1; i < rows.length; i++) { // Start from 1 to skip the header row
      var ratingCell = rows[i].getElementsByTagName("td")[9]; // 9 is the index of the Rating column
      if (ratingCell) {
        var ratingValue = parseInt(ratingCell.querySelector("select").value, 10);
  
        if (isNaN(filter) || ratingValue <= filter) {
          rows[i].style.display = "";
        } else {
          rows[i].style.display = "none";
        }
      }
    }
  }
  
  // Add event listener for rating input for real-time filtering
  var ratingSearchInput = document.getElementById("ratingSearchInput");
  ratingSearchInput.addEventListener("input", searchByRating);
  
  // window.searchByRating = searchByRating;
  // window.searchProfiles = searchProfiles;
  // window.searchRemarks = searchRemarks;