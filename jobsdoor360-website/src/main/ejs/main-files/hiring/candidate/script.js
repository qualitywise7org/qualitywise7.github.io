// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);

// Function to fetch candidates from Firebase
function fetchCandidates() {
  const candidateList = document.getElementById("candidate-list");
  candidateList.innerHTML = ""; // Clear previous data

  const candidatesRef = firebase.database().ref("candidates");
  candidatesRef.once("value", function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
      const candidate = childSnapshot.val();
      const row = `<tr>
                     <td>${candidate.id}</td>
                     <td>${candidate.name}</td>
                     <td>${candidate.email}</td>
                     <td>${candidate.skills}</td>
                  </tr>`;
      candidateList.innerHTML += row;
    });
  });
}

// Function to search candidates
function searchCandidates() {
  // Implement search functionality here
}

// Fetch candidates when the page loads
fetchCandidates();
