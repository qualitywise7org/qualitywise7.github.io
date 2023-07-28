window.addEventListener("scroll", () => {
    let scrollVal = window.scrollY;
    if (scrollVal > 2000) {
        document.getElementById("backToTopBtn").style.display = "block";
    } else {
        document.getElementById("backToTopBtn").style.display = "none";
    }
});

function scrollToTop() {
    document.documentElement.scrollTop = 0;
}

document.getElementById("backToTopBtn").addEventListener("click", scrollToTop);
