import { initializeApp } from "https://www.gstatic.com/firebasejs/10.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.2.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzoJJ_325VL_axuuAFzDf3Bwt_ENzu2rM",
  authDomain: "jobsdoor360-39b87.firebaseapp.com",
  databaseURL: "https://jobsdoor360-39b87-default-rtdb.firebaseio.com",
  projectId: "jobsdoor360-39b87",
  storageBucket: "jobsdoor360-39b87.appspot.com",
  messagingSenderId: "326416618185",
  appId: "1:326416618185:web:de19e90fe4f06006ef3318",
  measurementId: "G-60RHEMJNM6",
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore();

const currentPageUrl = window.location.pathname;
let docRefrencePage = currentPageUrl.replace(/\//g, "_");

if (currentPageUrl === "/") {
  docRefrencePage = "_home_";
}

const feedbackInput = document.getElementById("feedback");
const phoneNumberInput = document.getElementById("phoneNumber");

const submitButton = document.getElementById("submitFeedback");

const likeButton = document.getElementById("like-button");
const dislikeButton = document.getElementById("dislike-button");

likeButton.addEventListener("click", () => {
  likeButton.classList.add("clicked");
  setTimeout(() => {
    likeButton.classList.remove("clicked");
  }, 600);
});

dislikeButton.addEventListener("click", () => {
  dislikeButton.classList.add("clicked");
  setTimeout(() => {
    dislikeButton.classList.remove("clicked");
  }, 600);
});

async function updateFeedbackCounts(likeCount, dislikeCount, pageIdentifier) {
  try {
    const feedbackDocRef = doc(db, "page_feedback", pageIdentifier);

    await setDoc(feedbackDocRef, {
      like_count: likeCount,
      dislike_count: dislikeCount,
    });

    console.log(`Feedback counts updated for ${docRefrencePage}`);
  } catch (error) {
    console.error(
      `Error updating feedback counts for ${docRefrencePage}:`,
      error
    );
  }
}

document.getElementById("like-button").addEventListener("click", async () => {
  const feedbackDocRef = doc(db, "page_feedback", docRefrencePage);
  const feedbackDocSnapshot = await getDoc(feedbackDocRef);

  const newLikeCount = (feedbackDocSnapshot.data()?.like_count || 0) + 1;

  await updateFeedbackCounts(
    newLikeCount,
    feedbackDocSnapshot.data()?.dislike_count || 0,
    docRefrencePage
  );
});

document
  .getElementById("dislike-button")
  .addEventListener("click", async () => {
    openModal();

    const feedbackDocRef = doc(db, "page_feedback", docRefrencePage);
    const feedbackDocSnapshot = await getDoc(feedbackDocRef);

    const newDislikeCount =
      (feedbackDocSnapshot.data()?.dislike_count || 0) + 1;

    await updateFeedbackCounts(
      feedbackDocSnapshot.data()?.like_count || 0,
      newDislikeCount,
      docRefrencePage
    );
  });

submitButton.addEventListener("click", async () => {
  const feedback = feedbackInput.value;
  const phoneNumber = phoneNumberInput.value;

  const feedbackData = {
    phoneNumber: phoneNumber,
    feedback: feedback,
    webPage: docRefrencePage,
  };

  try {
    const feedbackCollectionRef = collection(db, "user_feedback");

    // Add a new document with the feedback data
    await addDoc(feedbackCollectionRef, feedbackData);

    console.log("User feedback stored successfully.");
  } catch (error) {
    console.error("Error storing user feedback:", error);
  }

  // Clear input fields
  feedbackInput.value = "";
  phoneNumberInput.value = "";
});
