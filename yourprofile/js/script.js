import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getFirestore,
  getDoc,
  setDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

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

$(document).ready(function () {
    $('.repeater').repeater({
        initEmpty: false,
        defaultValues: {
            'text-input': ''
        },
        show: function () {
            $(this).slideDown();
        },
        hide: function (deleteElement) {
            $(this).slideUp(deleteElement);;
        },
        isFirstItemUndeletable: true
    })
})



function collectFormData() {
    var formData = {}; // Initialize formData object

    // Collect data for the "About" section
    var aboutData = {};
    aboutData.firstName = $('#firstname').val();
    aboutData.middleName = $('#middlename').val();
    aboutData.lastName = $('#lastname').val();
    aboutData.image = $('#image').val();
    aboutData.gender = $('#gender').val();
    aboutData.category = $('#category').val();
    aboutData.address = $('#address').val();
    aboutData.email = $('#email').val();
    aboutData.phoneNo = $('#phoneno').val();
    aboutData.linkedin = $('#linkedin').val();
    aboutData.github = $('#github').val();

    formData.about = aboutData;

    // Collect data for the "Education" section
    var education = [];
    $('[data-repeater-list="group-education"]').find('[data-repeater-item]').each(function () {
        var eduItem = {};
        eduItem.school = $('#school', this).val();
        eduItem.degree = $('#degree', this).val();
        eduItem.start_date = $('#sdate', this).val();
        eduItem.graduation_date = $('#edate', this).val();
        eduItem.city = $('#city', this).val();
        eduItem.percentage = $('#Percentage', this).val();
        education.push(eduItem);
    });

    formData.education = education;

    // Collect data for the "Skills" section
    var skills = [];
    $('[data-repeater-list="group-skill"]').find('[data-repeater-item]').each(function () {
        var skillValue = $(this).find('.skill').val().trim();
        if (skillValue !== '') {
            skills.push(skillValue);
        }
    });

    formData.skills = skills;

    return formData;
}

function saveFormDataToDatabase() {
    var formData = collectFormData();

    const formDataRef = doc(db, "formData", "formData");
 
    setDoc(formDataRef, formData)
      .then(() => {
        console.log("Document successfully written!");
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
}

$('#btn').on('click', function () {
    saveFormDataToDatabase();
});



