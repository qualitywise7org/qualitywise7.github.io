const email = localStorage.getItem("email");
let imageUrl = "";
let cvUrl = "";

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
  imageUrl =
    userData.about?.image ||
    "https://www.pngall.com/wp-content/uploads/5/Profile.png";
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
