let cvUrl = ""
async function isUser() {
    console.log("isUser");
    const docRef = doc(db, "user_profile", email);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            var userData = docSnap.data();
            cvUrl = userData.about.cv;
            console.log(cvUrl);
        }
    } catch (error) {
        console.error("Error getting user data:", error);
    }
}

isUser();