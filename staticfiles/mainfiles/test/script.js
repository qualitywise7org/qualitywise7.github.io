let userId = null;
let userData = {};

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in to attempt an assessment");
    window.location.href = "/";
  }
});

async function fetchAssessments() {
  try {
    console.log(`Fetching assessments`);
    let querySnapshot = await getDocs(collection(db, "assessment"));
    console.log(`Assessments found`);
    displayCards(querySnapshot);
  } catch (error) {
    console.error("Failed to fetch assessments:", error);
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
        <form action="/test/quiz/" method="get">
          <input type="hidden" name="quizcode" value="${doc.id}">
          <button type="submit" class="btn-start">Start Assessment</button>
        </form>
      </div>
    `);
  });
  divCont.innerHTML = content.join('');
}

fetchAssessments();
