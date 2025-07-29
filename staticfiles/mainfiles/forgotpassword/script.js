const urlParams = new URLSearchParams(window.location.search);
const redirect_url = urlParams.get("redirect_url");
const passwordResetEmail = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent successfully");
    Toastify({
      text: "Email sent successfully",
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
  } catch (error) {
    console.error("Error sending password reset email:", error);
    Toastify({
      text: "Something went wrong",
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
};

const forgotForm = document.getElementById("forgot-form");

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  console.log("Hello, World!", email);
  passwordResetEmail(email);
});
