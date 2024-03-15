async function getAllUserProfiles() {
  try {
    const querySnapshot = await getDocs(collection(db, "userProfile"));
    const tableBody = document.getElementById("userProfilesTableBody");
    querySnapshot.forEach((doc) => {
      const userProfile = doc.data();
      const row = createUserProfileTableRow(userProfile);
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error getting user profiles:", error);
  }
}

function createUserProfileTableRow(userProfile) {
  const row = document.createElement("tr");

  // Name
  const nameCell = document.createElement("td");
  nameCell.textContent = `${userProfile.about.firstName} ${userProfile.about.lastName}`;
  row.appendChild(nameCell);

  // Rating
  const ratingCell = document.createElement("td");
  ratingCell.textContent = userProfile.overallRating || 'N/A';
  row.appendChild(ratingCell);

  // Description
  const descriptionCell = document.createElement("td");
  descriptionCell.textContent = userProfile.description || 'N/A';
  row.appendChild(descriptionCell);

  // Education Details
  const educationCell = document.createElement("td");
  educationCell.textContent = `${userProfile.education[0].school}, ${userProfile.education[0].degree}, Graduated: ${userProfile.education[0].graduation_date}`;
  row.appendChild(educationCell);

  // Other Details (Example)
  const otherDetailsCell = document.createElement("td");
  otherDetailsCell.textContent = `Email: ${userProfile.about.email}, Gender: ${userProfile.about.gender}`;
  row.appendChild(otherDetailsCell);

  return row;
}

getAllUserProfiles();
