// Function to start the countdown
function startCountdown() {
    var timerElement = document.getElementById("timer");
    var count = 15;

    var countdown = setInterval(function () {
        timerElement.innerHTML = count;

        if (count === 0) {
            clearInterval(countdown);
            openGoogleMeet();
        }

        count--;
    }, 1000);
}

// Function to open Google Meet in a new tab
function openGoogleMeet() {
    window.open("https://meet.google.com/byp-mzic-hqi", "_blank");
}

// Event listener for the "Join Now" button
document.getElementById("joinBtn").addEventListener("click", function () {
    openGoogleMeet();
});

// Start the countdown on page load
startCountdown();
