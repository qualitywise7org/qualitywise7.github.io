const currentDate = new Date();

const hours = currentDate.getHours();
const minutes = currentDate.getMinutes();

const formattedTime = `${hours < 10 ? '0'+hours:hours}:${minutes < 10 ? '0'+ minutes:minutes}`;

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const password = document.getElementById("code").value;

      if(password === formattedTime){
            window.location.href = "/adminAuthorize/jdpanel/index.js";
            alert("done");
            console.log("done sir")
      }else{
            console.log(typeof(password));
            alert("Wrong credential");
            console.log("Password:", password);
            console.log("Formatted Time:", formattedTime);
      }
});