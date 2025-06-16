const email = localStorage.getItem("email");
// console.log(email);
var userRole;
if (!email) {
  window.location.href = "/login/";
}

async function mainData(){
  setDefaultDateFilters()
  document.getElementById("searchButton").addEventListener("click", filterByNameEmail);
  document.getElementById("genderDropdown").addEventListener("change", filterByNameEmail);
  document.getElementById("startDate").addEventListener("change", () => {
    if (document.getElementById("startDate").value && document.getElementById("endDate").value) {
      filterByNameEmail();
    }
  });

  document.getElementById("endDate").addEventListener("change", () => {
    if (document.getElementById("startDate").value && document.getElementById("endDate").value) {
      filterByNameEmail();
    }
  });

  document.getElementById("filter_button").addEventListener("click", filterByRating);
  document.getElementById("genderDropdown").addEventListener("change", filterByRating);
  document.getElementById("startDate").addEventListener("change", () => {
    if (document.getElementById("startDate").value && document.getElementById("endDate").value) {
      filterByRating();
    }
  });

  document.getElementById("endDate").addEventListener("change", () => {
    if (document.getElementById("startDate").value && document.getElementById("endDate").value) {
      filterByRating();
    }
  });

  document.getElementById("searchButton").addEventListener("click", updateTable);
  document.getElementById("genderDropdown").addEventListener("change", updateTable);
  document.getElementById("filter_button").addEventListener("click", updateTable);
  document.getElementById("startDate").addEventListener("change", updateTable);
  document.getElementById("endDate").addEventListener("change", updateTable);

  setDefaultDateFilters();
  updateTable();
}

async function isUser() {
  try {
    const docRef = doc(db, "login_roles", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const userRole = userData.role;

      console.log("User Role from Firestore:", userRole);

      if (userRole === "master_admin" || userRole === "recruiter") {
        await mainData();
        console.log("Admin access granted.");
      } else {
        console.log("Access denied. Redirecting...");
        window.location.href = "/";
      }
    } else {
      console.error("No user role found for email:", email);
      window.location.href = "/login/"; // Redirect if no user data is found
    }
  } catch (error) {
    console.error("Error getting user data from Firestore:", error);
    window.location.href = "/"; // Redirect in case of error
  }
}


// console.log(userRole);
document.addEventListener("DOMContentLoaded", async function () {
  await isUser();
  // console.log(userRole);
  // populateUserProfilesTable();
});



//Function to add consultancy feedback (stored as an array)

// async function addConsultancyRemark(email, remark, date) {
//   if (!email || !remark || !date) {
//     alert("Please enter a remark and select a valid date.");
//     return;
//   }

//   try {
//     const userRef = doc(db, "user_consultancies", email); // Use email as document ID
//     const userDoc = await getDoc(userRef);
//     console.log(userDoc);

//     if (userDoc.exists()) {
//       // Update existing document: push new remark to array
//       await updateDoc(userRef, {
//         remarks: arrayUnion({
//           text: remark,
//           date: Timestamp.fromDate(new Date(date)),
//           createdAt: Timestamp.now()
//         }),
//         updatedAt: Timestamp.now()
//       });
//     } else {
//       // Create new document with remarks array
//       await setDoc(userRef, {
//         email: email,
//         remarks: [
//           {
//             text: remark,
//             date: Timestamp.fromDate(new Date(date)),
//             createdAt: Timestamp.now()
//           }
//         ],
//         createdAt: Timestamp.now(),
//         updatedAt: Timestamp.now()
//       });
//     }

//     alert("Remark added successfully!");
//   } catch (error) {
//     console.error("Error adding consultancy remark:", error);
//     alert("Failed to add remark. Please try again.");
//   }
// }

//Function to add interview feedback (stored as an array)

async function addInterviewDetails(email, feedback, interviewDate) {
  if (!email || !feedback || !interviewDate) {
    alert("Please enter feedback and select a valid date.");
    return;
  }
  try {
    const interviewRef = doc(db, "user_interviews", email); // Use email as document ID
    const interviewDoc = await getDoc(interviewRef);

    if (interviewDoc.exists()) {
      // Update existing document: push new feedback to array
      await updateDoc(interviewRef, {
        feedbacks: arrayUnion({
          text: feedback,
          interviewDate: Timestamp.fromDate(new Date(interviewDate)),
          createdAt: Timestamp.now()
        }),
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new document with feedbacks array
      await setDoc(interviewRef, {
        email: email,
        feedbacks: [
          {
            text: feedback,
            interviewDate: Timestamp.fromDate(new Date(interviewDate)),
            createdAt: Timestamp.now()
          }
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    alert("Interview details added successfully!");
  } catch (error) {
    console.error("Error adding interview details:", error);
    alert("Failed to add interview details. Please try again.");
  }
}

//function for default dates (5days ago to today)
function setDefaultDateFilters() {
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");

  if (!startDateInput || !endDateInput) return;

  const today = new Date();
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(today.getDate() - 5);

  // Format date as YYYY-MM-DD for <input type="date">
  const formatForInput = (date) => date.toISOString().split("T")[0];

  // Set default values in the date inputs
  startDateInput.value = formatForInput(fiveDaysAgo);
  endDateInput.value = formatForInput(today);

  console.log("Default Dates Set: ", {
    from: startDateInput.value,
    to: endDateInput.value,
  });

  // Call the filtering function after setting the dates
  filterByNameEmail();
}

// function runs after page loads
// document.addEventListener("DOMContentLoaded", setDefaultDateFilters);

//filter by name or email
window.filterByNameEmail = async function filterByNameEmail() {
  const searchInput = document.getElementById("searchInput").value.trim();
  let { selectedGender, startDate, endDate } = getCommonFilter();


  try {
    const usersRef = collection(db, "user_profile");
    let filters = [];

    // If no dates are selected, apply the default (last 5 days)
    if (!startDate || !endDate) {
      const today = new Date();
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(today.getDate() - 5);

      startDate = Timestamp.fromDate(fiveDaysAgo);
      endDate = Timestamp.fromDate(today);
    }

    //gender filter (if selected)
    if (selectedGender && selectedGender !== "all") {
      filters.push(where("about.gender", "==", selectedGender));
    }
    // date filter if both start and end dates are selected
    if (startDate && endDate) {
      filters.push(where("audit_fields.updatedAt", ">=", startDate));
      filters.push(where("audit_fields.updatedAt", "<=", endDate));
    }

    let q;

    //Case 1: Filter by Date, Gender, and Name/Email
    if (startDate && endDate && selectedGender !== "all" && searchInput) {
      const dateQuery = query(usersRef, where("audit_fields.updatedAt", ">=", startDate),
        where("audit_fields.updatedAt", "<=", endDate),
        orderBy("audit_fields.updatedAt"));
      const dateSnapshot = await getDocs(dateQuery);
      let users = dateSnapshot.docs.map(doc => doc.data());

      // Apply Gender Filtering in JavaScript

      users = users.filter(user => {
        const userGender = user?.about?.gender ? user.about.gender.trim().toLowerCase() : "";
        const selectedGenderValue = selectedGender ? selectedGender.trim().toLowerCase() : "";

        return userGender === selectedGenderValue;
      });
      // // Apply Name/Email Filtering in JavaScript
      users = users.filter(user => {
        const email = user?.about?.email || "";
        const firstName = user?.about?.firstName || "";
        const lowerSearch = searchInput.toLowerCase();
      
        return searchInput.includes("@")
          ? email.toLowerCase().startsWith(lowerSearch)
          : firstName.toLowerCase().startsWith(lowerSearch);
      });

      console.log("Filtered Users (Date, Gender & Name/Email):", users);
      return users;
    }
    // Case 2: Both Date & Gender are selected (First filter by date, then filter gender)
    else if (startDate && endDate && selectedGender !== "all") {
      const dateQuery = query(usersRef, where("audit_fields.updatedAt", ">=", startDate),
        where("audit_fields.updatedAt", "<=", endDate),
        orderBy("audit_fields.updatedAt"));
      const dateSnapshot = await getDocs(dateQuery);
      let users = dateSnapshot.docs.map(doc => doc.data());
      // Apply gender filtering in JavaScript
      users = users.filter(user => {
        const userGender = user?.about?.gender ? user.about.gender.trim().toLowerCase() : "";
        const selectedGenderValue = selectedGender ? selectedGender.trim().toLowerCase() : "";

        return userGender === selectedGenderValue;
      });
      console.log("Filtered Users (Date & Gender):", users);
      return users;
    }
    //  Case 3: Both Date & Name/Email are selected (First filter by date, then search locally)
    else if (searchInput && startDate && endDate) {
      const dateQuery = query(usersRef, ...filters);
      const dateSnapshot = await getDocs(dateQuery);
      let users = dateSnapshot.docs.map(doc => doc.data());

      // Apply search filtering in JavaScript
      users = users.filter(user => {
        const email = user?.about?.email || "";
        const firstName = user?.about?.firstName || "";
        const lowerSearch = searchInput.toLowerCase();
      
        return searchInput.includes("@")
          ? email.toLowerCase().startsWith(lowerSearch)
          : firstName.toLowerCase().startsWith(lowerSearch);
      });

      console.log("Filtered Users (Date & Name/Email):", users);
      return users;
    }
    //Case 4: Both Gender & Name/Email are selected(First filter by gender, then search locally)
    if (searchInput && selectedGender !== "all") {
      const genderQuery = query(usersRef, ...filters);
      const genderSnapshot = await getDocs(genderQuery);

      let users = genderSnapshot.docs.map(doc => doc.data());

      // Apply search filtering in JavaScript
      users = users.filter(user => {
        const email = (user?.about?.email || "");
        const firstName = (user?.about?.firstName || "");
        return searchInput.includes("@")
          ? email.startsWith(searchInput)
          : firstName.startsWith(searchInput);
      });

      console.log("Filtered Users (gender / name):", users);
      return users;
    }
    // Case 5: Only Name/Email is provided 
    else if (searchInput) {
      if (searchInput.includes("@")) {
        q = query(
          usersRef,
          where("about.email", ">=", searchInput),
          where("about.email", "<=", searchInput + "\uf8ff")
        );
      } else {
        q = query(
          usersRef,
          where("about.firstName", ">=", searchInput),
          where("about.firstName", "<=", searchInput + "\uf8ff")
        );
      }
      // Fetch users from Firebase
      const querySnapshot = await getDocs(q);
      let users = querySnapshot.docs.map(doc => doc.data());
    
      // Perform case-insensitive filtering in JavaScript
      const lowerSearch = searchInput.toLowerCase();
      users = users.filter(user => {
        const email = user?.about?.email?.toLowerCase() || "";
        const firstName = user?.about?.firstName?.toLowerCase() || "";
    
        return searchInput.includes("@")
          ? email.startsWith(lowerSearch)
          : firstName.startsWith(lowerSearch);
    });
      console.log("Filtered Users (name):", users);
      return users;
  }

    //  Case 6: Only Gender is selected 
    else if (selectedGender && selectedGender !== "all") {
      q = query(usersRef, ...filters);
    }
    //case 7: Only Date filter is selected 
    else if (startDate && endDate) {
      q = query(usersRef, ...filters);
    }

    if (!q) return [];

    const querySnapshot = await getDocs(q);
    let users = querySnapshot.docs.map(doc => doc.data());

    console.log("Filtered Users (Name / email):", users);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};
//eventListeners for filter by name/email


//filter by rate 
window.filterByRating = async function filterByRating() {
  const selectedRating = document.getElementById("ratingDropdown").value;
  let { selectedGender, startDate, endDate } = getCommonFilter();

  try {
    const usersRef = collection(db, "user_profile");
    let filters = [];

    // Apply gender filter in Firestore query (if selected)
    if (selectedGender && selectedGender !== "all") {
      filters.push(where("about.gender", "==", selectedGender));
    }
    if (startDate && endDate) {
      filters.push(where("audit_fields.updatedAt", ">=", startDate));
      filters.push(where("audit_fields.updatedAt", "<=", endDate));
    }

    let q;

    //  Case 1: Both Date, Gender & Rating are selected → First filter by date, then filter by gender, then filter by rating
    if (startDate && endDate && selectedGender !== "all" && selectedRating !== "all") {

      const dateQuery = query(usersRef, where("audit_fields.updatedAt", ">=", startDate),
        where("audit_fields.updatedAt", "<=", endDate),
        orderBy("audit_fields.updatedAt"));
      const dateSnapshot = await getDocs(dateQuery);
      let users = dateSnapshot.docs.map(doc => doc.data());

      // Apply gender filtering in JavaScript
      users = users.filter(user => {
        const userGender = user?.about?.gender ? user.about.gender.trim().toLowerCase() : "";
        const selectedGenderValue = selectedGender ? selectedGender.trim().toLowerCase() : "";
        return userGender === selectedGenderValue;
      });

      // Apply rating filtering in JavaScript
      users = users.filter(user => {
        const rate = user?.rating;
        return selectedRating === "unrated" ? rate === null : rate === Number(selectedRating);
      });

      console.log("Filtered Users (Date, Gender & Rating):", users);
      return users;
    }
    // Case 2: Both Date & Gender are selected → First filter by date, then filter by gender
    else if (startDate && endDate && selectedGender !== "all") {
      console.log("Selected Gender:", selectedGender);
      const dateQuery = query(usersRef, ...filters, orderBy("audit_fields.updatedAt"));
      const dateSnapshot = await getDocs(dateQuery);
      let users = dateSnapshot.docs.map(doc => doc.data());

      // Apply gender filtering in JavaScript
      users = users.filter(user => {
        const userGender = user?.about?.gender ? user.about.gender.trim().toLowerCase() : "";
        const selectedGenderValue = selectedGender ? selectedGender.trim().toLowerCase() : "";

        return userGender === selectedGenderValue;
      });

      console.log("Filtered Users (Date & Gender):", users);
      return users;
    }
    //case 3: Both Date & Rating are selected → First filter by date, then search locally
    else if (startDate && endDate && selectedRating !== "all") {
      const dateQuery = query(usersRef, ...filters, orderBy("audit_fields.updatedAt"));
      const dateSnapshot = await getDocs(dateQuery);
      let users = dateSnapshot.docs.map(doc => doc.data());
      // Apply rating filtering in JavaScript
      users = users.filter(user => {
        const rate = user?.rating;
        return selectedRating === "unrated" ? rate === null : rate === Number(selectedRating);
      });
      console.log("Filtered Users (Date & Rating):", users);
      return users;
    }
    // Case 4: Both Gender & Rating are selected → First filter by gender, then search locally
    if (selectedRating !== "all" && selectedGender !== "all") {
      const genderQuery = query(usersRef, ...filters);
      const genderSnapshot = await getDocs(genderQuery);

      let users = genderSnapshot.docs.map(doc => doc.data());

      // Apply rating filtering in JavaScript
      users = users.filter(user => {
        const rating = user?.rating;
        return selectedRating === "unrated" ? rating === null : rating === Number(selectedRating);
      });

      console.log("Filtered Users(gender/rate):", users);
      return users;
    }
    // Case 5: Only Rating is provided → Apply Firestore search directly
    if (selectedRating) {
      if (selectedRating === "rated") {
        q = query(usersRef, where("rating", ">", 0), orderBy("rating"));
      } else if (selectedRating === "unrated") {
        q = query(usersRef, where("rating", "==", null), orderBy("rating"));
      } else {
        q = query(usersRef, where("rating", "==", parseInt(selectedRating)), orderBy("rating"));
      }
    }

    // If no filtering is applied, return an empty array
    if (!q) return [];

    const querySnapshot = await getDocs(q);
    let users = querySnapshot.docs.map(doc => doc.data());

    console.log("Filtered Users (rate):", users);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};


//function to format date for firestore
function formatDateForFirestore(date) {
  return date.toISOString();
}

//function to get common filters
function getCommonFilter() {
  const selectedGender = document.getElementById("genderDropdown").value.trim();
  const startDateInput = document.getElementById("startDate").value;
  const endDateInput = document.getElementById("endDate").value;

  const startDate = startDateInput ? formatDateForFirestore(new Date(startDateInput)) : null;
  const endDate = endDateInput ? formatDateForFirestore(new Date(endDateInput)) : null;
  return { selectedGender, startDate, endDate };
}


let currentPage = 1;
const rowsPerPage = 5;

//function to populate table

async function populateUserProfilesTable(data) {
  const tableBody = document.querySelector("#userProfilesTable tbody");
  tableBody.innerHTML = ""; // Clear existing rows

  try {
    let selectedRating = document.getElementById("ratingDropdown").value; // Get selected rating
     const globalSearchValue = document.getElementById("globalSearch").value.toLowerCase().trim();
    let filteredUsers = [];

    if (selectedRating && selectedRating !== "all") {
      filteredUsers = await filterByRating(); // Fetch users based on rating filter
    } else {
      filteredUsers = data ? data : await filterByNameEmail(); // Default: fetch by name/email
    }
    
    console.log("Selected Rating:", selectedRating);
console.log("Filtered Users:", filteredUsers);

     //  calculating experience
        function calculateExperience(start, end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate) || isNaN(endDate)) return "Invalid dates";

      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());

      if (months < 12) return `${months} months`;
      const years = Math.floor(months / 12);
      const remMonths = months % 12;
      return `${years} year${years > 1 ? "s" : ""}${remMonths ? ` ${remMonths} months` : ""}`;
    }
     //  Apply Global Search Filtering (after all other filters)
    if (globalSearchValue) {
      filteredUsers = filteredUsers.filter(user => {
        const values = [
          user.about?.firstName,
          user.about?.lastName,
          user.about?.email,
          user.about?.gender,
          user.education?.[0]?.school,
          user.education?.[0]?.degree,
          user.education?.[0]?.graduation_date,
          user.about?.dob ? calculateAge(user.about.dob).toString() + " years" : "",
          user.skills?.join(", "),
          user.social?.github,
          user.social?.instagram,
          user.social?.linkedin,
          user.social?.leetcode,
           ...(user.experience || []).map(exp => {
            const duration = calculateExperience(exp.startDate, exp.endDate);
            return `${exp.companyName} ${duration}`;
          }),
          user.address?.present?.address,
          user.address?.present?.city,
          user.address?.present?.state,
          user.address?.present?.zip,
          user.address?.permanent?.address,
          user.address?.permanent?.city,
          user.address?.permanent?.state,
          user.address?.permanent?.zip,
          user.rating?.toString(),
          user.interview?.feedback || ""
      ]; 
      return values.filter(Boolean).some(field =>
  typeof field === "string" && field.toLowerCase().includes(globalSearchValue)
);


        // Check if any field includes the search term
        return values.some(field =>
          typeof field === "string" && field.toLowerCase().includes(globalSearchValue)
        );
      });
    }

    if (!Array.isArray(filteredUsers)||filteredUsers.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='14'>No users found</td></tr>";
      updatePaginationControls(0);
      return;
    }
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    paginatedUsers.forEach((user, index) => {
      const row = document.createElement("tr");

      // Serial Number
      row.innerHTML = `
        <td>${index + 1}</td>
        <td><img 
      src="${user.about?.image || '/staticfiles/mainfiles/myaccount/hire/candidates/default_profile.jpg'}" 
      width="50" height="50" 
      alt="Profile"
      onerror="this.onerror=null;this.src='/staticfiles/mainfiles/myaccount/hire/candidates/default_profile.jpg';"
      style="object-fit:cover;border-radius:50%;background:#f3f3f3;"
    ></td>
        <td>${user.about?.firstName || "N/A"} ${user.about?.lastName || ""}</td>
        <td>${user.about?.email || "N/A"}</td>
        <td>${user.about?.gender || "N/A"}</td>
        <td>${user.education?.[0]?.school || "N/A"}</td>
        <td>${user.education?.[0]?.degree || "N/A"}</td>
        <td>
          ${
            user.about?.cv
              ? `<a href="${user.about.cv}" target="_blank" rel="noopener noreferrer">View CV</a>`
              : "N/A"
          }
        </td>
        <td>${user.education?.[0]?.graduation_date || "N/A"}</td>
        <td>${user.about?.dob ? calculateAge(user.about.dob) + " years" : "N/A"}</td>
        <td>${user.skills?.join(", ") || "N/A"}</td>
      <td>
      ${user.social?.github ? `<a href="${user.social.github}" target="_blank">GitHub</a><br>` : ""}
      ${user.social?.instagram ? `<a href="${user.social.instagram}" target="_blank">Instagram</a><br>` : ""}
      ${user.social?.leetcode ? `<a href="${user.social.leetcode}" target="_blank">LeetCode</a><br>` : ""}
      ${user.social?.linkedin ? `<a href="${user.social.linkedin}" target="_blank">LinkedIn</a>` : ""}
    </td>
    <td>
      ${user.experience?.map(exp => {
        const duration = calculateExperience(exp.startDate, exp.endDate);
        return `<div><strong>${exp.companyName}</strong>: ${duration}</div>`;
      }).join("") || "N/A"}
    </td>
    <td>
      <strong>Present:</strong><br>
      ${user.address?.present?.address || ""} ${user.address?.present?.city || ""} ${user.address?.present?.state || ""} ${user.address?.present?.zip || ""} <br><br>
      <strong>Permanent:</strong><br>
      ${user.address?.permanent?.address || ""} ${user.address?.permanent?.city || ""} ${user.address?.permanent?.state || ""} ${user.address?.permanent?.zip || ""}
    </td>

     `;

   

      // Rating Dropdown
      // const ratingCell = document.createElement("td");
      // const ratingSelect = document.createElement("select");

      // for (let i = 0; i <= 5; i++) {
      //   const option = document.createElement("option");
      //   option.value = i;
      //   option.textContent = i;
      //   if (user.rating === i) option.selected = true;
      //   ratingSelect.appendChild(option);
      // }

      // ratingSelect.addEventListener("change", async function () {
      //   user.rating = parseInt(ratingSelect.value);
      //   await updateUserRating(user.about.email, user.rating);
      // });

      // ratingCell.appendChild(ratingSelect);
      // row.appendChild(ratingCell);


      const ratingCell = document.createElement("td");
ratingCell.textContent = user.rating != null ? user.rating : "N/A";
row.appendChild(ratingCell);

      // Action Buttons (Edit, Show Remarks, Submit)
      const actionCell = document.createElement("td");

      const reviewButton = document.createElement("button");
      reviewButton.textContent = "Show Remarks";
      reviewButton.addEventListener("click", () => {
        window.open("remarks/?user=" + encodeURIComponent(user.about.email), "_blank");
      });

     
      actionCell.appendChild(reviewButton);
      row.appendChild(actionCell);


      // Interview Form
      const interviewCell = document.createElement("td");
      const interviewDateInput = document.createElement("input");
      interviewDateInput.type = "date";
      interviewDateInput.value = new Date().toISOString().slice(0, 10);

      const interviewTextarea = document.createElement("textarea");
      interviewTextarea.rows = 3;
      interviewTextarea.placeholder = "Enter interview feedback...";

      const interviewButton = document.createElement("button");
      interviewButton.textContent = "Add Interview Details";
      interviewButton.addEventListener("click", async () => {
        await addInterviewDetails(user.about.email, interviewTextarea.value.trim(), interviewDateInput.value);
        interviewTextarea.value = "";
        interviewDateInput.value = new Date().toISOString().slice(0, 10);
      });

      interviewCell.appendChild(interviewDateInput);
      interviewCell.appendChild(interviewTextarea);
      interviewCell.appendChild(interviewButton);
      row.appendChild(interviewCell);

      tableBody.appendChild(row);
    });
    updatePaginationControls(filteredUsers.length);
  } catch (error) {
    console.error("Error getting user profiles:", error);
  }
}
function handleGlobalSearch() {
  populateUserProfilesTable();
}
window.handleGlobalSearch = handleGlobalSearch;



// calculating age from dob
function calculateAge(dob) {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Function to update user rating in Firestore
async function updateUserRating(email, rating) {
  try {
    const userRef = doc(db, "user_profile", email);
    await updateDoc(userRef, { rating });
    console.log("Rating updated successfully!");
  } catch (error) {
    console.error("Error updating rating:", error);
  }
}

function updatePaginationControls(totalRows) {
  const paginationDiv = document.getElementById("paginationControls");
  paginationDiv.innerHTML = "";

  const totalPages = Math.ceil(totalRows / rowsPerPage);

  if (totalPages > 1) {
    const prevButton = document.createElement("button");
    prevButton.innerHTML = `<i class="fas fa-chevron-left"></i>`; // Font Awesome left arrow
    prevButton.classList.add("pagination-btn");
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        populateUserProfilesTable();
      }
    });

    const nextButton = document.createElement("button");
    nextButton.innerHTML = `<i class="fas fa-chevron-right"></i>`; // Font Awesome right arrow
    nextButton.classList.add("pagination-btn");
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        populateUserProfilesTable();
      }
    });

    const pageInfo = document.createElement("span");
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    pageInfo.classList.add("pagination-info");

    paginationDiv.appendChild(prevButton);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextButton);
  }
}


// Ensure table updates when filters change
async function updateTable() {
  let selectedRating = document.getElementById("ratingDropdown").value;
  let filteredData = selectedRating && selectedRating !== "all" ? await filterByRating() : await filterByNameEmail();
  populateUserProfilesTable(filteredData);
}

// document.addEventListener("DOMContentLoaded", function () {
//   document.getElementById("searchButton").addEventListener("click", updateTable);
//   document.getElementById("genderDropdown").addEventListener("change", updateTable);
//   document.getElementById("filter_button").addEventListener("click", updateTable);
//   document.getElementById("startDate").addEventListener("change", updateTable);
//   document.getElementById("endDate").addEventListener("change", updateTable);

//   setDefaultDateFilters();
//   updateTable(); // Load filtered data on page load
// });
