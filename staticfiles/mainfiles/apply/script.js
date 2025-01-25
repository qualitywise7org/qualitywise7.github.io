let currentUser = null;
//  Add event listener for authentication state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;  // Set currentUser when a user is logged in
    } else {
        currentUser = null;  // Set currentUser to null when no user is logged in
    }
});
  const signupForm = document.getElementById("signup-form");
const applyButton = document.getElementById("apply-btn");


signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const applyingFor = [];
    document.querySelectorAll('input[name="applying_for"]:checked').forEach((checkbox) => {
        applyingFor.push(checkbox.value);
    });
  
  
    localStorage.setItem("full_name", username);
    localStorage.setItem("emailApply", email);
    localStorage.setItem("phonenumber", phoneNumber);

    try {
        applyButton.innerHTML = "Applying...";
        applyButton.disabled = true;

        const docRef = await doc(db, "lead", email);
        const userData = {
            full_name: username,
            email: email,
            phonenumber: phoneNumber,
            applying_for: applyingFor, // Adding checkbox data
            created_by: currentUser?currentUser.email:"",
            created_datetime: new Date().toISOString()
            
        }
        await setDoc(docRef, userData);

        
        console.log("UserData being saved to Firestore:", userData);
        await setDoc(docRef,userData)
        Toastify({
            text: 'Thanks for applying, redirecting to CV upload page.',
            duration: 5000,
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
            window.location.href = "/apply/cv_upload/";
        }, 5000);
    } catch (error) {
        alert("Error signing up: " + error.message);
    }
    applyButton.innerHTML = "Apply";
    applyButton.disabled = false;
});

