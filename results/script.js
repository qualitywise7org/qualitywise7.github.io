const data = [
  {
    name: "Rohit Gupta",
    imageURL: "rohitgupta",
    description: "Learnt full stack development as internship",
    company: "Placement - currently in final year.",
    linkedinURL: "https://www.linkedin.com/in/rohit-gupta-21088b226/"
  },
  {
    name: "Shivam Dhakad",
    imageURL: "shivam",
    description:
      "Learnt back-end development in python, frontend, DSA, problem solving.",
    company: "Placement - Muthoot Bank",
    linkedinURL: "https://www.linkedin.com/in/shiv597166/"
  },
  {
    name: "Jatin Kushwah",
    imageURL: "",
    description: "Learnt full stack development as internship",
    company: "Placement - Skillops",
    linkedinURL: "https://www.linkedin.com/in/jatin-kushwah-1b6694255/"
  },
  {
    name: "Aditya jain",
    imageURL: "",
    description:
      "Learnt full stack development and product management as internship.",
    company: "Placement - got placed(company name not disclosed)",
    linkedinURL: "https://www.linkedin.com/in/aditya-jain-98606a266/"
  },
 
  {
    name: "Ayush Meena",
    imageURL: "",
    description: "Learning full stack development as internship.",
    company: "",
    linkedinURL: "https://www.linkedin.com/in/ayush-meena-ba4211251/"
  },
  
  {
    
    name: "Narayan Raghuwanshi",
      imageURL: "",
      description: "Developer who specializes in creating high-performance applications using the latest version of Next.js.",
      company: " Final year student",
      linkedinURL: "https://www.linkedin.com/in/narayan-raghuwanshi-4589b4290/"
    },
    {
    
      name: "Devraj Pun",
        imageURL: "",
        description: "Learning Full stack and problem solving as internship.",
        company: "Final year student",
        linkedinURL: "https://www.linkedin.com/in/devraj-pun-0019jb/"
      },
      {
    
        name: "Nivesh Garg",
          imageURL: "",
          description: "Learning full stack development as internship.",
          company: "",
          linkedinURL: "https://www.linkedin.com/in/nivesh-garg-865767229"
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
    // add the linkedin code in js
    if (person.linkedinURL) {
      const linkedinLink = document.createElement("a");
      linkedinLink.textContent = "LinkedIn Profile";
      linkedinLink.href = person.linkedinURL;
      linkedinLink.target = "_blank"; // Open in a new tab
      linkedinLink.rel = "noopener noreferrer"; // Security best practices
      detailDiv.appendChild(linkedinLink);
    }

    dataContainer.appendChild(detailDiv);
  });
});
