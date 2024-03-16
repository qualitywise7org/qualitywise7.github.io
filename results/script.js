const data = [
  {
    name: "Rohit Gupta",
    imageURL: "rohitgupta",
    description: "Learnt full stack development as internship",
  },
  {
    name: "Shivam Dhakad",
    imageURL: "shivam",
    description: "Learnt back-end development in python, frontend, DSA, problem solving.", 
  },
  {
    name: "Jatin Kushwah",
    description: "Learnt full stack development as internship",
  },
  {
    name: "Aditya Jain",
    description: "Full stack developer. Placed in company(company name is not disclosed)",
  },
  {
    name: "Ayush Jain",
    description: "Full stack developer.",
  }
];

document.addEventListener("DOMContentLoaded", function() {
  const dataContainer = document.querySelector(".data");

  data.forEach(person => {
    // Create detail div
    const detailDiv = document.createElement("div");
    detailDiv.classList.add("detail");

    // Create image container
    const imgDiv = document.createElement("div");
    imgDiv.classList.add("img");
    const img = document.createElement("img");
    if(person.imageURL){
      img.src = `public/${person.imageURL}.jpg`; 
    }else{
      img.src = "https://wallpapercave.com/wp/wp9566480.png";
    }
    img.alt = person.name;
    imgDiv.appendChild(img);

    // Create classification div
    const classificationDiv = document.createElement("div");
    classificationDiv.classList.add("classification");
    const nameHeading = document.createElement("h4");
    nameHeading.textContent = person.name;
    const idParagraph = document.createElement("p");
    idParagraph.textContent = `${person.description}`;
    classificationDiv.appendChild(nameHeading);
    classificationDiv.appendChild(idParagraph);

    // Append image and classification to detail div
    detailDiv.appendChild(imgDiv);
    detailDiv.appendChild(classificationDiv);

    dataContainer.appendChild(detailDiv);
  });
});