import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  writeBatch,
  setDoc,
  addDoc,
  updateDoc,
  orderBy // <-- Add this
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";



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
    const assessmentsQuery = query(collection(db, "assessment"), orderBy("title", "asc"));
    let querySnapshot = await getDocs(assessmentsQuery);
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

setupSearch();
}



function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const assessmentBoxes = Array.from(document.getElementsByClassName("assessment-box"));

  searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase();
    assessmentBoxes.forEach(box => {
      const title = box.querySelector(".assessment-title").textContent.toLowerCase();
      box.style.display = title.includes(searchValue) ? "flex" : "none";
    });
  });
}

// Initial fetch of assessments
fetchAssessments();