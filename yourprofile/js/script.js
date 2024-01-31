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


// const firstnameInput = document.getElementById('firstname');

// firstnameInput.addEventListener('change', (e) => {
//     const firstName = e.target.value; 
// });


// const categoryInput = document.getElementById('category');

// categoryInput.addEventListener('change', (e) => {
//     const category = e.target.value; 
// });

// const genderInput = document.getElementById('gender');

// genderInput.addEventListener('change', (e) => {
//     const gender = e.target.value; 
// });

// const imageInput = document.getElementById('image');

// imageInput.addEventListener('change', (e) => {
//     // previewImage();
// });

// const lastnameInput = document.getElementById('lastname');

// lastnameInput.addEventListener('change', (e) => {
//     const lastname = e.target.value; 
// });

// const middlenameInput = document.getElementById('middlename');

// middlenameInput.addEventListener('change', (e) => {
//     const middlename = e.target.value; 
// });


// const githubInput = document.getElementById('github');

// githubInput.addEventListener('change', (e) => {
//     const github = e.target.value;
//     // Do something with the value of the github input
// });

// const linkedinInput = document.getElementById('linkedin');

// linkedinInput.addEventListener('change', (e) => {
//     const linkedin = e.target.value;
//     // Do something with the value of the linkedin input
// });

// const phonenoInput = document.getElementById('phoneno');

// phonenoInput.addEventListener('change', (e) => {
//     const phoneno = e.target.value;
//     // Do something with the value of the phoneno input
// });

// const emailInput = document.getElementById('email');

// emailInput.addEventListener('change', (e) => {
//     const email = e.target.value;
// });

// const addressInput = document.getElementById('address');

// addressInput.addEventListener('change', (e) => {
//     const address = e.target.value;
// });

// const schoolInputs = [...document.getElementsByClassName('school')];

// schoolInputs.forEach((input) => {
//     input.addEventListener('change', (e) => {
//         const schoolValue = e.target.value;
//         console.log(schoolValue);
//     });
// });

const btn = document.getElementById('btn');
btn.addEventListener('click', handleclick());

function handleclick() {
    const sch = document.getElementsByClassName('school');
    sch.forEach(element => {
        element.addEventListener('change', (e) => {
            console.log(e);
        })
    });
}