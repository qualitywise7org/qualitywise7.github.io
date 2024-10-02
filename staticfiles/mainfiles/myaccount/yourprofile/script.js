const email = localStorage.getItem("email");
let imageUrl = "";
let cvUrl = "";


// $(document).ready(function(){

//   $(".multistep .form-box .button-row .next").click(function()
// {
//   $(this).parents(".form-box").fadeout('fast');
//   $(this).parents(".form-box").Nxext().fadein('fast');
// });
// })
// ;
// $(document).ready(function(){

//   $(".multistep .form-box .button-row .prev").click(function()
// {
//   $(this).parents(".form-box").fadein('fast');
//   $(this).parents(".form-box").perv().fadeout('fast');
// });
// });


if (!email) {
  window.location.href = "/login/";
}

async function isUser() {
  console.log("isUser");

  const docRef = doc(db, "user_profile", email);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      var userData = docSnap.data();
      populateForm(userData);
      $("#btn").html("Update Details");
    } else {
      await fetchFromLeadCollection();
    }
  } catch (error) {
    console.error("Error getting user data from user_profile:", error);
  }
}

async function fetchFromLeadCollection() {
  const leadRef = collection(db, "lead");
  const leadQuery = query(leadRef, where("email", "==", email));
  try {
    const leadSnapshot = await getDocs(leadQuery);
    if (!leadSnapshot.empty) {
      const leadData = leadSnapshot.docs[0].data();
      populateForm(leadData);
    } else {
      console.log("No data found in lead collection either.");
    }
  } catch (error) {
    console.error("Error getting data from lead collection:", error);
  }
}

function calculateCompletion(userData) {
  let completion = {
    about: 0,
    education: 0,
    experience: 0,
    skills: 0,
  };

  // About Section Completion
  const aboutFields = ["firstName", "middleName", "lastName", "gender", "category", "address", "phoneNo", "linkedin", "github"];
  let filledAboutFields = aboutFields.filter(field => userData.about?.[field]).length;
  completion.about = (filledAboutFields / aboutFields.length) * 100;

  // Education Section Completion
  if (userData.education?.length) {
    let eduCount = userData.education.length;
    let filledEducation = userData.education.filter(edu => edu.school && edu.college && edu.degree && edu.start_date && edu.graduation_date && edu.city && edu.percentage).length;
    completion.education = (filledEducation / eduCount) * 100;
  }

  // Experience Section Completion
  if (userData.experience?.length) {
    let expCount = userData.experience.length;
    let filledExperience = userData.experience.filter(exp => exp.job_title && exp.company && exp.start_date && exp.end_date && exp.city && exp.description).length;
    completion.experience = (filledExperience / expCount) * 100;
  }

  // Skills Section Completion
  if (userData.skills?.length) {
    completion.skills = 100;
  }

  return completion;
}

function updateProgressBars(completion) {
  document.getElementById('about-progress').style.width = `${completion.about}%`;
  document.getElementById('about-progress').innerText = `${Math.round(completion.about)}%`;

  document.getElementById('education-progress').style.width = `${completion.education}%`;
  document.getElementById('education-progress').innerText = `${Math.round(completion.education)}%`;

  document.getElementById('experience-progress').style.width = `${completion.experience}%`;
  document.getElementById('experience-progress').innerText = `${Math.round(completion.experience)}%`;

  document.getElementById('skills-progress').style.width = `${completion.skills}%`;
  document.getElementById('skills-progress').innerText = `${Math.round(completion.skills)}%`;
}

function populateForm(userData) {
  $("#firstname").val(userData.about?.firstName || "");
  $("#middlename").val(userData.about?.middleName || "");
  $("#lastname").val(userData.about?.lastName || "");
  $("#gender").val(userData.about?.gender || "");
  $("#category").val(userData.about?.category || "");
  $("#address").val(userData.about?.address || "");
  $("#email").html(email);
  $("#phoneno").val(userData.about?.phoneNo || "");
  $("#linkedin").val(userData.about?.linkedin || "");
  $("#github").val(userData.about?.github || "");
  imageUrl = userData.about?.image || "https://www.pngall.com/wp-content/uploads/5/Profile.png";
  cvUrl = userData.about?.cv || "";

  const profileImage = document.getElementById("show_image");
  profileImage.src = imageUrl;

  // Update Education section
  $('[data-repeater-list="group-education"]')
    .find("[data-repeater-item]")
    .each(function (index) {
      var edu = userData?.education?.[index];
      if (edu) {
        $(this)
          .find("#school")
          .val(edu.school || "");
        $(this)
          .find("#college")
          .val(edu.college || "");
        $(this)
          .find("#degree")
          .val(edu.degree || "");
        $(this)
          .find("#sdate")
          .val(edu.start_date || "");
        $(this)
          .find("#edate")
          .val(edu.graduation_date || "");
        $(this)
          .find("#city")
          .val(edu.city || "");
        $(this)
          .find("#Percentage")
          .val(edu.percentage || "");
      }
    });

  // Update Experience section
  $('[data-repeater-list="group-experience"]')
    .find("[data-repeater-item]")
    .each(function (index) {
      var exp = userData?.experience?.[index];
      if (exp) {
        $(this)
          .find("#job_title")
          .val(exp.job_title || "");
        $(this)
          .find("#company")
          .val(exp.company || "");
        $(this)
          .find("#exp_start_date")
          .val(exp.start_date || "");
        $(this)
          .find("#exp_end_date")
          .val(exp.end_date || "");
        $(this)
          .find("#exp_city")
          .val(exp.city || "");
        $(this)
          .find("#exp_description")
          .val(exp.description || "");
      }
    });

  // Update Skills section
  $('[data-repeater-list="group-skill"]')
    .find("[data-repeater-item]")
    .each(function (index) {
      var skillValue = userData.skills?.[index];
      if (skillValue) {
        $(this).find(".skill").val(skillValue);
      }
    });

  // Calculate and update completion status
  const completion = calculateCompletion(userData);
  updateProgressBars(completion);
  
  Toastify({
    text: "Fetching Details",
    duration: 3000,
    newWindow: true,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: "linear-gradient(to right, #0d6efd, #586ba6)",
      borderRadius: "10px",
    },
  }).showToast();
}

$(document).ready(function () {
  $(".repeater").repeater({
    initEmpty: false,
    defaultValues: {
      "text-input": "",
    },
    show: function () {
      $(this).slideDown();
    },
    hide: function (deleteElement) {
      $(this).slideUp(deleteElement);
    },
    isFirstItemUndeletable: true,
  });
});

function collectFormData() {
  var formData = {};
  var aboutData = {};
  aboutData.firstName = $("#firstname").val() || "";
  aboutData.middleName = $("#middlename").val() || "";
  aboutData.lastName = $("#lastname").val() || "";
  aboutData.image = imageUrl || "";
  aboutData.gender = $("#gender").val() || "";
  aboutData.category = $("#category").val() || "";
  aboutData.address = $("#address").val() || "";
  aboutData.email = email;
  aboutData.phoneNo = $("#phoneno").val() || "";
  aboutData.linkedin = $("#linkedin").val() || "";
  aboutData.github = $("#github").val() || "";
  aboutData.cv = cvUrl || "";
  formData.about = aboutData;

  // Collect data for the "Education" section
  var education = [];
  $('[data-repeater-list="group-education"]')
    .find("[data-repeater-item]")
    .each(function () {
      var eduItem = {};
      eduItem.school = $("#school", this).val() || "";
      eduItem.college = $("#college", this).val() || "";
      eduItem.degree = $("#degree", this).val() || "";
      eduItem.start_date = $("#sdate", this).val() || "";
      eduItem.graduation_date = $("#edate", this).val() || "";
      eduItem.city = $("#city", this).val() || "";
      eduItem.percentage = $("#Percentage", this).val() || "";
      education.push(eduItem);
    });

  formData.education = education;

  // Collect data for the "Experience" section
  var experience = [];
  $('[data-repeater-list="group-experience"]')
    .find("[data-repeater-item]")
    .each(function () {
      var expItem = {};
      expItem.job_title = $("#job_title", this).val() || "";
      expItem.company = $("#company", this).val() || "";
      expItem.start_date = $("#exp_start_date", this).val() || "";
      expItem.end_date = $("#exp_end_date", this).val() || "";
      expItem.city = $("#exp_city", this).val() || "";
      expItem.description = $("#exp_description", this).val() || "";
      experience.push(expItem);
    });
  formData.experience = experience;

  // Collect data for the "Skills" section
  var skills = [];
  $('[data-repeater-list="group-skill"]')
    .find("[data-repeater-item]")
    .each(function () {
      var skillValue = $(this).find(".skill").val().trim() || "";
      if (skillValue !== "") {
        skills.push(skillValue);
      }
    });

  formData.skills = skills;

  return formData;
}

async function uploadImageAndGetURL(file) {
  const imageRef = ref(storage, "user_images/" + file.name);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);
  return url; // Return empty string if URL is undefined
}

async function saveFormDataToDatabase() {
  var formData = collectFormData();

  const imageFile = document.getElementById("image").files[0];
  if (imageFile) {
    imageUrl = await uploadImageAndGetURL(imageFile);
    formData.about.image = imageUrl;
    console.log("Image URL: ", imageUrl);
  }

  const userProfileRef = doc(db, "user_profile", email);

  await setDoc(userProfileRef, formData)
    .then(() => {
      Toastify({
        text: "Details Successfully Submitted",
        duration: 3000,
        newWindow: true,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #0d6efd, #586ba6)",
          borderRadius: "10px",
        },
      }).showToast();
      setTimeout(() => {
        window.location.href = "/myaccount/yourprofile/profile_saved";
      }, 3000);
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
}

$("#btn").on("click", function () {
  saveFormDataToDatabase();
});

isUser();

const skillInput = document.getElementById('skillInput');
  const dataList = document.getElementById('autocomplete-list');
  const selectedSkillsContainer = document.getElementById('selectedSkills');

  skillInput.addEventListener('input', function () {
    const inputValue = this.value.toLowerCase();
    dataList.innerHTML = '';

    if (inputValue) {
      const filteredSkills = skills_masterdata.filter(skill => skill.name.toLowerCase().includes(inputValue));

      filteredSkills.forEach(skill => {
        const item = document.createElement('div');
        item.textContent = skill.name;
        item.addEventListener('click', function () {
          addSkill(skill.name);
        });
        dataList.appendChild(item);
      });
    }
  });

  skillInput.addEventListener('input', function (e) {
    if (e.inputType === 'insertText' && e.data === ',') {
      addSkill(e.target.value.slice(0, -1).trim());
    }
  });

  skillInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(e.target.value.trim());
    }
  });

  function addSkill(skill) {
    if (skill && !Array.from(selectedSkillsContainer.children).some(child => child.textContent.trim() === skill)) {
      const skillTag = document.createElement('div');
      skillTag.className = 'skill-tag';
      skillTag.textContent = skill;
      const removeButton = document.createElement('button');
      removeButton.className = 'remove-skill';
      removeButton.textContent = 'x';
      removeButton.onclick = () => skillTag.remove();
      skillTag.appendChild(removeButton);
      selectedSkillsContainer.appendChild(skillTag);
    }
    skillInput.value = '';
    dataList.innerHTML = ''; // Clear the dropdown after adding a skill
  }


  //progress 

// const prevBtns = document.querySelectorAll(".prev")
// const nextBtns = document.querySelectorAll(".Next")
// const bars = document.getElementById(".bars")
// const formSteps = document.querySelectorAll(".form-box")
// const progressSteps = document.getElementById(".progress-step")

// let formStepsNum = 0
// nextBtns.forEach(btn => {
//   btn.addEventListener("click", () => {
//       formStepsNum++;
//       updateFormSteps();
//       updateProgressBars()
//   })
// })

// prevBtns.forEach ((btn) => {
//   btn.addEventListener("click", () => {
//       formStepsNum--;
//       updateFormSteps();
//       updateProgressBars()
//   })
// })

// function updateFormSteps(){

//     formSteps.forEach ((formStep)  => {
//       formStep.classList.contains("form-box-active")
//       formStep.classList.remove("form-box-active")
//     } )
//     formSteps[formStepsNum].classList.add("form-box-active")
// }

//   function updateProgressBars(){
//     progressSteps.forEach ((progressSteps, idx)  => {
//       if(idx > formStepsNum + 1){
//         progressSteps.classList.add("progress-step-active")
//       }
//       else{
//         progressSteps.classList.remove("progress-step-active")
//       }
//     })
//   }
const prevBtns = document.querySelectorAll(".prev");
const nextBtns = document.querySelectorAll(".Next"); // Fix class name to match the one in your HTML
const barss = document.querySelectorAll(".bars"); // Use querySelectorAll for class-based selection
const formSteps = document.querySelectorAll(".form-box");
const progressSteps = document.querySelectorAll(".progress-step"); // Use querySelectorAll for multiple progress steps

console.log(progressSteps)
let formStepsNum = 0;

nextBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    console.log(progressSteps)
    formStepsNum++;
    updateFormSteps();
    updateProgressBarsss();

  });
});

prevBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    formStepsNum--;
    updateFormSteps();
    updateProgressBarsss();
  });
});

function updateFormSteps() {
  formSteps.forEach((formStep, index) => {
    formStep.classList.remove("form-box-active");
  });
  formSteps[formStepsNum].classList.add("form-box-active");
}

function updateProgressBarsss() {
  progressSteps.forEach((progressStep, index) => {
    if (index <= formStepsNum) {
      progressStep.classList.add("progress-step-active");
    } else {
      progressStep.classList.remove("progress-step-active");
    }
  });

  const barsActive = document.querySelectorAll(".progress-step-active");

  bars.style.width =
    ((barsActive.length - 1) / (progressSteps.length - 1)) * 100 + "%";
}

