// Get the authenticated user's ID
let userId = null;
let userData = {};
let isPopupOpen = false;

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
    let querySnapshot = await getDocs(collection(db, "assessment"));
    console.log(`Assessments found`);
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
        <form action="/test/quiz/" method="get">
          <button type="button" class="btn-start" data-popup-id="${doc.id}">Start Assessment</button>
          <input type="hidden" name="quizcode" value="${doc.id}">
        </form>
      </div>
    `);
  });
  divCont.innerHTML = content.join('');

  // Add event listeners to the dynamically created buttons
  document.querySelectorAll('.btn-start').forEach(button => {
    button.addEventListener('click', (e) => openPopup(button.getAttribute('data-popup-id'), e.target.form));
  });

  document.querySelectorAll('.btn-back').forEach(button => {
    button.addEventListener('click', () => closePopup());
  });

  document.querySelectorAll('.btn-submit').forEach(button => {
    button.addEventListener('click', () => closePopup());
  });

  console.log(assessments);
}

function openPopup(popupId, form) {
  if (isPopupOpen) return;

  let popupTemplate = document.getElementById("popup-template").cloneNode(true);
  popupTemplate.style.display = 'block';
  popupTemplate.id = `popup-${popupId}`;
  document.body.appendChild(popupTemplate);

  let quizCodeInput = popupTemplate.querySelector('input[name="quizcode"]');
  quizCodeInput.value = popupId;

  let submitButton = popupTemplate.querySelector('.btn-submit');
  submitButton.setAttribute('data-popup-id', popupId);
  submitButton.addEventListener('click', () => {
    form.submit();
  });

  popupTemplate.querySelector('.btn-back').addEventListener('click', () => closePopup(popupTemplate));

  document.getElementById('overlay').style.display = 'block';
  popupTemplate.classList.add("open-popup");
  document.body.classList.add("no-scroll");
  isPopupOpen = true;
}

function closePopup(popup) {
  document.querySelector('.open-popup').remove();
  document.getElementById('overlay').style.display = 'none';
  document.body.classList.remove("no-scroll");
  isPopupOpen = false;
}

fetchAssessments();
