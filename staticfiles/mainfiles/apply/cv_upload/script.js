const emailApply = localStorage.getItem("emailApply");
let userEmail = '';
if (emailApply) {
    userEmail = emailApply;
} else {
    window.location.href = "/login/";
}
let cvUrl = "";
let skills = [];

async function uploadCV(file) {
    const cvRef = ref(storage, "user_cv/" + file.name);
    await uploadBytes(cvRef, file);

    const url = await getDownloadURL(cvRef);
    return url; // Return empty string if URL is undefined
}

async function saveCVToDatabase() {
    const uploadButton = document.getElementById("btn");
    uploadButton.innerHTML = "Uploading...";
    uploadButton.disabled = true;

    const cvFile = document.getElementById("cv").files[0];
    const skillsInput = document.getElementById("skills").value;
    const college = document.getElementById("college").value;


    if (cvFile) {
        cvUrl = await uploadCV(cvFile);

        if (skillsInput) {
            skills = skillsInput.split(',').map(skill => skill.trim());
        }

        const userProfileRef = doc(db, "lead", userEmail);
        await updateDoc(userProfileRef, {
            "about.cv": cvUrl,
            "about.skills": skills,
            "about.college": college
        })
            .then(() => {
                Toastify({
                    text: "Information Successfully Submitted",
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
                    window.location.href = "http://127.0.0.1:5501/login/";
                }, 1000);
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }

    uploadButton.innerHTML = "UPLOAD RESUME";
    uploadButton.disabled = false;
}

$("#btn").on("click", function () {
    saveCVToDatabase();
});