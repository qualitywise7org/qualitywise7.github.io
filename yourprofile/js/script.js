$(document).ready(function () {
    $('.repeater').repeater({
        initEmpty: false,
        defaultValues: {
            'text-input': ''
        },
        show: function () {
            $(this).slideDown();
        },
        hide: function (deleteElement) {
            $(this).slideUp(deleteElement);;
        },
        isFirstItemUndeletable: true
    })
})



function collectFormData() {
    var formData = {}; // Initialize formData object

    // Collect data for the "About" section
    var aboutData = {};
    aboutData.firstName = $('#firstname').val();
    aboutData.middleName = $('#middlename').val();
    aboutData.lastName = $('#lastname').val();
    aboutData.image = $('#image').val();
    aboutData.gender = $('#gender').val();
    aboutData.category = $('#category').val();
    aboutData.address = $('#address').val();
    aboutData.email = $('#email').val();
    aboutData.phoneNo = $('#phoneno').val();
    aboutData.linkedin = $('#linkedin').val();
    aboutData.github = $('#github').val();

    formData.about = aboutData;

    // Collect data for the "Education" section
    var education = [];
    $('[data-repeater-list="group-education"]').find('[data-repeater-item]').each(function () {
        var eduItem = {};
        eduItem.school = $('#school', this).val();
        eduItem.degree = $('#degree', this).val();
        eduItem.start_date = $('#sdate', this).val();
        eduItem.graduation_date = $('#edate', this).val();
        eduItem.city = $('#city', this).val();
        eduItem.percentage = $('#Percentage', this).val();
        education.push(eduItem);
    });

    formData.education = education;

    // Collect data for the "Skills" section
    var skills = [];
    $('[data-repeater-list="group-skill"]').find('[data-repeater-item]').each(function () {
        var skillValue = $(this).find('.skill').val().trim();
        if (skillValue !== '') {
            skills.push(skillValue);
        }
    });

    formData.skills = skills;

    return formData;
}

function saveFormDataToFile() {
    var formData = collectFormData();
    var jsonData = JSON.stringify(formData);

    console.log(jsonData);
}

$('#btn').on('click', function () {
    saveFormDataToFile();
});
