var userName1 = document.getElementById("userName1");
var login = document.getElementById("login");


var storedUserJSON = localStorage.getItem('user');

if (storedUserJSON) {

    var storedUser = JSON.parse(storedUserJSON);
    userName1.innerText = storedUser.userName;
    login.style.display = "none";

    console.log(storedUser);
    console.log(storedUser.userName);
} else {
    console.log("No user data found in localStorage");
}


