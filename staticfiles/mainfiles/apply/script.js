const signupForm = document.getElementById("signup-form");
const applyButton = document.getElementById("apply-btn");


signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    localStorage.setItem("full_name", username);
    localStorage.setItem("emailApply", email);
    localStorage.setItem("phonenumber", phoneNumber);

    try {
        applyButton.innerHTML = "Applying...";
        applyButton.disabled = true;
        const docRef = await doc(db, "user_profile", email);
        const userData = {
            full_name: username,
            email: email,
            phonenumber: phoneNumber,
        }
        await setDoc(docRef,userData)
        Toastify({
            text: 'Thanks for applying, redirecting to CV upload page.',
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
        window.location.href = "/myaccount/cv_upload/";
    } catch (error) {
        alert("Error signing up: " + error.message);
    }
    applyButton.innerHTML = "Apply";
    applyButton.disabled = false;
});

