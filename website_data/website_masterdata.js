const category_masterdata = [
  {
    code: "general",
    name: "General",
  },
  {
    code: "obc_ncl",
    name: "OBC (NCL)",
  },
  {
    code: "obc_cl",
    name: "OBC (Cl)",
  },
  {
    code: "sc",
    name: "SC",
  },
  {
    code: "st",
    name: "ST",
  },
];

const subject_masterdata = [
  {
    code: "science",
    name: "Science",
  },
  {
    code: "math",
    name: "Math",
  },
  {
    code: "commerce",
    name: "Commerce",
  },
  {
    code: "biology",
    name: "Biology",
  },
];

const stream_masterdata = [
  {
    code: "cs",
    name: "Computer Science",
  },
  {
    code: "it",
    name: "Information Technology",
  },
  {
    code: "civil",
    name: "Civil Engineering",
  },
  {
    code: "electrical",
    name: "Electrical Engineering",
  },
  {
    code: "mechanical",
    name: "Mechanical Engineering",
  },
];

const qualification_masterdata = [
  {
    code: "10",
    name: "10th",
  },
  {
    code: "12",
    name: "12th",
  },
  {
    code: "iti",
    name: "ITI",
  },
  {
    code: "diploma",
    level: "diploma",
    name: "Diploma",
  },
  {
    code: "bca",
    level: "graduation",
    name: "BCA",
  },
  {
    code: "bsc",
    level: "graduation",
    name: "B.Sc",
  },
  {
    code: "be",
    level: "graduation",
    name: "B.E",
  },
  {
    code: "btech",
    level: "graduation",
    name: "B.Tech",
  },
  {
    code: "mca",
    level: "post_graduation",
    name: "MCA",
  },
  {
    code: "msc",
    level: "post_graduation",
    name: "MSC",
  },
  {
    code: "mtech",
    level: "post_graduation",
    name: "M.Tech",
  },
  {
    code: "phd",
    level: "post_graduation",
    name: "PHD",
  },
];

const jobtype_masterdata = [
  {
    code: "private",
    name: "Private",
  },
  {
    code: "government",
    name: "Government",
  },
];

const diplomaname_masterdata = [
  {
    code: "engineering",
    name: "Engineering",
  },
  {
    code: "pharmacy",
    name: "Pharmacy",
  },
  {
    code: "education",
    name: "Education",
  },
  {
    code: "business_administration",
    name: "Business Administration",
  },
  {
    code: "hotel_management",
    name: "Hotel Management",
  },
  {
    code: "fashion_designing",
    name: "Fashion Designing",
  },
  {
    code: "digital_marketing",
    name: "Digital Marketing",
  },
  {
    code: "financial_management",
    name: "Financial Management",
  },
];

const industry_masterdata = [
  {
    code: "cs_it_engineering",
    name: "CS/IT",
  },
  {
    code: "medical",
    name: "Medical and Healthcare",
    keywords: ["medical"],
  },
  {
    code: "library_sciences",
    name: "Library Science",
    keywords: ["librarian", "libray"],
  },
  {
    code: "education",
    name: "Education",
    keywords: ["teacher", "education", "teaching"],
  },
  {
    code: "law_and_justice",
    name: "Law and Justice",
    keywords: ["law"],
  },
  {
    code: "sports",
    name: "Sports",
    keywords: ["sports"],
  },
  {
    code: "agriculture",
    name: "Agriculture",
  },
  {
    code: "pharmacy",
    name: "Pharmacy",
  },
  {
    code: "civil_engineering",
    name: "Civil Engineering",
  },
  {
    code: "electrical_engineering",
    name: "Electrical Engineering",
  },
  {
    code: "environmental_engineering",
    name: "Environmental Engineering",
  },
];

const profile_masterdata = [
  {
    code: "web_developer",
    name: "Web Developer(Reactjs, html, css, js etc)",
    minimum_skills_required:
      "HTML, CSS, Javascript, Reactjs, jQuery, Responsive website development, api integration, http, websocket, developer tool, SEO, wordpress",
    minimum_qualifications: ["graduation"],
    preferred_streams: ["any"],
    entrance_exam: ["interview"],
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
    keywords: ["web", "frontend_developer", "frontend", "react"],
  },
  {
    code: "java_developer",
    name: "Java Developer",
    minimum_skills_required: "Java, Advance Java",
    minimum_qualifications: ["graduation"],
    preferred_streams: ["any"],
    entrance_exam: ["interview"],
    life_style: [
      {
        title: "A Day in the Life of a Remote java developer",
        url: "https://www.youtube.com/watch?v=aCP4tDSpjGQ&ab_channel=LearnwithPhil",
      },
      {
        title: "How Much Salary Should You Expect As A Fresher Developer",
        url: "https://www.youtube.com/watch?v=3hoFiGx8ti0&ab_channel=GenieAshwani",
      },
    ],
  },
  {
    code: "python_developer",
    name: "Python Developer",
    minimum_skills_required: "python, Analytics, http api, Django",
    minimum_qualifications: ["graduation"],
    preferred_streams: ["any"],
    entrance_exam: ["interview"],
    life_style: [
      {
        title: "A Day in the Life of a Remote python developer",
        url: "https://www.youtube.com/watch?v=2QByYtPEGIs&ab_channel=CleverProgrammer",
      },
      {
        title: "How Much Salary Should You Expect As A Fresher Developer",
        url: "https://www.youtube.com/watch?v=QiJ20NDOpSc&ab_channel=Simplilearn",
      },
    ],
  },
  {
    code: "dba",
    name: "DBA - Database Administrator",
    minimum_skills_required:
      "SQL, NOSQL, DBA audit operations, traffic monitoring, connections, replica, master-slave",
    minimum_qualifications: ["graduation"],
    preferred_streams: ["any"],
    entrance_exam: ["interview"],
    life_style: [
      {
        title: "A Day in the Life of a Remote Administrator developer",
        url: "https://www.youtube.com/watch?v=EANvxcWwZ4Q&ab_channel=TrainWithShubham",
      },
      {
        title: "How Much Salary Should You Expect As A Fresher Developer",
        url: "https://www.youtube.com/watch?v=EiAZVCBsx30&ab_channel=PandeyGuruji",
      },
    ],
  },
  {
    code: "nodejs_developer",
    name: "Nodejs Developer",
    minimum_skills_required: "nodejs, javascript, http api",
    minimum_qualifications: ["graduation"],
    preferred_streams: ["any"],
    entrance_exam: ["interview"],
    life_style: [
      {
        title: "A Day in the Life of a Remote Nodejs developer",
        url: "https://www.youtube.com/watch?v=hq-A3dBciio&ab_channel=AlphaProgr",
      },
      {
        title: "How Much Salary Should You Expect As A Fresher Developer",
        url: "https://www.youtube.com/shorts/6A-Cl0GhX0o",
      },
    ],
  },
  {
    code: "fullstack_developer",
    name: "Full Stack Developer",
    minimum_skills_required:
      "HTML, CSS, Javascript, Reactjs, jQuery, Responsive website development, api integration, http, websocket, developer tool, SEO, wordpress, nodejs, javascript, http api",
    minimum_qualifications: ["graduation"],
    preferred_streams: ["any"],
    entrance_exam: ["interview"],
    life_style: [
      {
        title: "A Day in the Life of a Remote Full Stack developer",
        url: "https://www.youtube.com/shorts/1l7crR4wi2U",
      },
      {
        title: "How Much Salary Should You Expect As A Fresher Developer",
        url: "https://www.youtube.com/shorts/qm5sJsy3dBE",
      },
    ],
  },
  {
    code: "qa",
    name: "QA - Quality Assurance",
    minimum_skills_required:
      "test case writing, manual testing, automation testing, selenium, jmeter",
    minimum_qualifications: ["graduation"],
    preferred_streams: ["any"],
    entrance_exam: ["interview"],
    life_style: [
      {
        title: "A Day in the Life of a Remote Quality Assurance",
        url: "https://www.youtube.com/watch?v=BPcbisSxxzQ&ab_channel=TheTestLead",
      },
      {
        title:
          "How Much Salary Should You Expect As A Fresher Quality Assurance",
        url: "https://www.youtube.com/shorts/f2Nu_lHMi8M",
      },
    ],
  },
  {
    code: "program_manager",
    name: "Program Manager",
    minimum_skills_required:
      "scrum, Jira, communication, documentation, awareness of technology and business",
    minimum_qualifications: ["graduation"],
    preferred_streams: ["any"],
    entrance_exam: ["interview"],
    life_style: [
      {
        title: "A Day in the Life of a Remote Program Manager",
        url: "https://www.youtube.com/watch?v=Dhc1bd2StTM&ab_channel=GoogleCareerCertificates",
      },
      {
        title: "How Much Salary Should You Expect As A Fresher Program manager",
        url: "https://www.youtube.com/watch?v=39QgN5XB_JE&ab_channel=TheUrbanFight",
      },
    ],
  },
  {
    code: "product_manager",
    name: "Product Manager",
    minimum_skills_required:
      "product case studies, profit loss of product, usecase writing, market fitment, product cost, break even",
    minimum_qualifications: ["graduation"],
    preferred_streams: ["any"],
    entrance_exam: ["interview"],
    life_style: [
      {
        title: "A Day in the Life of a Remote Product Manager",
        url: "https://www.youtube.com/shorts/eyOIXtmf-gI",
      },
      {
        title: "How Much Salary Should You Expect As A Fresher Product manager",
        url: "https://www.youtube.com/shorts/ycMqZTYhgvc",
      },
    ],
  },
  {
    code: "librarian",
    name: "Librarian",
    keywords: ["librarian"],
    minimum_skills_required: "ways to arrange book, publisers",
    minimum_qualifications: ["blib"],
    preferred_streams: "NA",
    life_style: [
      {
        title: "A Day in the Life of a Librarian",
        url: "https://www.youtube.com/watch?v=kJZptgIkgTs&ab_channel=LibraryDoctors",
      },
      {
        title: "How Much Salary Should You Expect As A Librarian",
        url: "https://www.youtube.com/watch?v=1Mw8V_WB-T8&ab_channel=LibraryDoctors",
      },
    ],
  },
  {
    code: "fellow",
    name: "Fellow",
    minimum_skills_required:
      "master of subject, teaching skill, communication, english",
    minimum_qualifications: ["postgraduation"],
    preferred_streams: ["any"],
    life_style: [
      {
        title: "A Day in the Life of a fellow",
        url: "https://www.youtube.com/shorts/FIq4Bq60lek",
      },
      {
        title: "How Much Salary Should You Expect As A Fresher Fellow",
        url: "https://www.youtube.com/watch?v=KSDToclQPss&ab_channel=HSESTUDYGUIDE",
      },
    ],
  },
  {
    code: "nurse",
    name: "Nurse",
    minimum_skills_required: "assistant to doctor in medication",
    minimum_qualifications: ["diploma"],
    preferred_streams: ["any"],
    life_style: [
      {
        title: "A Day in the Life of a nurse",
        url: "https://www.youtube.com/shorts/sQqNsElZ118",
      },
      {
        title: "How Much Salary Should You Expect As A Fresher nurse",
        url: "https://www.youtube.com/shorts/JP5DcXERK2E",
      },
    ],
  },
  {
    code: "medical_officer",
    name: "Medical Officer",
    keywords: ["medical officer"],
    minimum_skills_required: "mbbs, assistant to doctor in medication",
    minimum_qualifications: ["mbbs"],
    preferred_streams: ["any"],
    life_style: [
      {
        title: "A Day in the Life of a Medical Officer",
        url: "https://www.youtube.com/watch?v=LYDOfrbg8kU&ab_channel=DrChandrashekharVerma",
      },
      {
        title: "How Much Salary Should You Expect As A Medical Officer",
        url: "https://www.youtube.com/watch?v=UL6NJt3a2oY&ab_channel=DrChandrashekharVerma",
      },
    ],
  },
  {
    code: "pharmacist",
    name: "Pharmacist",
    minimum_skills_required: "bpharma, assistant to doctor in medication",
    minimum_qualifications: ["bphrama"],
    preferred_streams: ["any"],
    life_style: [
      {
        title: "A Day in the Life of a Pharmacist",
        url: "https://www.youtube.com/watch?v=Q1huljUYuiM&ab_channel=AquibWood",
      },
      {
        title: "How Much Salary Should You Expect As A Pharmacist",
        url: "https://www.youtube.com/shorts/ptR3zD14Wa0",
      },
    ],
  },
  {
    code: "teacher",
    name: "School Teacher",
    keywords: ["teacher"],
    minimum_skills_required: "GK, math, reasoning, english, Hindi",
    minimum_qualifications: ["D.ed", "B.ed"],
    preferred_streams: ["any"],
    life_style: [
      {
        title: "A Day in the Life of a School Teacher",
        url: "https://www.youtube.com/shorts/SFBtpO14WI8",
      },
      {
        title: "How Much Salary Should You Expect As A School Teacher",
        url: "https://www.youtube.com/watch?v=49Bq1eEHtzE&ab_channel=KNowYourTeacherWithNupur",
      },
    ],
  },
  {
    code: "assistant",
    name: "Assistant",
    minimum_skills_required: "assistant to manager",
    minimum_qualifications: ["graduation"],
    life_style: [
      {
        title: "A Day in the Life of a Assistant",
        url: "https://www.youtube.com/shorts/_yX7lFNTokU",
      },
      {
        title: "How Much Salary Should You Expect As A Assistant",
        url: "https://www.youtube.com/shorts/MHlFJRBVazU",
      },
    ],
  },
  {
    code: "professor",
    name: "Professor/Faculty",
    minimum_skills_required:
      "master of subject, teaching skill, communication, english",
    minimum_qualifications: ["postgraduation"],
    preferred_streams: ["any"],
    life_style: [
      {
        title: "A Day in the Life of a Professor",
        url: "https://www.youtube.com/watch?v=o6xFo4mWPXs&ab_channel=CareerSetting",
      },
      {
        title: "How Much Salary Should You Expect As A Professor",
        url: "https://www.youtube.com/shorts/RMg8fupVg7c ",
      },
    ],
  },
  {
    code: "all",
    name: "All",
  },
  {
    code: "helper",
    name: "Helper",
    minimum_skills_required: "good nature",
    minimum_qualifications: ["10"],
    preferred_streams: ["any"],
    life_style: [
      {
        title: "A Day in the Life of a helper",
        url: "https://www.youtube.com/watch?v=7tTz_zFljVs",
      },
      {
        title: "How Much Salary Should You Expect As a helper",
        url: "https://www.youtube.com/watch?v=KSDToclQPss",
      },
    ],
  },
  {
    code: "store_keeper",
    name: "Store Keeper",
    minimum_skills_required: "clerk",
    minimum_qualifications: ["10"],
    preferred_streams: ["any"],
    life_style: [
      {
        title: "A Day in the Life of a stoker Keeper",
        url: "https://www.youtube.com/shorts/AzP4_KWS-tc",
      },
      {
        title: "How Much Salary Should You Expect As a Store Keeper",
        url: "https://www.youtube.com/watch?v=QVEuKl54mOE",
      },
    ],
  },
];
