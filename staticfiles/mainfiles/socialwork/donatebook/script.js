function redirectToGoogleForm() {
    var counter = document.getElementById("timer");
    var count = 15;


    var countdown = setInterval(function () {
        counter.innerHTML = count;
        if (count === 0) {
            clearInterval(countdown);
            openGoogleForm();
        }
        count--;

    }, 1000);
}
function openGoogleForm() {
    var url = "https://docs.google.com/forms/d/1-eVWpHDS1fJ13XPaNoKwh8wMTncCuC0xL7r02tL_RT4/";
    window.location.href = url;

}

redirectToGoogleForm();
