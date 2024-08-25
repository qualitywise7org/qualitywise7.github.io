const auth = getAuth(app);
const db = getFirestore(app);

let userId = null;

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userId = user.email;
      console.log(`User is logged in: ${userId}`);
      await fetchAndDisplayResults(userId);
    } else {
      alert("Please log in to check your assessment reports");
      window.location.href = "/";
    }
  });
});

async function fetchAndDisplayResults(userId) {
  try {
    console.log(`Fetching assessment results for user: ${userId}`);
    const resultsRef = doc(db, "user_assessment_results", userId);
    const resultsDoc = await getDoc(resultsRef);

    if (resultsDoc.exists()) {
      const resultsData = resultsDoc.data();
      console.log("Results Data:", resultsData);
      if (resultsData.results && resultsData.results.length > 0) {
        displayResults(resultsData.results);
      } else {
        console.log("No results found for user.");
        document.getElementById("no-results-message").style.display = "block";
      }
    } else {
      console.log("No document found for user.");
      document.getElementById("no-results-message").style.display = "block";
    }
  } catch (error) {
    console.error("Error fetching assessment results:", error);
  }
}

function displayResults(results) {
  console.log("Displaying results...");
  const reportContainer = document.getElementById("assessment-report");
  if (reportContainer) {
    console.log("Found 'assessment-report' element.");
    reportContainer.innerHTML = ""; // Clear previous results
    results.forEach(result => {
      const resultBox = document.createElement("div");
      resultBox.classList.add("assessment-box");

      const quizTitle = document.createElement("h2");
      quizTitle.textContent = result.quizCode || 'Quiz';

      const score = document.createElement("p");
      score.textContent = `Score: ${result.score}`;

      const percentage = document.createElement("p");
      percentage.textContent = `Percentage: ${result.percentage}%`;

      const timestamp = document.createElement("p");
      const date = new Date(result.timestamp.seconds * 1000);
      timestamp.textContent = `Date: ${date.toLocaleString()}`;

      resultBox.appendChild(quizTitle);
      resultBox.appendChild(score);
      resultBox.appendChild(percentage);
      resultBox.appendChild(timestamp);

      reportContainer.appendChild(resultBox);
    });
  } else {
    console.error("Element with ID 'assessment-report' not found");
  }
}
