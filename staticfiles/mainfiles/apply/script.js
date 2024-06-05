let cvUrl = "";
const signupForm = document.getElementById("signup-form");
const applyButton = document.getElementById("apply-btn");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;

    try {
        applyButton.innerHTML = "Applying...";
        applyButton.disabled = true;
        cvUrl = await uploadCV(document.getElementById("cv").files[0]);
        const docRef = await doc(db, "user_profile", email);
        const userData = {
            full_name: username,
            email: email,
            phonenumber: phoneNumber,
            cv: cvUrl,
        }
        await setDoc(docRef,userData)
        Toastify({
            text: 'Applied successfully, login to explore more.',
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
        window.location.href = "/login";
    } catch (error) {
        alert("Error signing up: " + error.message);
    }
    applyButton.innerHTML = "Apply";
    applyButton.disabled = false;
});

async function uploadCV(file) {
    const cvRef = ref(storage, "user_cv/" + file.name);
    await uploadBytes(cvRef, file);

    const url = await getDownloadURL(cvRef);
    return url; // Return empty string if URL is undefined
}

