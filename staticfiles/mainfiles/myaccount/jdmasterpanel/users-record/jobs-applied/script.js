
import {  
    getDoc,
   } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Initialize Firebase app
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

function displayJobs() {
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


// Display jobs when the page is loaded
window.onload = displayJobs();
