const resendButton = document.getElementById("resend_button");
const checkButton = document.getElementById("check_verification_button");
const timerText = document.getElementById("timer_text");

// Finish the return trip (including Findme) after the user verifies the email.
async function finishIfVerified(showMessage = false) {
    const user = window.auth && window.auth.currentUser;
    if (!user) {
        if (showMessage) alert("Please log in again, then check your email.");
        return false;
    }
    try {
        await user.reload();
        if (!user.emailVerified) {
            if (showMessage) alert("The email is not verified yet. Open the link in your email, then click this button again.");
            return false;
        }
        localStorage.setItem("uid", user.uid);
        localStorage.setItem("email", user.email);
        const redirectUrl = localStorage.getItem("redirect_url");
        localStorage.removeItem("redirect_url");
        window.location.href = redirectUrl || "/";
        return true;
    } catch (error) {
        console.error("Couldn't check email verification:", error);
        if (showMessage) alert("We couldn't check yet. Please try again.");
        return false;
    }
}

checkButton.addEventListener("click", () => finishIfVerified(true));
// If the verification link was opened in another tab, this page notices it.
window.addEventListener("focus", () => finishIfVerified(false));
if (window.auth && window.onAuthStateChanged) {
    window.onAuthStateChanged(window.auth, (user) => {
        if (user && user.emailVerified) finishIfVerified(false);
    });
}

let secondsLeft = 30;
let countdown;

const startTimer = () => {
    countdown = setInterval(() => {
        timerText.textContent = secondsLeft;
        secondsLeft--;

        if (secondsLeft < 0) {
            clearInterval(countdown);
            resendButton.style.display = "block";
        }
    }, 1000);
};

const restartTimer = () => {
    clearInterval(countdown);
    secondsLeft = 30;
    resendButton.style.display = "none";
    startTimer();
};

startTimer();

resendButton.addEventListener("click", async () => {
    try {
        await sendEmailVerification(auth.currentUser);
        restartTimer();
    } catch (error) {
        console.error("An error occurred:", error);
        Toastify({
            text: error.message.split(' ')[2].split("(")[1].split(")")[0].split('/')[1].replaceAll('-', ' '),
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
});