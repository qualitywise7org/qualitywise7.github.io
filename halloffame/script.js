const data = [
      {
        name: "John Doe",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        studentId: "12345"
      },
      {
        name: "Jane Smith",
        description: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        studentId: "67890"
      },
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
        img.src = "public/image.png"; 
        img.alt = person.name;
        imgDiv.appendChild(img);
    
        // Create classification div
        const classificationDiv = document.createElement("div");
        classificationDiv.classList.add("classification");
        const nameHeading = document.createElement("h4");
        nameHeading.textContent = person.name;
        const idParagraph = document.createElement("p");
        idParagraph.textContent = `Student ID: ${person.studentId}`;
        classificationDiv.appendChild(nameHeading);
        classificationDiv.appendChild(idParagraph);
    
        // Append image and classification to detail div
        detailDiv.appendChild(imgDiv);
        detailDiv.appendChild(classificationDiv);
    
        dataContainer.appendChild(detailDiv);
      });
    });
    