document.addEventListener("DOMContentLoaded", function () {
    const resumeInput = document.getElementById("resumeInput");
    const uploadButton = document.getElementById("uploadButton");
    const selectedFile = document.getElementById("selectedFile");

    resumeInput.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            selectedFile.textContent = `Selected file: ${file.name}`;
        } else {
            selectedFile.textContent = "No file selected";
        }
    });

    uploadButton.addEventListener("click", function () {
        const file = resumeInput.files[0];

        if (file) {
            // use fetching here
            console.log("Selected file:", file.name);
        } else {
            console.log("No file selected.");
        }
    });
});
