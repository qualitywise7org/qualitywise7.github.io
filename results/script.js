const data = [
  {
    name: "Rohit Gupta",
    imageURL: "rohitgupta",
    description: "Learnt full stack development as internship",
    company: "Placement - currently in final year.",
  },
  {
    name: "Shivam Dhakad",
    imageURL: "shivam",
    description:
      "Learnt back-end development in python, frontend, DSA, problem solving.",
    company: "Placement - Muthoot Bank",
  },
  {
    name: "Jatin Kushwah",
    imageURL: "",
    description: "Learnt full stack development as internship",
    company: "Placement - Skillops",
  },
  {
    name: "Aditya Jain",
    imageURL: "",
    description:
      "Learnt full stack development and product management as internship.",
    company: "Placement - got placed(company name not disclosed)",
  },
  {
    name: "Ayush Jain",
    imageURL: "",
    description: "Learning full stack development as internship.",
    company: "",
  },
];

document.addEventListener("DOMContentLoaded", function () {
  const dataContainer = document.querySelector(".data");

  data.forEach((person) => {
    // Create detail div
    const detailDiv = document.createElement("div");
    detailDiv.classList.add("detail");

    // Create image container
    const imgDiv = document.createElement("div");
    imgDiv.classList.add("img");
    const img = document.createElement("img");
    person.imageURL
      ? (img.src = `public/${person.imageURL}.jpg`)
      : (img.src = "https://wallpapercave.com/wp/wp9566480.png");
    img.alt = person.name;
    imgDiv.appendChild(img);

    // Create classification div
    const classificationDiv = document.createElement("div");
    classificationDiv.classList.add("classification");
    const nameHeading = document.createElement("h4");
    nameHeading.textContent = person.name;
    const idParagraph = document.createElement("p");
    const companyParagraph = document.createElement("p");
    idParagraph.textContent = `${person.description}`;
    idParagraph.style.color = "#dee2e6";
    companyParagraph.textContent = `${person.company}`;
    companyParagraph.style.fontWeight = "bold";
    classificationDiv.appendChild(nameHeading);
    classificationDiv.appendChild(idParagraph);
    classificationDiv.appendChild(companyParagraph);

    // Append image and classification to detail div
    detailDiv.appendChild(imgDiv);
    detailDiv.appendChild(classificationDiv);

    dataContainer.appendChild(detailDiv);
  });
});
