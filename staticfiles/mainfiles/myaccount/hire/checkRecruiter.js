// checkRecruiter.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login/";
    return;
  }

  try {
    const roleDocRef = doc(db, "login_roles", user.email);
    const roleDocSnap = await getDoc(roleDocRef);

    if (!roleDocSnap.exists() || (roleDocSnap.data().role !== "recruiter" && roleDocSnap.data().role !== "master_admin")) {
      alert("Access denied. Recruiter or Master Admin role required.");
      window.location.href = "/";
    }
  } catch (error) {
    console.error("Error checking role:", error);
    alert("Error verifying user role. Please contact support.");
    window.location.href = "/login/";
  }
});
