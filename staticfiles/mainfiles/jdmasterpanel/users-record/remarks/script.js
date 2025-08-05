

const email = localStorage.getItem("email");

if (!email) {
  window.location.href = "/login/";
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
        await getAllData();
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

document.addEventListener("DOMContentLoaded", async function () {
  await isUser();
});


// Fetch consultancy remarks, interview feedback, and user remarks
async function getAllData() {
  try {
    const consultanciesSnapshot = await getDocs(collection(db, "user_consultancies"));
    const interviewsSnapshot = await getDocs(collection(db, "user_interviews"));
    const userRemarksSnapshot = await getDocs(collection(db, "user_remarks"));

    const usersData = {};

    // Process consultancy remarks
    consultanciesSnapshot.forEach((doc) => {
      const data = doc.data();
      usersData[data.email] = {
        email: data.email,
        remarks: data.remarks || [],
        feedbacks: [], // Default empty array to avoid undefined errors
        userRemarks: [] // Default empty array for user remarks
      };
    });

    // Process interview feedbacks
    interviewsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (usersData[data.email]) {
        usersData[data.email].feedbacks = data.feedbacks || [];
      } else {
        usersData[data.email] = {
          email: data.email,
          remarks: [],
          feedbacks: data.feedbacks || [],
          userRemarks: []
        };
      }
    });

    // Process user remarks (from Submit button)
    userRemarksSnapshot.forEach((doc) => {
      const data = doc.data();
      if (usersData[data.email]) {
        usersData[data.email].userRemarks = [data]; // Store the user remark
      } else {
        usersData[data.email] = {
          email: data.email,
          remarks: [],
          feedbacks: [],
          userRemarks: [data]
        };
      }
    });

    // Convert object to array
    const groupedData = Object.values(usersData);

    // Display data
    displayData(groupedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    displayError("An error occurred while fetching data.");
  }
}

// Display data in a table
function displayData(groupedData) {
  const userDetailsContainer = document.getElementById("userDetails");

  const rows = groupedData
    .map((group, index) => {
      const maxRows = Math.max(group.remarks.length, group.feedbacks.length, group.userRemarks.length, 1);

      let rowHTML = "";

      for (let i = 0; i < maxRows; i++) {
        rowHTML += `<tr>`;

        // Only add S.No and Email for the first row
        if (i === 0) {
          rowHTML += `<td rowspan="${maxRows}">${index + 1}</td>`;
          rowHTML += `<td rowspan="${maxRows}">${group.email}</td>`;
        }

        // User Remarks (from Submit button)
        if (i < group.userRemarks.length) {
          rowHTML += `<td>${group.userRemarks[i].remark}</td>`;
          rowHTML += `<td>${formatDate(group.userRemarks[i].submittedAt)}</td>`;
        } else {
          rowHTML += `<td>N/A</td><td>N/A</td>`;
        }

        // Consultancy Remarks
        if (i < group.remarks.length) {
          rowHTML += `<td>${group.remarks[i].text}</td>`;
          rowHTML += `<td>${formatDate(group.remarks[i].date)}</td>`;
        } else {
          rowHTML += `<td>N/A</td><td>N/A</td>`;
        }

        // Interview Feedback
        if (i < group.feedbacks.length) {
          rowHTML += `<td>${group.feedbacks[i].text}</td>`;
          rowHTML += `<td>${formatDate(group.feedbacks[i].interviewDate)}</td>`;
        } else {
          rowHTML += `<td>N/A</td><td>N/A</td>`;
        }

        rowHTML += `</tr>`;
      }

      return rowHTML;
    })
    .join("");

  userDetailsContainer.innerHTML = `
    <h2>All User Remarks and Feedback</h2>
    <table border="1" cellpadding="10" cellspacing="0">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Email</th>
          <th>User Remarks</th>
          <th>Submitted Date</th>
          <th>Consultancy Remarks</th>
          <th>Date</th>
          <th>Interview Feedback</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}
// Format Firestore Timestamp to readable date
function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return "N/A";
  const date = timestamp.toDate();
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

// Display an error message
function displayError(message) {
  const userDetailsContainer = document.getElementById("userDetails");
  userDetailsContainer.innerHTML = `<p class="error">${message}</p>`;
}


