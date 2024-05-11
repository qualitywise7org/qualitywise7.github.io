const currentDate = new Date();

const hours = currentDate.getHours();
const minutes = currentDate.getMinutes();

const formattedTime = `${hours < 10 ? "0" + hours : hours}:${
  minutes < 10 ? "0" + minutes : minutes
}`;
console.log("Formatted Time:", formattedTime);

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("code").value;

  if (password === formattedTime) {
    const db = getFirestore(app);
    const userId = localStorage.getItem("uid");
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { isAdmin: true }, { merge: true });
    window.location.href = "/myaccount/hiring-portal/";
    alert("Welcome Admin!");
    console.log("done sir");
  } else {
    console.log(typeof password);
    alert("Wrong credential");
    console.log("Password:", password);
    console.log("Formatted Time:", formattedTime);
  }
});
