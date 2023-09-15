const jobtype_masterdata = [
    { code: "private", name: "Private" },
    { code: "government", name: "Government" },
];

const industry_masterdata = [
    { code: "cs_it_engineering", name: "CS/IT" },
    { code: "medical", name: "Medical" },
    { code: "agriculture", name: "Agriculture" },
    { code: "pharmacy", name: "Pharmacy" },
    { code: "civil_engineering", name: "Civil Engineering" },
    { code: "electrical_engineering", name: "Electrical Engineering" },
    { code: "environmental_engineering", name: "Environmental Engineering" },
];

const profile_masterdata = [
    {
        code: "web_developer",
        name: "Web Developer(Reactjs, html, css, js etc)",
        minimum_skills_required:
            "HTML, CSS, Javascript, Reactjs, jQuery, Responsive website development, api integration, http, websocket, developer tool, SEO",
        life_style: [
            {
                title: "A Day in the Life of a Remote Web developer",
                url: "https://www.youtube.com/watch?v=NtDclT4c8No",
            },
            {
                title: "How Much Salary Should You Expect As A Fresher Developer",
                url: "https://www.youtube.com/watch?v=pTelIKAEadI",
            },
        ],
    },
];

export { jobtype_masterdata, industry_masterdata, profile_masterdata };
