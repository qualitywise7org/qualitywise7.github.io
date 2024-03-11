import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
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

// Function to generate a card for a user profile
function generateUserProfileCard(userProfile) {
  // Create a div element for the card
  const cardDiv = document.createElement("div");
  cardDiv.classList.add("card");

  // Profile Photo
  const profilePhotoDiv = document.createElement("div");
  profilePhotoDiv.classList.add("profile-photo");
  const profilePhotoImg = document.createElement("img");
  profilePhotoImg.src = userProfile.about && userProfile.about.image ? userProfile.about.image : "https://th.bing.com/th/id/OIP.yYUwl3GDU07Q5J5ttyW9fQHaHa?rs=1&pid=ImgDetMain";
  profilePhotoImg.alt = "Profile Photo";
  profilePhotoDiv.appendChild(profilePhotoImg);
  cardDiv.appendChild(profilePhotoDiv);

  // Rating Section
  const ratingDiv = document.createElement("div");
  ratingDiv.classList.add("rating-section");
  ratingDiv.innerHTML = `
        <h2>Rating</h2>
        <p><strong>Overall Rating:</strong> ${userProfile.overallRating}</p>
      `;
  cardDiv.appendChild(ratingDiv);

  // Feedback Section
  const feedbackDiv = document.createElement("div");
  feedbackDiv.classList.add("feedback-section");
  feedbackDiv.innerHTML = `
        <h2>Professional Feedback</h2>
        <p>${userProfile.description}</p>
      `;
  cardDiv.appendChild(feedbackDiv);

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
        <!-- Add education details here -->
      `;
  // Iterate over education details and add them to the educationDiv
  userProfile.education.forEach((edu) => {
    const eduParagraph = document.createElement("p");
    eduParagraph.innerHTML = `<strong>School:</strong> ${edu.school}, <strong>Degree:</strong> ${edu.degree}, <strong>Graduation Date:</strong> ${edu.graduation_date}`;
    educationDiv.appendChild(eduParagraph);
  });
  cardDiv.appendChild(educationDiv);

  // Skills Section
  const skillsDiv = document.createElement("div");
  skillsDiv.classList.add("details-section");
  skillsDiv.innerHTML = `
        <h2>Skills</h2>
        <!-- Add skills here -->
      `;
  // Iterate over skills and add them to the skillsDiv
  userProfile.skills.forEach((skill) => {
    const skillParagraph = document.createElement("p");
    skillParagraph.textContent = skill;
    skillsDiv.appendChild(skillParagraph);
  });
  cardDiv.appendChild(skillsDiv);

  // Submit Button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Submit";
  submitButton.classList.add("submit-button");
  submitButton.addEventListener("click", () => {
    const rating = ratingInput.value;
    const feedback = feedbackInput.value;
    userProfile.rating = rating;
    userProfile.feedback = feedback;
    updateProfile(userProfile);
  });
    cardDiv.appendChild(submitButton);

  // Append the card to the container
  const containerDiv = document.querySelector(".container");
  containerDiv.appendChild(cardDiv);
}

// Function to retrieve all user profiles
// async function getAllUserProfiles() {
//   const userProfiles = {};
//   try {
//     const querySnapshot = await getDocs(collection(db, "userProfile"));
//     console.log(querySnapshot);
//     querySnapshot.forEach((doc) => {
//       generateUserProfileCard(doc.data);
//     });
//   } catch (error) {
//     console.error("Error getting user profiles:", error);
//   }
// }

async function getAllUserProfiles() {
  try {
    const querySnapshot = await getDocs(collection(db, "userProfile"));
    querySnapshot.forEach((doc) => {
      const userProfile = doc.data();
      console.log(userProfile);
      generateUserProfileCard(userProfile);
    });
  } catch (error) {
    console.error("Error getting user profiles:", error);
  }
}

getAllUserProfiles();
