
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
        assessments.forEach(
              (doc) => {
                let assessment = doc.data();
                content.push(`
                    <li>
                      <label>
                        <p>${assessment.title}</p>
                        <p>${assessment.desc}</p>
                        <a href="/test/quiz/?quizcode=${doc.id}">Start</a>
                      </label>
                    </li>`
                  );
                });
      divCont.innerHTML = `<ul> + ${content.join()} + </ul>`;
      console.log(assessments);
  }


  fetchAssessments();