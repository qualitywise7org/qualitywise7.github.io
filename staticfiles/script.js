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
document.addEventListener('DOMContentLoaded', function() {
    const applyButton = document.getElementById('apply-button');

    if (applyButton) {
        applyButton.addEventListener('click', function() {
            window.location.href = '/apply/';
        });
    }
});


// Check if the user is signed in
auth.onAuthStateChanged((user) => {
  if (user) {
    
  } else {
    // No user is signed in
    console.log("No user is signed in");
    document.getElementById("profile").innerHTML =
    "<a href='/login/?redirect_url=/myaccount/yourprofile'>Create your profile to get jobs</a>";
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

// global.js
window.getCurrentDateTime = function () {
  const now = new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC", // Specify UTC explicitly
    timeZoneName: "short",
  };

  const formattedDateTime = now.toLocaleString("en-US", options);
  return formattedDateTime;
};
