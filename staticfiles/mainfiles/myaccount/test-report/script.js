import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzoJJ_325VL_axuuAFzDf3Bwt_ENzu2rM",
  authDomain: "jobsdoor360-39b87.firebaseapp.com",
  databaseURL: "https://jobsdoor360-39b87-default-rtdb.firebaseio.com",
  projectId: "jobsdoor360-39b87",
  storageBucket: "jobsdoor360-39b87.appspot.com",
  messagingSenderId: "326416618185",
  appId: "1:326416618185:web:de19e90fe4f06006ef3318",
  measurementId: "G-60RHEMJNM6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let userId = null;

document.addEventListener("DOMContentLoaded", () => {
  // Show loading state
  showLoadingState();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userId = user.email;
      // console.log(`User is logged in: ${userId}`); // Debug: User authentication status
      await fetchAndDisplayResults(userId);
    } else {
      hideLoadingState();
      showMessage("Please log in to check your assessment reports", "error");
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  });
});

function showLoadingState() {
  const reportContainer = document.getElementById("assessment-report");
  const noResultsMessage = document.getElementById("no-results-message");

  if (reportContainer) {
    reportContainer.innerHTML =
      '<div class="loading-message">Loading your assessment reports...</div>';
  }
  if (noResultsMessage) {
    noResultsMessage.style.display = "none";
  }
}

function hideLoadingState() {
  const reportContainer = document.getElementById("assessment-report");
  if (reportContainer) {
    reportContainer.innerHTML = "";
  }
}

function showMessage(message, type = "info") {
  const reportContainer = document.getElementById("assessment-report");
  if (reportContainer) {
    reportContainer.innerHTML = `<div class="message-box ${type}">${message}</div>`;
  }
}

async function fetchAndDisplayResults(userId) {
  try {
    // console.log(`Fetching assessment results for user: ${userId}`); // Debug: Data fetch initiation
    showLoadingState();

    const resultsRef = doc(db, "user_assessment_results", userId);
    const resultsDoc = await getDoc(resultsRef);

    hideLoadingState();

    if (resultsDoc.exists()) {
      const resultsData = resultsDoc.data();
      // console.log("Results Data:", resultsData); // Debug: Retrieved data structure

      if (
        resultsData.results &&
        Array.isArray(resultsData.results) &&
        resultsData.results.length > 0
      ) {
        // Fetch user role for determining access permissions
        const userRole = await getUserRole(userId);
        displayResults(resultsData.results, userRole);
      } else {
        // console.log("No results found for user."); // Debug: Empty results case
        showNoResultsMessage();
      }
    } else {
      // console.log("No document found for user."); // Debug: Document not found case
      showNoResultsMessage();
    }
  } catch (error) {
    console.error("Error fetching assessment results:", error);
    hideLoadingState();
    showMessage(
      "Error loading assessment reports. Please try again later.",
      "error"
    );
    addRetryButton();
  }
}

// Add retry functionality
function addRetryButton() {
  const reportContainer = document.getElementById("assessment-report");
  if (reportContainer) {
    const retryButton = document.createElement("button");
    retryButton.textContent = "Retry";
    retryButton.classList.add("btn-start");
    retryButton.style.marginTop = "20px";
    retryButton.onclick = () => {
      if (userId) {
        fetchAndDisplayResults(userId);
      }
    };

    const retryContainer = document.createElement("div");
    retryContainer.style.textAlign = "center";
    retryContainer.appendChild(retryButton);

    reportContainer.appendChild(retryContainer);
  }
}

function showNoResultsMessage() {
  const reportContainer = document.getElementById("assessment-report");
  const noResultsMessage = document.getElementById("no-results-message");

  if (reportContainer) {
    reportContainer.innerHTML = "";
  }
  if (noResultsMessage) {
    noResultsMessage.style.display = "block";
  }
}

function displayResults(results, userRole = "user") {
  // console.log("Displaying results..."); // Debug: Display function called
  const reportContainer = document.getElementById("assessment-report");
  const noResultsMessage = document.getElementById("no-results-message");

  if (!reportContainer) {
    console.error("Element with ID 'assessment-report' not found");
    return;
  }

  // console.log("Found 'assessment-report' element."); // Debug: Container element found

  // Hide no results message
  if (noResultsMessage) {
    noResultsMessage.style.display = "none";
  }

  // Clear previous results
  reportContainer.innerHTML = "";

  if (!Array.isArray(results) || results.length === 0) {
    showNoResultsMessage();
    return;
  }

  // Sort results by timestamp (newest first)
  const sortedResults = results.sort((a, b) => {
    const timeA = a.timestamp && a.timestamp.seconds ? a.timestamp.seconds : 0;
    const timeB = b.timestamp && b.timestamp.seconds ? b.timestamp.seconds : 0;
    return timeB - timeA;
  });

  sortedResults.forEach((result, index) => {
    const resultBox = document.createElement("div");
    resultBox.classList.add("assessment-box");

    const quizTitle = document.createElement("h2");
    quizTitle.textContent = result.quizCode || `Assessment ${index + 1}`;

    const score = document.createElement("p");
    score.textContent = `Score: ${result.score || "N/A"}`;

    const percentage = document.createElement("p");
    const percentageValue =
      result.percentage !== undefined ? `${result.percentage}%` : "N/A";
    percentage.textContent = `Percentage: ${percentageValue}`;

    const timestamp = document.createElement("p");
    if (result.timestamp && result.timestamp.seconds) {
      const date = new Date(result.timestamp.seconds * 1000);
      timestamp.textContent = `Date: ${date.toLocaleString()}`;
    } else {
      timestamp.textContent = `Date: Not available`;
    }

    // Add performance indicator
    const performanceIndicator = document.createElement("div");
    performanceIndicator.classList.add("performance-indicator");
    const percentageNum = parseFloat(result.percentage);
    if (percentageNum >= 80) {
      performanceIndicator.classList.add("excellent");
      performanceIndicator.textContent = "Excellent";
    } else if (percentageNum >= 60) {
      performanceIndicator.classList.add("good");
      performanceIndicator.textContent = "Good";
    } else if (percentageNum >= 40) {
      performanceIndicator.classList.add("average");
      performanceIndicator.textContent = "Average";
    } else {
      performanceIndicator.classList.add("needs-improvement");
      performanceIndicator.textContent = "Needs Improvement";
    } // Add View Details button (only if we have a valid quiz code)
    const detailsButton = document.createElement("a");
    detailsButton.classList.add("btn-details");
    detailsButton.textContent = "View Details";

    // Debug logging
    console.log("Processing result:", result);
    console.log("Quiz Code:", result.quizCode);
    console.log("User Role:", userRole);
    console.log("User ID:", userId);

    // Only create link if we have a valid quiz code
    if (
      result.quizCode &&
      result.quizCode.trim() !== "" &&
      result.quizCode !== "undefined" &&
      result.quizCode !== "null"
    ) {
      let detailsUrl = `/myaccount/test-report/test-details/?test_code=${encodeURIComponent(
        result.quizCode
      )}`;

      // For recruiters and master_admins, add email parameter if available
      if ((userRole === "recruiter" || userRole === "master_admin") && userId) {
        detailsUrl += `&email=${encodeURIComponent(userId)}`;
      }

      console.log("Generated Details URL:", detailsUrl);
      detailsButton.href = detailsUrl;
    } else {
      // Disable button if no quiz code available
      detailsButton.style.opacity = "0.5";
      detailsButton.style.cursor = "not-allowed";
      detailsButton.textContent = "Details Unavailable";
      detailsButton.onclick = (e) => {
        e.preventDefault();
        alert("Detailed report is not available for this assessment.");
      };
      console.log("Quiz code missing for result:", result);
    }

    resultBox.appendChild(quizTitle);
    resultBox.appendChild(score);
    resultBox.appendChild(percentage);
    resultBox.appendChild(performanceIndicator);
    resultBox.appendChild(timestamp);
    resultBox.appendChild(detailsButton);

    reportContainer.appendChild(resultBox);
  });
}

// Function to get user role for access control
async function getUserRole(userEmail) {
  try {
    const userProfileRef = doc(db, "user_profile", userEmail);
    const userProfileDoc = await getDoc(userProfileRef);

    if (userProfileDoc.exists()) {
      const userData = userProfileDoc.data();
      return userData.role || "user"; // Default to 'user' if no role specified
    }

    return "user"; // Default role
  } catch (error) {
    console.error("Error fetching user role:", error);
    return "user"; // Default role on error
  }
}

// Debug function to check Firebase connection
async function debugFirebaseConnection() {
  try {
    // console.log("Testing Firebase connection..."); // Debug: Connection test initiation
    // console.log("Auth state:", auth.currentUser); // Debug: Current auth state
    // console.log("Database instance:", db); // Debug: Database instance status

    if (auth.currentUser) {
      // console.log("User email:", auth.currentUser.email); // Debug: User email
      // console.log("User ID:", auth.currentUser.uid); // Debug: User ID
    }

    return true;
  } catch (error) {
    console.error("Firebase connection error:", error);
    return false;
  }
}

// Call debug function on load in development
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  debugFirebaseConnection();
}
