const email = localStorage.getItem("email");
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
            $("#btn").html("Update CV");
            cvUrl = userData.about.cv;
            if (cvUrl) window.location.href = "/myaccount/yourprofile/"
        }
    } catch (error) {
        console.error("Error getting user data:", error);
    }
}

isUser();

async function uploadCV(file) {
    const cvRef = ref(storage, "userCV/" + file.name);
    await uploadBytes(cvRef, file);

    const url = await getDownloadURL(cvRef);
    return url; // Return empty string if URL is undefined
}

async function saveCVToDatabase() {
    const cvFile = document.getElementById("cv").files[0];
    if (cvFile) {
        cvUrl = await uploadCV(cvFile);

        const userProfileRef = doc(db, "user_profile", email);
        await setDoc(userProfileRef, { "about.cv": cvUrl }, { merge: true })
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
}

$("#btn").on("click", function () {
    saveCVToDatabase();
});
