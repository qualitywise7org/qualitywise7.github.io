// Data Connector - Connects progress bars to the database
// This file should be loaded after progress.js and before any auth-related scripts

// Initialize with mock data for testing if needed
// Get mock data level from URL parameter for testing different completion levels
function getMockDataByLevel() {
  // Check URL for a mockLevel parameter
  const urlParams = new URLSearchParams(window.location.search);
  const mockLevel = urlParams.get("mockLevel") || "full";

  // Define different mock data sets
  const mockDataSets = {
    empty: {
      // Completely empty profile
      lookingFor: {},
      completedAssessments: 0,
      totalAssessments: 5,
    },
    minimal: {
      // Minimal data
      full_name: "Test User",
      email: "test@example.com",
      lookingFor: {
        internship: true,
      },
      completedAssessments: 1,
      totalAssessments: 5,
    },
    partial: {
      // Partially complete profile
      full_name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      dob: "1990-01-01",
      skills: ["JavaScript"],
      graduationStream: "Computer Science",
      lookingFor: {
        internship: true,
        job: false,
      },
      completedAssessments: 2,
      totalAssessments: 5,
    },
    full: {
      // Complete profile
      full_name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      dob: "1990-01-01",
      address: "123 Test St",
      gender: "Male",
      category: "General",
      skills: ["JavaScript", "HTML", "CSS"],
      experience: "2 years",
      graduationStream: "Computer Science",
      graduationDegree: "B.Tech",
      preferredLocation: "Remote",
      jobType: "Full-time",
      expectedSalary: "60000",
      jobRole: "Frontend Developer",
      lookingFor: {
        internship: true,
        job: false,
      },
      completedAssessments: 3,
      totalAssessments: 5,
    },
  };

  return mockDataSets[mockLevel] || mockDataSets.partial;
}

const mockUserData = getMockDataByLevel();

// Make mock data function available globally for testing
window.getMockDataByLevel = getMockDataByLevel;

// Add a function to quickly switch between mock data levels
window.switchMockData = function (level) {
  const mockData = getMockDataByLevel(level);
  window.setUserData(mockData);
  console.log(`Switched to mock data level: ${level}`);
  return mockData;
};

// Listen for auth state changes in the main script
document.addEventListener("userDataLoaded", function (event) {
  // This event would be dispatched by the main auth script when user data is loaded
  if (event.detail && event.detail.userData) {
    // Update our progress bars with the user data
    window.setUserData(event.detail.userData);
  }
});

// Connect to Firebase or existing user data
// First, check if user data already exists from a previous auth process
if (window.userData) {
  // Just connect to the existing user data without logging
  window.setUserData(window.userData);
} else if (localStorage.getItem("userDetails")) {
  // If not in memory but in localStorage, use that
  try {
    const userDataFromStorage = JSON.parse(localStorage.getItem("userDetails"));
    window.setUserData(userDataFromStorage);
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    // Don't use mock data automatically - wait for auth to load
  }
}

// Export a function to manually update data if needed
window.updateProgressData = function () {
  if (window.userData) {
    window.setUserData(window.userData);
  }
};

// Watch for Firebase loading after our script
// This function will periodically check if Firebase auth has been loaded
(function checkForFirebase() {
  // If we have auth already available globally
  if (window.firebase && window.firebase.auth) {
    console.log("Firebase detected, connecting to auth state changes");
    window.firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log("User is signed in with Firebase");
        // Retrieve the user data when authenticated
        // Assuming you're using Firestore
        if (window.firebase.firestore) {
          window.firebase
            .firestore()
            .collection("users")
            .doc(user.uid)
            .get()
            .then(function (doc) {
              if (doc.exists) {
                console.log("User data retrieved from Firestore");
                window.setUserData(doc.data());
              }
            })
            .catch(function (error) {
              console.error("Error getting user data:", error);
            });
        }
      }
    });
    return; // Exit if we found Firebase
  }

  // If we detect auth in a different format (imported modules)
  if (window.onAuthStateChanged || window.auth) {
    // console.log("Firebase auth module detected");
    return; // Exit as the main script should handle this
  }

  // Check again after a delay if we didn't find Firebase yet
  // but only check for a limited time to avoid infinite checking
  if (window.firebaseCheckCount === undefined) {
    window.firebaseCheckCount = 0;
  }

  if (window.firebaseCheckCount < 5) {
    // Check up to 5 times
    window.firebaseCheckCount++;
    setTimeout(checkForFirebase, 1000); // Check again in 1 second
  }
})();
