

const email = localStorage.getItem("email");

if (!email) {
  window.location.href = "/login/";
}

async function isUser() {
  try {
    const docRef = doc(db, "login_roles", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const userRole = userData.role;

      console.log("User Role from Firestore:", userRole);

      if (userRole === "master_admin") {
        await displayJobs();
        console.log("Admin access granted.");
      } else {
        console.log("Access denied. Redirecting...");
        window.location.href = "/";
      }
    } else {
      console.error("No user role found for email:", email);
      window.location.href = "/login/"; // Redirect if no user data is found
    }
  } catch (error) {
    console.error("Error getting user data from Firestore:", error);
    window.location.href = "/"; // Redirect in case of error
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await isUser();
});

const data = await getAllData();


async function getAllData() {
    let Data = [];

    try {
        const querySnapshot = await getDocs(collection(db, "hiring"));
        querySnapshot.forEach((doc) => {
            Data.push(doc.data());
        });
    } catch (error) {
        console.error("Error getting data from collection:", error);
    }
    return Data;
}


const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get("user");
const docRef = doc(db, "jobsapplied", user);
const docSnap = await getDoc(docRef);
const userjobdata = docSnap.data();


const tableBody = document.querySelector('#jobTable tbody');

async function displayJobs() {
    tableBody.innerHTML = '';

    data.forEach(job => {
        if (userjobdata.hasOwnProperty(job.id)) {
            const row = tableBody.insertRow();

            row.insertCell().textContent = job.id;
            row.insertCell().textContent = job.title;
            row.insertCell().textContent = job.role;
            row.insertCell().textContent = job.location;
            row.insertCell().textContent = job.stipend;

            row.classList.add('applied');
        }
    });
}



