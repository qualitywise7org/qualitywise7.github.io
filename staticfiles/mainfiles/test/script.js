// ============================================================
// Test list page (/test/). Lists the available tests as cards.
// Unified reader: pulls tests from the new `tests` collection (certificate
// and mock types; Findme has its own page) AND the legacy `assessment`
// collection, merges them by id, and renders a "Start" card for each.
// Clicking a card opens /test/quiz/?quizcode=<id>.
// Uses the Firebase window globals set by dbconfig.js (loaded in the footer).
// ============================================================
let userId = null;
let userData = {};

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in to attempt an assessment");
    window.location.href = "/";
  }
});

async function fetchAssessments() {
  const byId = new Map(); // id -> { id, title }

  // 1. unified `tests` collection (certificate + mock; findme has its own page)
  try {
    const testsSnap = await getDocs(collection(db, "tests"));
    testsSnap.forEach((d) => {
      const t = d.data();
      if (t.feature_type === "findme_tests") return;
      if (t.isActive === false) return;
      byId.set(d.id, { id: d.id, title: t.title || d.id });
    });
    console.log(`Loaded ${byId.size} test(s) from tests collection`);
  } catch (error) {
    console.warn("tests collection read failed (will still show assessments):", error);
  }

  // 2. legacy `assessment` collection (kept for backward compatibility).
  //    Does not overwrite a unified test with the same id.
  try {
    const assessmentsQuery = query(collection(db, "assessment"), orderBy("title", "asc"));
    const querySnapshot = await getDocs(assessmentsQuery);
    querySnapshot.forEach((d) => {
      if (!byId.has(d.id)) byId.set(d.id, { id: d.id, title: d.data().title || d.id });
    });
  } catch (error) {
    console.error("Failed to fetch assessments:", error);
  }

  const list = Array.from(byId.values()).sort((a, b) =>
    (a.title || "").localeCompare(b.title || "")
  );
  displayCards(list);
}

function displayCards(assessments) {
  const divCont = document.getElementById("assessment");

  let content = [];
  
  // Add Psychometric Test Card
  content.push(`
    <div class="assessment-box psychometric-box">
      <h2 class="assessment-title">🧠 Psychometric Assessments</h2>
      <p class="assessment-description">Personality, Cognitive, and Behavioral Tests</p>
      <form action="/test/quiz/" method="get">
        <input type="hidden" name="quizcode" value="psychometric">
        <button type="submit" class="btn-start">Start Psychometric Test</button>
      </form>
    </div>
  `);
  
  assessments.forEach((item) => {
    content.push(`
      <div class="assessment-box">
        <h2 class="assessment-title">${item.title}</h2>
        <form action="/test/quiz/" method="get">
          <input type="hidden" name="quizcode" value="${item.id}">
          <button type="submit" class="btn-start">Start Assessment</button>
        </form>
      </div>
    `);
  });
  divCont.innerHTML = content.join("");

  setupSearch();
}

function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const assessmentBoxes = Array.from(
    document.getElementsByClassName("assessment-box")
  );

  searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase();
    assessmentBoxes.forEach((box) => {
      const title = box
        .querySelector(".assessment-title")
        .textContent.toLowerCase();
      box.style.display = title.includes(searchValue) ? "flex" : "none";
    });
  });
}

// Initial fetch of assessments
fetchAssessments();
