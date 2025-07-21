const email = localStorage.getItem("email");
// console.log(email);



const currentPageUrl = window.location.pathname;
let docRefrencePage = currentPageUrl.replace(/\//g, "_");

if (currentPageUrl === "/") {
  docRefrencePage = "_home_";
}

//accordian code
$(document).ready(function () {
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".accordion").length) {
      $(".accordion-collapse").collapse("hide");
    }
  });

  $(".accordion").on("click", function (event) {
    event.stopPropagation();
  });
});

// Wait until the DOM is fully loaded before attaching the event listener
document.addEventListener("DOMContentLoaded", function () {
  const applyButton = document.getElementById("apply-button");

  if (applyButton) {
    applyButton.addEventListener("click", function () {
      window.location.href = "/apply/";
    });
  }
});

// Check if the user is signed in
// Check if the user is signed in
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    // console.log(user.email);
    console.log("User is signed in");
  } else {
    // No user is signed in
    console.log("No user is signed in");
    
    // Update the href of "My Account" link to redirect to the login page
    const myAccountLink = document.getElementById("myaccount-1");
    myAccountLink.href = "/login/";
    const myAccountLink2 = document.getElementById("myaccount-2");
    myAccountLink2.href = "/login/";
    
    // Optionally update the profile section with a custom message
    //document.getElementById("profile").innerHTML =
     // "<a href='/login/?redirect_url=/myaccount/personalProfile'>Create your profile to get jobs</a>";
    
    // Optionally add a click listener for additional control
    myAccountLink.addEventListener("click", (event) => {
      // Prevent default behavior and redirect to login
      event.preventDefault();
      window.location.href = "/login/";
    });
    myAccountLink2.addEventListener("click", (event) => {
      // Prevent default behavior and redirect to login
      event.preventDefault();
      window.location.href = "/login/";
    });
  }
});

// content related js
const options = {
  root: null,
  rootMargin: "0px",
  threshold: 0.5,
};

// Intersection Observer ka callback function
const callback = (entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      startCounter(entry.target);
    }
  });
};

// Intersection Observer ka object
const observer = new IntersectionObserver(callback, options);
document
  .querySelectorAll(".counter")
  .forEach((counter) => observer.observe(counter));

// startCounter() function
function startCounter(counterElement) {
  var targetNumber = parseInt(counterElement.innerText, 10);
  var count = 0;
  var interval = setInterval(function () {
    count++;
    counterElement.innerText = count;
    if (count === targetNumber) {
      clearInterval(interval);
    }
  }, 50);
}

// Handle button click
// document.getElementById('searchbox').addEventListener('click', function(event) {
//   window.location.href = '/myaccount/jobsforyou/';
// });

function updateProgress(rowId, change) {
  const progressBar = document.getElementById(`progress-${rowId}`);
  const progressText = document.getElementById(`text-${rowId}`);
  const currentProgress =
    parseInt(progressBar.style.getPropertyValue("--progress")) || 0;

  // Calculate the new progress
  let newProgress = currentProgress + change;
  newProgress = Math.max(0, Math.min(newProgress, 100)); // Ensure range 0-100

  // Update the CSS variable for progress
  progressBar.style.setProperty("--progress", newProgress);

  // Update the text inside the circle
  progressText.textContent = `${newProgress}%`;
}

window.updateProgress = updateProgress;

// Handle button click
// document.getElementById('searchbox').addEventListener('click', function(event) {
//   window.location.href = '/myaccount/jobsforyou/';
// });

// global.js
window.getCurrentDateTime = function () {
  // const now = new Date();

  // const options = {
  //   weekday: "long",
  //   year: "numeric",
  //   month: "long",
  //   day: "numeric",
  //   hour: "2-digit",
  //   minute: "2-digit",
  //   second: "2-digit",
  //   timeZone: "UTC", // Specify UTC explicitly
  //   timeZoneName: "short",
  // };

  // const formattedDateTime = now.toLocaleString("en-US", options);
  // return formattedDateTime;
  const now = new Date(); // Get current UTC time
  return now.toISOString().replace(/\.\d{3}Z$/, "Z"); // Format as "YYYY-MM-DDTHH:mm:ssZ"
};


