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
  
async function updateProfile(userProfile) {  
  let userProfileRef;
  if (userProfile.email) {
      userProfileRef = doc(db, "userProfile", userProfile.email); // Use id if available
  } else {
      console.error("Cannot update profile: No unique identifier found");
      return;
  }

  try {
      const snap = await getDocs(userProfileRef);
      if(snap.exists()) {
          const existingData = snap.data();
          userProfile = {...existingData,...userProfile };  
          await setDoc(userProfileRef, userProfile);
          console.log("Updated user profile");
      } else {
          console.error("User profile not found");
      }
  } catch (error) {
      console.error("Error updating user profile:", error);
  }
}

 
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

  // Rating Input
  const ratingInputDiv = document.createElement("div");
  ratingInputDiv.classList.add("details-section");
  ratingInputDiv.innerHTML = `
        <h2>Rating</h2>
        <input type="number" class="rating-input" placeholder="${userProfile.overallRating || 'Enter overall rating'}" value="${userProfile.overallRating || ''}">
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
    const rating = document.querySelector(".rating-input").value;
    const description = document.querySelector(".description-input").value;

    userProfile.overallRating = rating;
    userProfile.description = description;

    try {
      await updateProfile(userProfile);
      console.log("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  });
  cardDiv.appendChild(submitButton);

  // Append the card to the container
  const containerDiv = document.querySelector(".container");
  containerDiv.appendChild(cardDiv);
}

async function getAllUserProfiles() {
  try {
    const querySnapshot = await getDocs(collection(db, "userProfile"));
    querySnapshot.forEach((doc) => {
      const userProfile = doc.data(); 
      generateUserProfileCard(userProfile);
    });
  } catch (error) {
    console.error("Error getting user profiles:", error);
  }
}

getAllUserProfiles();
 