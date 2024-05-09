const firestore = getFirestore(app);

const userDocRef = doc(firestore, "users", localStorage.getItem("uid"));
const userDocSnapshot = await getDoc(userDocRef);

if (userDocSnapshot.exists() && userDocSnapshot.data().isAdmin) {
  console.log("User is admin");
} else {
  console.log("User is not admin");
  alert("Please login as admin to access this page.");
  window.location.href = "/admin";
}
