// Get the authenticated user's ID
let userId = null;
let userData = {};

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // User is not logged in, show alert and redirect to Home page
    alert("Please log in to attempt an assessment");
    window.location.href = "/";
  }
});

async function fetchAssessments() {
  try {
    console.log(`Fetching assessments`);
    let querySnapshot = await getDocs(
      (collection(db, "assessment"))
    );
    console.log(`Assessments found`);
    // use for loop and show on html
    displayCards(querySnapshot);
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    return null;
  }
}

function displayCards(assessments) {
  const divCont = document.getElementById("assessment");

  let content = [];
  assessments.forEach((doc) => {
    let assessment = doc.data();
    content.push(`
      <div class="assessment-box">
        <h2 class="assessment-title">${assessment.title}</h2>
        <a class="btn-start" href="/test/quiz/?quizcode=${doc.id}">Start Assessment</a>
      </div>
    `);
  });
  divCont.innerHTML = content.join('');
  console.log(assessments);
}

fetchAssessments();