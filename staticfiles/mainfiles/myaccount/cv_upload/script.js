let userEmail;
// Check if the user is signed in
auth.onAuthStateChanged((user) => {
    if (user) {
        userEmail = user.email;
    } else {
        // No user is signed in
        console.log("No user is signed in");
        window.location.href = "/login/?redirect_url=/myaccount/cv_upload";
    }
});

const email = localStorage.getItem("email");

let cvUrl = "";

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
    if (cvFile) {
        cvUrl = await uploadCV(cvFile);

        const userProfileRef = doc(db, "user_profile", userEmail);
        
        // Ensure the user profile document exists before updating it
        const docSnap = await getDoc(userProfileRef);
        if (!docSnap.exists()) {
            await setDoc(userProfileRef, { "about": {} });
        }

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
                    window.location.href = "/myaccount/";
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
