import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Initialize Firebase app
const firebaseConfig = {
  apiKey: "AIzaSyDzoJJ_325VL_axuuAFzDf3Bwt_ENzu2rM",
  authDomain: "jobsdoor360-39b87.firebaseapp.com",
  databaseURL: "https://jobsdoor360-39b87-default-rtdb.firebaseio.com",
  projectId: "jobsdoor360-39b87",
  storageBucket: "jobsdoor360-39b87.appspot.com",
  messagingSenderId: "326416618185",
  appId: "1:326416618185:web:de19e90fe4f06006ef3318",
  measurementId: "G-60RHEMJNM6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const data = await getAllData();
console.log(data);


async function getAllData() {
  let Data = [];  

  try {
    const querySnapshot = await getDocs(collection(db, "hiring"));
    querySnapshot.forEach((doc) => {
      Data.push(doc.data()); 
    });
  } catch (error) {
    console.error("Error getting data from collection:", error);
  } 
  return Data; 
}
  
 
// Function to generate a card for a user profile
function generateUserProfileCard(userProfile) {
  // Create a div element for the card
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  // Set unique email identifier as a data attribute
  cardDiv.dataset.email = userProfile.about.email;

  // Profile Photo
  const profilePhotoDiv = document.createElement("div");
  profilePhotoDiv.classList.add("profile-photo");
  const profilePhotoImg = document.createElement("img");
  profilePhotoImg.src = userProfile.about && userProfile.about.image ? userProfile.about.image : "https://th.bing.com/th/id/OIP.yYUwl3GDU07Q5J5ttyW9fQHaHa?rs=1&pid=ImgDetMain";
  profilePhotoImg.alt = "Profile Photo";
  profilePhotoDiv.appendChild(profilePhotoImg);
  cardDiv.appendChild(profilePhotoDiv);

  // Rating Input
  const ratingInputDiv = document.createElement("div");
  ratingInputDiv.classList.add("details-section");
  ratingInputDiv.innerHTML = `
        <h2>Rating</h2>
        <input type="number" class="rating-input" placeholder="${userProfile.rating || 'Enter overall rating'}" value="${userProfile.overallRating || ''}">
      `;
  cardDiv.appendChild(ratingInputDiv);

  // Description Input
  const descriptionInputDiv = document.createElement("div");
  descriptionInputDiv.classList.add("details-section");
  descriptionInputDiv.innerHTML = `
        <h2>Description</h2>
        <textarea class="description-input" rows="5" placeholder="${userProfile.description || 'Enter description'}">${userProfile.description || ''}</textarea>
      `;
  cardDiv.appendChild(descriptionInputDiv);

  // About Section
  const aboutDiv = document.createElement("div");
  aboutDiv.classList.add("details-section");
  aboutDiv.innerHTML = `
        <h2>About</h2>
        <p><strong>Name:</strong> ${userProfile.about.firstName} ${userProfile.about.lastName}</p>
        <p><strong>Email:</strong> ${userProfile.about.email}</p>
        <p><strong>Gender:</strong> ${userProfile.about.gender}</p>
      `;
  cardDiv.appendChild(aboutDiv);

  // Education Section
  const educationDiv = document.createElement("div");
  educationDiv.classList.add("details-section");
  educationDiv.innerHTML = `
        <h2>Education</h2>
        <p><strong>School:</strong> ${userProfile.education[0].school}</p>
        <p><strong>Degree:</strong> ${userProfile.education[0].degree}</p>
        <p><strong>Graduation Date:</strong> ${userProfile.education[0].graduation_date}</p>
      `;
  cardDiv.appendChild(educationDiv);

  // Skills Section
  const skillsDiv = document.createElement("div");
  skillsDiv.classList.add("details-section");
  skillsDiv.innerHTML = `
        <h2>Skills</h2>
        <p>${userProfile.skills.join(", ")}</p>
      `;
  cardDiv.appendChild(skillsDiv);

  // Submit Button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.classList.add("submit-button");
  submitButton.addEventListener("click", async () => {
    const cardEmail = cardDiv.dataset.email; // Get the email associated with the card
    const rating = cardDiv.querySelector(".rating-input").value;
    const description = cardDiv.querySelector(".description-input").value;
    userProfile.rating = rating;
    userProfile.description = description; 
    const userProfileRef = doc(db, "user_profile", userProfile.about.email);
    await setDoc(userProfileRef, userProfile); 
  });
  cardDiv.appendChild(submitButton);

  // Append the card to the container
  const containerDiv = document.querySelector(".container");
  containerDiv.appendChild(cardDiv);
}

async function getAllUserProfiles() {
  try {
    const querySnapshot = await getDocs(collection(db, "user_profile"));
    querySnapshot.forEach((doc) => {
      const userProfile = doc.data(); 
      generateUserProfileCard(userProfile);
    });
  } catch (error) {
    console.error("Error getting user profiles:", error);
  }
}

getAllUserProfiles();