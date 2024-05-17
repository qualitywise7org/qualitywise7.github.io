const resendButton = document.getElementById("resend_button");
const timerText = document.getElementById("timer_text");

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