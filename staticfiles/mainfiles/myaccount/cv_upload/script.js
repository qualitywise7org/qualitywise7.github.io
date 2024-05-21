const email = localStorage.getItem("email");
if (!email) {
    window.location.href = "/login/";
}
let cvUrl = "";

async function isUser() {
    console.log("isUser");
    const docRef = doc(db, "user_profile", email);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            var userData = docSnap.data();
            cvUrl = userData.about.cv;
            if (cvUrl) window.location.href = "/myaccount/yourprofile/"
        }
    } catch (error) {
        console.error("Error getting user data:", error);
    }
}

isUser();

async function uploadCV(file) {
    const cvRef = ref(storage, "user_cv/" + file.name);
    await uploadBytes(cvRef, file);

    const url = await getDownloadURL(cvRef);
    return url; // Return empty string if URL is undefined
}

async function saveCVToDatabase() {
    const uploadButton = document.getElementById("btn")
    uploadButton.innerHTML = "Uploading...";
    uploadButton.disabled = true;
    const cvFile = document.getElementById("cv").files[0];
    if (cvFile) {
        cvUrl = await uploadCV(cvFile);

        const userProfileRef = doc(db, "user_profile", email);
        await updateDoc(userProfileRef, { "about.cv": cvUrl })
            .then(() => {
                Toastify({
                    text: "CV Successfully Submitted",
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
                    window.location.href = "/myaccount/yourprofile/";
                }, 3000);
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