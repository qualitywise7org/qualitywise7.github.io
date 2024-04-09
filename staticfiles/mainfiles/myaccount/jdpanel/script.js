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

// Function to populate user profiles in the table
async function populateUserProfilesTable() {
    const tableBody = document.querySelector('#userProfilesTable tbody');

    try {
        const querySnapshot = await getDocs(collection(db, "user_profile"));
        querySnapshot.forEach((documentSnapshot) => {
            const userProfile = documentSnapshot.data();

            const row = document.createElement('tr');

            // Profile Photo
            const profilePhotoCell = document.createElement('td');
            const profilePhotoImg = document.createElement('img');
            profilePhotoImg.src = userProfile.about && userProfile.about.image ? userProfile.about.image : "https://th.bing.com/th/id/OIP.yYUwl3GDU07Q5J5ttyW9fQHaHa?rs=1&pid=ImgDetMain";
            profilePhotoImg.alt = "Profile Photo";
            profilePhotoCell.appendChild(profilePhotoImg);
            row.appendChild(profilePhotoCell);

            // About Section
            const nameCell = document.createElement('td');
            nameCell.textContent = `${userProfile.about.firstName} ${userProfile.about.lastName}`;
            row.appendChild(nameCell);

            const emailCell = document.createElement('td');
            emailCell.textContent = userProfile.about.email;
            row.appendChild(emailCell);

            const genderCell = document.createElement('td');
            genderCell.textContent = userProfile.about.gender;
            row.appendChild(genderCell);

            // Education Section
            const schoolCell = document.createElement('td');
            schoolCell.textContent = userProfile.education[0].school;
            row.appendChild(schoolCell);

            const degreeCell = document.createElement('td');
            degreeCell.textContent = userProfile.education[0].degree;
            row.appendChild(degreeCell);

            const graduationDateCell = document.createElement('td');
            graduationDateCell.textContent = userProfile.education[0].graduation_date;
            row.appendChild(graduationDateCell);

            // Skills Section
            const skillsCell = document.createElement('td');
            skillsCell.textContent = userProfile.skills.join(", ");
            row.appendChild(skillsCell);

            // Rating Input
            const ratingCell = document.createElement('td');
            const ratingInput = document.createElement('input');
            ratingInput.type = 'number';
            ratingInput.value = userProfile.rating || '';
            ratingCell.appendChild(ratingInput);
            row.appendChild(ratingCell);

            // Description Input
            const descriptionCell = document.createElement('td');
            const descriptionInput = document.createElement('textarea');
            descriptionInput.rows = 3;
            descriptionInput.value = userProfile.description || '';
            descriptionCell.appendChild(descriptionInput);
            row.appendChild(descriptionCell);

            // Action (Edit Button)
            const editCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Applied_Job';
            editButton.addEventListener('click', () => {
                const userEmail = userProfile.about.email;
                console.log(userEmail);
                window.location.href = "jobs_applied/?user=" + userEmail;
                // window.location.href = path+`jobs_applied?user=${userProfile.about.email}`;
            });

            // Action (Submit Button)
            const actionCell = document.createElement('td');
            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit';
            submitButton.addEventListener('click', async () => {
                const userEmail = emailCell.textContent;
                const userRating = ratingInput.value;
                const userDescription = descriptionInput.value;
                userProfile.rating = userRating;
                userProfile.description = userDescription;

                const userProfileRef = doc(db, "user_profile", userProfile.about.email);

                await setDoc(userProfileRef, userProfile)
                    .then("updated user profile");
            });
            actionCell.appendChild(editButton);
            actionCell.appendChild(submitButton);
            actionCell.classList.add("action");
            row.appendChild(actionCell);

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error getting user profiles:", error);
    }
}

// Call the populateUserProfilesTable function to populate the table
populateUserProfilesTable();
