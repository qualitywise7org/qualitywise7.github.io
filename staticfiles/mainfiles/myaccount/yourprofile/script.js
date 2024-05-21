const email = localStorage.getItem("email");
let imageUrl = ""
// let cvUrl = ""
if (!email) {
    window.location.href = "/login/";
}


async function isUser() {
    console.log("isUser");
    console.log("isUser");
    const docRef = doc(db, "user_profile", email);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            var userData = docSnap.data();
            $("#btn").html("Update Details");
            $("#firstname").val(userData.about.firstName);
            $("#middlename").val(userData.about.middleName);
            $("#lastname").val(userData.about.lastName);
            $("#gender").val(userData.about.gender);
            $("#category").val(userData.about.category);
            $("#address").val(userData.about.address);
            $("#email").html(email);
            $("#phoneno").val(userData.about.phoneNo);
            $("#linkedin").val(userData.about.linkedin);
            $("#github").val(userData.about.github);
            imageUrl = userData.about.image;
            // cvUrl = userData.about.cv;

            if (!imageUrl) imageUrl = "https://www.pngall.com/wp-content/uploads/5/Profile.png";
            const profileImage = document.getElementById("show_image");
            profileImage.src = imageUrl;

            // Update HTML input values for the "Education" section
            $('[data-repeater-list="group-education"]')
                .find("[data-repeater-item]")
                .each(function (index) {
                    var eduItem = userData.education[index];
                    if (eduItem) {
                        $(this).find("#school").val(eduItem.school || "");
                        $(this).find("#degree").val(eduItem.degree || "");
                        $(this).find("#sdate").val(eduItem.start_date || "");
                        $(this).find("#edate").val(eduItem.graduation_date || "");
                        $(this).find("#city").val(eduItem.city || "");
                        $(this).find("#Percentage").val(eduItem.percentage || "");
                    }
                });

            // Update HTML input values for the "Skills" section
            $('[data-repeater-list="group-skill"]')
                .find("[data-repeater-item]")
                .each(function (index) {
                    var skillValue = userData.skills[index];
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
                    borderRadius: "10px"
                }
            }).showToast();
        }
    } catch (error) {
        console.error("Error getting user data:", error);
    }
}

isUser();

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
    // aboutData.cv = cvUrl || "";
    formData.about = aboutData;

    // Collect data for the "Education" section
    var education = [];
    $('[data-repeater-list="group-education"]')
        .find("[data-repeater-item]")
        .each(function () {
            var eduItem = {};
            eduItem.school = $("#school", this).val() || "";
            eduItem.degree = $("#degree", this).val() || "";
            eduItem.start_date = $("#sdate", this).val() || "";
            eduItem.graduation_date = $("#edate", this).val() || "";
            eduItem.city = $("#city", this).val() || "";
            eduItem.percentage = $("#Percentage", this).val() || "";
            education.push(eduItem);
        });

    formData.education = education;

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
    const imageRef = ref(storage, "userImages/" + file.name);
    await uploadBytes(imageRef, file);

    const url = await getDownloadURL(imageRef);
    return url; // Return empty string if URL is undefined
}

// async function uploadCV(file) {
//     const cvRef = ref(storage, "userCV/" + file.name);
//     await uploadBytes(cvRef, file);

//     const url = await getDownloadURL(cvRef);
//     return url; // Return empty string if URL is undefined
// }

async function saveFormDataToDatabase() {
    var formData = collectFormData();

    const imageFile = document.getElementById("image").files[0];
    if (imageFile) {
        imageUrl = await uploadImageAndGetURL(imageFile);
        formData.about.image = imageUrl;
        console.log("Image URL: ", imageUrl);
    }

    // const cvFile = document.getElementById("cv").files[0];
    // if (cvFile) {
    //     cvUrl = await uploadCV(cvFile);
    //     formData.about.cv = cvUrl;
    //     console.log("CV URL: ", cvUrl);
    // }

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
                    borderRadius: "10px"
                }
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