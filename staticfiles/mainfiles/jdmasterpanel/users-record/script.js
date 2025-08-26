const email = localStorage.getItem("email");
// console.log(email);
var userRole;
if (!email) {
  window.location.href = "/login/";
}

// Ranking system variables
let userRankings = {};
let rankingData = {};

// Function to calculate and store user rankings based on assessment results
async function calculateUserRankings() {
  try {
    console.log("Calculating user rankings...");
    
    // Get all user assessment results
    const userResultsQuery = query(collection(db, "user_assessment_results"));
    const userResultsSnapshot = await getDocs(userResultsQuery);
    
    const rankingScores = {};
    
    userResultsSnapshot.forEach((doc) => {
      const userEmail = doc.id;
      const userData = doc.data();
      
      if (userData.results && Array.isArray(userData.results)) {
        let totalScore = 0;
        let totalAttempts = 0;
        let bestScore = 0;
        
        // Calculate average score and best score across all assessments
        userData.results.forEach((attempt) => {
          if (attempt.percentage !== undefined) {
            totalScore += attempt.percentage;
            totalAttempts++;
            if (attempt.percentage > bestScore) {
              bestScore = attempt.percentage;
            }
          }
        });
        
        if (totalAttempts > 0) {
          const averageScore = totalScore / totalAttempts;
          // Weight: 70% best score + 30% average score
          const weightedScore = averageScore;
          
          rankingScores[userEmail] = {
            averageScore: Math.round(averageScore * 100) / 100,
            bestScore: bestScore,
            weightedScore: Math.round(weightedScore * 100) / 100,
            totalAttempts: totalAttempts,
            lastAssessmentDate: userData.results[userData.results.length - 1]?.timestamp || null
          };
        }
      }
    });
    
    // Sort users by weighted score (descending)
    const sortedUsers = Object.entries(rankingScores)
      .sort(([,a], [,b]) => b.weightedScore - a.weightedScore)
      .map(([email, data], index) => ({
        email,
        rank: index + 1,
        ...data
      }));
    
    // Store rankings in database
    const rankingRef = doc(db, "user_rankings", "assessment_rankings");
    await setDoc(rankingRef, {
      rankings: sortedUsers,
      lastUpdated: new Date(),
      totalUsers: sortedUsers.length
    });
    
    // Update local ranking data
    rankingData = {};
    sortedUsers.forEach(user => {
      rankingData[user.email] = user;
    });
    
    console.log("User rankings calculated and stored successfully");
    return rankingData;
    
  } catch (error) {
    console.error("Error calculating user rankings:", error, error.stack || "");
    alert("Error calculating user rankings: " + (error && error.message ? error.message : error));
    return {};
  }
}

// Function to get user rankings from database
async function getUserRankings() {
  try {
    const rankingRef = doc(db, "user_rankings", "assessment_rankings");
    const rankingDoc = await getDoc(rankingRef);
    
    if (rankingDoc.exists()) {
      const data = rankingDoc.data();
      rankingData = {};
      data.rankings.forEach(user => {
        rankingData[user.email] = user;
      });
      return rankingData;
    } else {
      // If no rankings exist, calculate them
      return await calculateUserRankings();
    }
  } catch (error) {
    console.error("Error getting user rankings:", error, error.stack || "");
    alert("Error getting user rankings: " + (error && error.message ? error.message : error));
    return {};
  }
}

// Function to get ranking display text
function getRankingDisplay(userEmail) {
  const ranking = rankingData[userEmail];
  if (!ranking) {
    return "No Assessment";
  }
  
  const rankText = ranking.rank <= 10 ? `#${ranking.rank}` : `Rank ${ranking.rank}`;
  const scoreText = `${ranking.weightedScore}%`;
  const attemptsText = `${ranking.totalAttempts} test${ranking.totalAttempts > 1 ? 's' : ''}`;
  
  return `${rankText} (${scoreText}, ${attemptsText})`;
}

// Function to get ranking class for styling
function getRankingClass(userEmail) {
  const ranking = rankingData[userEmail];
  if (!ranking) return "ranking-none";
  
  if (ranking.rank <= 3) return "ranking-top";
  if (ranking.rank <= 10) return "ranking-excellent";
  if (ranking.rank <= 25) return "ranking-good";
  if (ranking.rank <= 50) return "ranking-average";
  return "ranking-below-average";
}

// --- Refactored for new UI ---
let currentPage = 1;
let rowsPerPage = 10;
let sortBy = 'rank';

function setRowsPerPage(value) {
  rowsPerPage = parseInt(value, 10);
  currentPage = 1;
  const usersPerPageBottom = document.getElementById('usersPerPageBottom');
  if (usersPerPageBottom && usersPerPageBottom.value !== value) usersPerPageBottom.value = value;
}

function setSortBy(value) {
  sortBy = value;
  currentPage = 1;
}

function resetFilters() {
  document.getElementById('genderDropdown').value = 'all';
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  document.getElementById('ratingDropdown').value = 'all';
  document.getElementById('rankingDropdown').value = 'all';
  document.getElementById('sortByDropdown').value = 'rank';
  document.getElementById('usersPerPageBottom').value = '10';
  setRowsPerPage('10');
  setSortBy('rank');
  currentPage = 1;
  updateTable();
}

async function mainData() {
  await getUserRankings();
  setDefaultDateFilters();
  // Top search bar
  document.getElementById('searchInput').addEventListener('input', () => { currentPage = 1; updateTable(); });
  // Offcanvas filter controls
  document.getElementById('genderDropdown').addEventListener('change', () => { currentPage = 1; });
  document.getElementById('startDate').addEventListener('change', () => { currentPage = 1; });
  document.getElementById('endDate').addEventListener('change', () => { currentPage = 1; });
  document.getElementById('ratingDropdown').addEventListener('change', () => { currentPage = 1; });
  document.getElementById('rankingDropdown').addEventListener('change', () => { currentPage = 1; });
  document.getElementById('sortByDropdown').addEventListener('change', (e) => { setSortBy(e.target.value); updateTable(); });
  document.getElementById('usersPerPageBottom').addEventListener('change', (e) => { setRowsPerPage(e.target.value); updateTable(); });
  document.getElementById('applyFiltersBtn').addEventListener('click', () => { currentPage = 1; updateTable(); });
  document.getElementById('resetFiltersBtn').addEventListener('click', resetFilters);
  // Initial table
  setRowsPerPage(document.getElementById('usersPerPageBottom').value);
  setSortBy(document.getElementById('sortByDropdown').value);
  updateTable();
}

// --- Table rendering ---
async function populateUserProfilesTable(data) {
  const tableBody = document.querySelector('#userProfilesTable tbody');
  tableBody.innerHTML = '';
  let filteredUsers = data ? data : await filterByNameEmail();
  // Sort
  if (sortBy === 'rank') {
    filteredUsers.sort((a, b) => {
      const ra = rankingData[a.about?.email]?.rank || 9999;
      const rb = rankingData[b.about?.email]?.rank || 9999;
      return ra - rb;
    });
  } else if (sortBy === 'name') {
    filteredUsers.sort((a, b) => (a.about?.firstName || '').localeCompare(b.about?.firstName || ''));
  } else if (sortBy === 'rating') {
    filteredUsers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  // Pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  paginatedUsers.forEach((user, index) => {
    const row = document.createElement('tr');
    const about = user.about || {};
    const userEmail = about.email;
    const userRanking = rankingData[userEmail];
    
    // Rating stars
    let ratingHtml = '-';
    if (typeof user.rating === 'number') {
      ratingHtml = '';
      for (let i = 1; i <= 5; i++) {
        ratingHtml += `<i class="fa-star${i <= user.rating ? ' fas star' : ' far'}"></i>`;
      }
      ratingHtml += ` <span class="text-muted">(${user.rating})</span>`;
    }
    
    // Skills as badges (max 4, then +N more with tooltip)
    let skillsHtml = '-';
    if (Array.isArray(user.skills) && user.skills.length > 0) {
      const maxBadges = 4;
      const shown = user.skills.slice(0, maxBadges);
      const rest = user.skills.slice(maxBadges);
      skillsHtml = shown.map(s => `<span class='badge bg-primary me-1 mb-1' title='${s.skillName}'>${s.skillName}</span>`).join(' ');
      if (rest.length > 0) {
        const allSkills = user.skills.map(s => s.skillName).join(', ');
        skillsHtml += `<span class='badge bg-secondary ms-1 mb-1' title='${allSkills}'>+${rest.length} more</span>`;
      }
    }
    
    // Education details
    let schoolHtml = 'N/A';
    let degreeHtml = 'N/A';
    let graduationDateHtml = 'N/A';
    if (Array.isArray(user.education) && user.education.length > 0) {
      const edu = user.education[0];
      schoolHtml = edu.institution || 'N/A';
      degreeHtml = edu.degree || 'N/A';
      graduationDateHtml = edu.year || 'N/A';
    }
    
    // Action buttons
    const actionButtons = `
      <div class="action-buttons">
        <button class="btn btn-sm btn-outline-primary mb-1" onclick="window.open('/myaccount/jobs_applied/?user=${encodeURIComponent(about.email)}','_blank')" title="Applied Jobs">Applied_Job</button>
        <button class="btn btn-sm btn-outline-secondary mb-1" onclick="handleSubmitClick('${about.email}', this)" title="Submit Remarks">Submit</button>
        <div id="submit-status-${about.email.replace(/[^a-zA-Z0-9]/g, '')}" class="submit-status" style="display: none;">
          <small class="text-success fw-bold">✓ Submitted</small>
        </div>
      </div>
    `;
    
    // Consultancy Remark section
    const consultancyRemarkHtml = `
      <div class="consultancy-section mb-2">
        <textarea id="consultancy-textarea-${about.email.replace(/[^a-zA-Z0-9]/g, '')}" rows="2" class="form-control" placeholder="Enter consultancy remark..." style="min-width:120px;">${user.consultancyRemark || ''}</textarea>
        <div class="mt-1">
          <small class="text-muted">${user.consultancyDate || '05-08-2025'}</small>
          <button class="btn btn-sm btn-outline-success ms-2" onclick="handleConsultancyRemark('${about.email}', document.getElementById('consultancy-textarea-${about.email.replace(/[^a-zA-Z0-9]/g, '')}').value, '${user.consultancyDate || '05-08-2025'}', this)">Add Remark</button>
          <div id="consultancy-status-${about.email.replace(/[^a-zA-Z0-9]/g, '')}" class="submit-status" style="display: none;">
            <small class="text-success fw-bold">✓ Submitted</small>
          </div>
        </div>
      </div>
    `;
    
    // Interview Form section
    const interviewFormHtml = `
      <div class="interview-section mb-2">
        <textarea id="interview-textarea-${about.email.replace(/[^a-zA-Z0-9]/g, '')}" rows="2" class="form-control" placeholder="Enter interview feedback..." style="min-width:120px;">${user.interviewFeedback || ''}</textarea>
        <div class="mt-1">
          <small class="text-muted">${user.interviewDate || '05-08-2025'}</small>
          <button class="btn btn-sm btn-outline-info ms-2" onclick="handleInterviewDetails('${about.email}', document.getElementById('interview-textarea-${about.email.replace(/[^a-zA-Z0-9]/g, '')}').value, '${user.interviewDate || '05-08-2025'}', this)">Add Interview Details</button>
          <div id="interview-status-${about.email.replace(/[^a-zA-Z0-9]/g, '')}" class="submit-status" style="display: none;">
            <small class="text-success fw-bold">✓ Submitted</small>
          </div>
        </div>
      </div>
    `;
    
         // Ranking display
     let rankHtml = 'N/A';
     if (userRanking) {
       const rankClass = getRankingClass(userEmail);
       rankHtml = `<span class="badge ${rankClass}">${getRankingDisplay(userEmail)}</span>`;
     }
     
     row.innerHTML = `
       <td>${startIndex + index + 1}</td>
       <td><img src="${about.image || 'https://th.bing.com/th/id/OIP.yYUwl3GDU07Q5J5ttyW9fQHaHa?rs=1&pid=ImgDetMain'}" class="profile-img" /></td>
       <td><span class="fw-bold">${about.firstName || 'N/A'} ${about.lastName || ''}</span></td>
       <td><span class="text-muted small">${about.email || 'N/A'}</span></td>
       <td>${about.gender || 'N/A'}</td>
       <td>${schoolHtml}</td>
       <td>${degreeHtml}</td>
       <td>${graduationDateHtml}</td>
       <td>${skillsHtml}</td>
       <td>${rankHtml}</td>
       <td>${ratingHtml}</td>
       <td><textarea rows="2" class="form-control" placeholder="Enter remarks..." style="min-width:120px;">${user.remarks || ''}</textarea></td>
       <td>${actionButtons}</td>
       <td>${consultancyRemarkHtml}</td>
       <td>${interviewFormHtml}</td>
     `;
    tableBody.appendChild(row);
  });
  updatePaginationControls(filteredUsers.length);
}

function updatePaginationControls(totalRows) {
  const paginationUl = document.getElementById('paginationControls');
  paginationUl.innerHTML = '';
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  if (totalPages <= 1) return;
  // Prev
  const prevLi = document.createElement('li');
  prevLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
  prevLi.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
  prevLi.onclick = () => { if (currentPage > 1) { currentPage--; updateTable(); } };
  paginationUl.appendChild(prevLi);
  // Pages
  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement('li');
    li.className = 'page-item' + (i === currentPage ? ' active' : '');
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.onclick = () => { currentPage = i; updateTable(); };
    paginationUl.appendChild(li);
  }
  // Next
  const nextLi = document.createElement('li');
  nextLi.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
  nextLi.innerHTML = `<a class="page-link" href="#">&raquo;</a>`;
  nextLi.onclick = () => { if (currentPage < totalPages) { currentPage++; updateTable(); } };
  paginationUl.appendChild(nextLi);
}

async function updateTable() {
  // Ensure rankings are loaded before populating table
  await getUserRankings();
  // You can add filter logic here if needed
  const data = await filterByNameEmail();
  populateUserProfilesTable(data);
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', mainData);



//Function to add consultancy feedback (stored as an array)
window.addConsultancyRemark = async function addConsultancyRemark(email, remark, date) {
  if (!email || !remark || !date) {
    alert("Please enter a remark and select a valid date.");
    return;
  }

  try {
    const userRef = doc(db, "user_consultancies", email); // Use email as document ID
    const userDoc = await getDoc(userRef);
    console.log(userDoc);

    if (userDoc.exists()) {
      // Update existing document: push new remark to array
      await updateDoc(userRef, {
        remarks: arrayUnion({
          text: remark,
          date: Timestamp.fromDate(new Date(date)),
          createdAt: Timestamp.now()
        }),
        updatedAt: Timestamp.now()
      });
    } else {
      // Create new document with remarks array
      await setDoc(userRef, {
        email: email,
        remarks: [
          {
            text: remark,
            date: Timestamp.fromDate(new Date(date)),
            createdAt: Timestamp.now()
          }
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    alert("Remark added successfully!");
  } catch (error) {
    console.error("Error adding consultancy remark:", error, error.stack || "");
    alert("Failed to add remark. Please try again.");
  }
}

//Function to add interview feedback (stored as an array)
window.addInterviewDetails = async function addInterviewDetails(email, feedback, interviewDate) {
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
    console.error("Error adding interview details:", error, error.stack || "");
    alert("Failed to add interview details. Please try again.");
  }
}

//Function to handle submit button click and show green indication
window.handleSubmitClick = async function handleSubmitClick(email, buttonElement) {
  try {
         // Get the remarks textarea from the same row
     const row = buttonElement.closest('tr');
     const remarksTextarea = row.querySelector('td:nth-child(12) textarea'); // Remarks column (updated index)
    
    if (!remarksTextarea || !remarksTextarea.value.trim()) {
      alert("Please enter remarks before submitting.");
      return;
    }

    // Store the remarks in Firebase
    const remarksRef = doc(db, "user_remarks", email);
    await setDoc(remarksRef, {
      email: email,
      remark: remarksTextarea.value.trim(),
      submittedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    // Show green "Submitted" indication
    const statusElement = document.getElementById(`submit-status-${email.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (statusElement) {
      statusElement.style.display = 'block';
      buttonElement.disabled = true;
      buttonElement.textContent = 'Submitted';
      buttonElement.className = 'btn btn-sm btn-success mb-1';
    }

    // Clear the textarea
    remarksTextarea.value = '';

    console.log("Remarks submitted successfully for:", email);
  } catch (error) {
    console.error("Error submitting remarks:", error, error.stack || "");
    alert("Failed to submit remarks. Please try again.");
  }
}

//Function to handle consultancy remark with green indication
window.handleConsultancyRemark = async function handleConsultancyRemark(email, remark, date, buttonElement) {
  if (!email || !remark || !date) {
    alert("Please enter a remark and select a valid date.");
    return;
  }

  try {
    const userRef = doc(db, "user_consultancies", email);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        remarks: arrayUnion({
          text: remark,
          date: Timestamp.fromDate(new Date(date)),
          createdAt: Timestamp.now()
        }),
        updatedAt: Timestamp.now()
      });
    } else {
      await setDoc(userRef, {
        email: email,
        remarks: [
          {
            text: remark,
            date: Timestamp.fromDate(new Date(date)),
            createdAt: Timestamp.now()
          }
        ],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }

    // Show green "Submitted" indication
    const statusElement = document.getElementById(`consultancy-status-${email.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (statusElement) {
      statusElement.style.display = 'block';
      buttonElement.disabled = true;
      buttonElement.textContent = 'Submitted';
      buttonElement.className = 'btn btn-sm btn-success ms-2';
    }

    // Clear the textarea
    const textarea = document.getElementById(`consultancy-textarea-${email.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (textarea) {
      textarea.value = '';
    }

    console.log("Consultancy remark submitted successfully for:", email);
  } catch (error) {
    console.error("Error adding consultancy remark:", error, error.stack || "");
    alert("Failed to add remark. Please try again.");
  }
}

//Function to handle interview details with green indication
window.handleInterviewDetails = async function handleInterviewDetails(email, feedback, interviewDate, buttonElement) {
  if (!email || !feedback || !interviewDate) {
    alert("Please enter feedback and select a valid date.");
    return;
  }
  try {
    const interviewRef = doc(db, "user_interviews", email);
    const interviewDoc = await getDoc(interviewRef);

    if (interviewDoc.exists()) {
      await updateDoc(interviewRef, {
        feedbacks: arrayUnion({
          text: feedback,
          interviewDate: Timestamp.fromDate(new Date(interviewDate)),
          createdAt: Timestamp.now()
        }),
        updatedAt: Timestamp.now()
      });
    } else {
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

    // Show green "Submitted" indication
    const statusElement = document.getElementById(`interview-status-${email.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (statusElement) {
      statusElement.style.display = 'block';
      buttonElement.disabled = true;
      buttonElement.textContent = 'Submitted';
      buttonElement.className = 'btn btn-sm btn-success ms-2';
    }

    // Clear the textarea
    const textarea = document.getElementById(`interview-textarea-${email.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (textarea) {
      textarea.value = '';
    }

    console.log("Interview details submitted successfully for:", email);
  } catch (error) {
    console.error("Error adding interview details:", error, error.stack || "");
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
      filters.push(where("audit_fields.createdAt", ">=", startDate));
      filters.push(where("audit_fields.createdAt", "<=", endDate));
    }

    let q;

    //Case 1: Filter by Date, Gender, and Name/Email
    if (startDate && endDate && selectedGender !== "all" && searchInput) {
      const dateQuery = query(usersRef, where("audit_fields.createdAt", ">=", startDate),
        where("audit_fields.createdAt", "<=", endDate),
        orderBy("audit_fields.createdAt"));
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
      const dateQuery = query(usersRef, where("audit_fields.createdAt", ">=", startDate),
        where("audit_fields.createdAt", "<=", endDate),
        orderBy("audit_fields.createdAt"));
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
    console.error("Error fetching users:", error, error.stack || "");
    alert("Error fetching users: " + (error && error.message ? error.message : error));
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
      filters.push(where("audit_fields.createdAt", ">=", startDate));
      filters.push(where("audit_fields.createdAt", "<=", endDate));
    }

    let q;

    //  Case 1: Both Date, Gender & Rating are selected → First filter by date, then filter by gender, then filter by rating
    if (startDate && endDate && selectedGender !== "all" && selectedRating !== "all") {

      const dateQuery = query(usersRef, where("audit_fields.createdAt", ">=", startDate),
        where("audit_fields.createdAt", "<=", endDate),
        orderBy("audit_fields.createdAt"));
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
      const dateQuery = query(usersRef, ...filters, orderBy("audit_fields.createdAt"));
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
      const dateQuery = query(usersRef, ...filters, orderBy("audit_fields.createdAt"));
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
    console.error("Error fetching users:", error, error.stack || "");
    alert("Error fetching users: " + (error && error.message ? error.message : error));
    return [];
  }
};

// Event listeners for filter by rating
// document.addEventListener("DOMContentLoaded", () => {
//   document.getElementById("filter_button").addEventListener("click", filterByRating);
//   document.getElementById("genderDropdown").addEventListener("change", filterByRating);
//   document.getElementById("startDate").addEventListener("change", () => {
//     if (document.getElementById("startDate").value && document.getElementById("endDate").value) {
//       filterByRating();
//     }
//   });

//   document.getElementById("endDate").addEventListener("change", () => {
//     if (document.getElementById("startDate").value && document.getElementById("endDate").value) {
//       filterByRating();
//     }
//   });

// });

// Function to filter by ranking
window.filterByRanking = async function filterByRanking() {
  const selectedRanking = document.getElementById("rankingDropdown").value;
  let { selectedGender, startDate, endDate } = getCommonFilter();

  try {
    const usersRef = collection(db, "user_profile");
    let filters = [];

    // Apply gender filter in Firestore query (if selected)
    if (selectedGender && selectedGender !== "all") {
      filters.push(where("about.gender", "==", selectedGender));
    }
    if (startDate && endDate) {
      filters.push(where("audit_fields.createdAt", ">=", startDate));
      filters.push(where("audit_fields.createdAt", "<=", endDate));
    }

    let q;

    // Case 1: Both Date, Gender & Ranking are selected
    if (startDate && endDate && selectedGender !== "all" && selectedRanking !== "all") {
      const dateQuery = query(usersRef, where("audit_fields.createdAt", ">=", startDate),
        where("audit_fields.createdAt", "<=", endDate),
        orderBy("audit_fields.createdAt"));
      const dateSnapshot = await getDocs(dateQuery);
      let users = dateSnapshot.docs.map(doc => doc.data());

      // Apply gender filtering in JavaScript
      users = users.filter(user => {
        const userGender = user?.about?.gender ? user.about.gender.trim().toLowerCase() : "";
        const selectedGenderValue = selectedGender ? selectedGender.trim().toLowerCase() : "";
        return userGender === selectedGenderValue;
      });

      // Apply ranking filtering in JavaScript
      users = users.filter(user => {
        const userEmail = user?.about?.email;
        const userRanking = rankingData[userEmail];
        
        if (selectedRanking === "no-assessment") {
          return !userRanking;
        } else if (selectedRanking === "top-10") {
          return userRanking && userRanking.rank <= 10;
        } else if (selectedRanking === "top-25") {
          return userRanking && userRanking.rank <= 25;
        } else if (selectedRanking === "top-50") {
          return userRanking && userRanking.rank <= 50;
        } else if (selectedRanking === "below-50") {
          return userRanking && userRanking.rank > 50;
        }
        return true;
      });

      console.log("Filtered Users (Date, Gender & Ranking):", users);
      return users;
    }
    // Case 2: Both Date & Gender are selected
    else if (startDate && endDate && selectedGender !== "all") {
      const dateQuery = query(usersRef, ...filters, orderBy("audit_fields.createdAt"));
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
    // Case 3: Both Date & Ranking are selected
    else if (startDate && endDate && selectedRanking !== "all") {
      const dateQuery = query(usersRef, ...filters, orderBy("audit_fields.createdAt"));
      const dateSnapshot = await getDocs(dateQuery);
      let users = dateSnapshot.docs.map(doc => doc.data());
      
      // Apply ranking filtering in JavaScript
      users = users.filter(user => {
        const userEmail = user?.about?.email;
        const userRanking = rankingData[userEmail];
        
        if (selectedRanking === "no-assessment") {
          return !userRanking;
        } else if (selectedRanking === "top-10") {
          return userRanking && userRanking.rank <= 10;
        } else if (selectedRanking === "top-25") {
          return userRanking && userRanking.rank <= 25;
        } else if (selectedRanking === "top-50") {
          return userRanking && userRanking.rank <= 50;
        } else if (selectedRanking === "below-50") {
          return userRanking && userRanking.rank > 50;
        }
        return true;
      });
      
      console.log("Filtered Users (Date & Ranking):", users);
      return users;
    }
    // Case 4: Both Gender & Ranking are selected
    else if (selectedRanking !== "all" && selectedGender !== "all") {
      const genderQuery = query(usersRef, ...filters);
      const genderSnapshot = await getDocs(genderQuery);

      let users = genderSnapshot.docs.map(doc => doc.data());

      // Apply ranking filtering in JavaScript
      users = users.filter(user => {
        const userEmail = user?.about?.email;
        const userRanking = rankingData[userEmail];
        
        if (selectedRanking === "no-assessment") {
          return !userRanking;
        } else if (selectedRanking === "top-10") {
          return userRanking && userRanking.rank <= 10;
        } else if (selectedRanking === "top-25") {
          return userRanking && userRanking.rank <= 25;
        } else if (selectedRanking === "top-50") {
          return userRanking && userRanking.rank <= 50;
        } else if (selectedRanking === "below-50") {
          return userRanking && userRanking.rank > 50;
        }
        return true;
      });

      console.log("Filtered Users (Gender & Ranking):", users);
      return users;
    }
    // Case 5: Only Ranking is provided
    else if (selectedRanking !== "all") {
      q = query(usersRef);
      const querySnapshot = await getDocs(q);
      let users = querySnapshot.docs.map(doc => doc.data());

      // Apply ranking filtering in JavaScript
      users = users.filter(user => {
        const userEmail = user?.about?.email;
        const userRanking = rankingData[userEmail];
        
        if (selectedRanking === "no-assessment") {
          return !userRanking;
        } else if (selectedRanking === "top-10") {
          return userRanking && userRanking.rank <= 10;
        } else if (selectedRanking === "top-25") {
          return userRanking && userRanking.rank <= 25;
        } else if (selectedRanking === "top-50") {
          return userRanking && userRanking.rank <= 50;
        } else if (selectedRanking === "below-50") {
          return userRanking && userRanking.rank > 50;
        }
        return true;
      });

      console.log("Filtered Users (Ranking):", users);
      return users;
    }

    // If no filtering is applied, return an empty array
    if (!q) return [];

    const querySnapshot = await getDocs(q);
    let users = querySnapshot.docs.map(doc => doc.data());

    console.log("Filtered Users (default):", users);
    return users;
  } catch (error) {
    console.error("Error fetching users by ranking:", error, error.stack || "");
    alert("Error fetching users by ranking: " + (error && error.message ? error.message : error));
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
