

const category_masterdata = [
  {
    "code": "general",
    "name": "General"
  },
  {
    "code": "obc_ncl",
    "name": "OBC (NCL)"
  },
  {
    "code": "obc_cl",
    "name": "OBC (Cl)"
  },
  {
    "code": "sc",
    "name": "SC"
  },
  {
    "code": "st",
    "name": "ST"
  }
];

const subject_masterdata = [
  {
    "code": "science",
    "name": "Science"
  },
  {
    "code": "math",
    "name": "Math"
  },
  {
    "code": "commerce",
    "name": "Commerce"
  },
  {
    "code": "biology",
    "name": "Biology"
  }
];

const stream_masterdata = [
  {
    "code": "cs",
    "name": "Computer Science"
  },
  {
    "code": "it",
    "name": "Information Technology"
  },
  {
    "code": "civil",
    "name": "Civil Engineering"
  },
  {
    "code": "electrical",
    "name": "Electrical Engineering"
  },
  {
    "code": "mechanical",
    "name": "Mechanical Engineering"
  }
];

const qualification_masterdata = [
  {
    "code": "10",
    "name": "10th"
  },
  {
    "code": "12",
    "name": "12th"
  },
  {
    "code": "iti",
    "name": "ITI"
  },
  {
    "code": "diploma",
    "level": "diploma",
    "name": "Diploma"
  },
  {
    "code": "bca",
    "level": "graduation",
    "name": "BCA"
  },
  {
    "code": "bsc",
    "level": "graduation",
    "name": "B.Sc"
  },
  {
    "code": "be",
    "level": "graduation",
    "name": "B.E"
  },
  {
    "code": "btech",
    "level": "graduation",
    "name": "B.Tech"
  },
  {
    "code": "mca",
    "level": "post_graduation",
    "name": "MCA"
  },
  {
    "code": "msc",
    "level": "post_graduation",
    "name": "MSC"
  },
  {
    "code": "mtech",
    "level": "post_graduation",
    "name": "M.Tech"
  },
  {
    "code": "phd",
    "level": "post_graduation",
    "name": "PHD"
  }
];

  const jobtype_masterdata = [
  {
    "code": "private",
    "name": "Private"
  },
  {
    "code": "government",
    "name": "Government"
  }
];
  
  const industry_masterdata = [
  {
    "code": "cs_it_engineering",
    "name": "CS/IT"
  },
  {
    "code": "medical",
    "name": "Medical and Healthcare",
    "keywords": [
      "medical"
    ]
  },
  {
    "code": "library_sciences",
    "name": "Library Science",
    "keywords": [
      "librarian",
      "libray"
    ]
  },
  {
    "code": "education",
    "name": "Education",
    "keywords": [
      "teacher",
      "education",
      "teaching"
    ]
  },
  {
    "code": "law_and_justice",
    "name": "Law and Justice",
    "keywords": [
      "law"
    ]
  },
  {
    "code": "sports",
    "name": "Sports",
    "keywords": [
      "sports"
    ]
  },
  {
    "code": "agriculture",
    "name": "Agriculture"
  },
  {
    "code": "pharmacy",
    "name": "Pharmacy"
  },
  {
    "code": "civil_engineering",
    "name": "Civil Engineering"
  },
  {
    "code": "electrical_engineering",
    "name": "Electrical Engineering"
  },
  {
    "code": "environmental_engineering",
    "name": "Environmental Engineering"
  }
];
  
  const profile_masterdata = [
  {
    "code": "web_developer",
    "name": "Web Developer(Reactjs, html, css, js etc)",
    "minimum_skills_required": "HTML, CSS, Javascript, Reactjs, jQuery, Responsive website development, api integration, http, websocket, developer tool, SEO, wordpress",
    "minimum_qualifications": [
      "graduation"
    ],
    "preferred_streams": [
      "any"
    ],
    "entrance_exam": [
      "interview"
    ],
    "life_style": [
      {
        "title": "A Day in the Life of a Remote Web developer",
        "url": "https://www.youtube.com/watch?v=NtDclT4c8No"
      },
      {
        "title": "How Much Salary Should You Expect As A Fresher Developer",
        "url": "https://www.youtube.com/watch?v=pTelIKAEadI"
      }
    ]
  },
  {
    "code": "java_developer",
    "name": "Java Developer",
    "minimum_skills_required": "Java, Advance Java",
    "minimum_qualifications": [
      "graduation"
    ],
    "preferred_streams": [
      "any"
    ],
    "entrance_exam": [
      "interview"
    ]
  },
  {
    "code": "python_developer",
    "name": "Python Developer",
    "minimum_skills_required": "python, Analytics, http api, Django",
    "minimum_qualifications": [
      "graduation"
    ],
    "preferred_streams": [
      "any"
    ],
    "entrance_exam": [
      "interview"
    ]
  },
  {
    "code": "dba",
    "name": "DBA - Database Administrator",
    "minimum_skills_required": "SQL, NOSQL, DBA audit operations, traffic monitoring, connections, replica, master-slave",
    "minimum_qualifications": [
      "graduation"
    ],
    "preferred_streams": [
      "any"
    ],
    "entrance_exam": [
      "interview"
    ]
  },
  {
    "code": "nodejs_developer",
    "name": "Nodejs Developer",
    "minimum_skills_required": "nodejs, javascript, http api",
    "minimum_qualifications": [
      "graduation"
    ],
    "preferred_streams": [
      "any"
    ],
    "entrance_exam": [
      "interview"
    ]
  },
  {
    "code": "fullstack_developer",
    "name": "Full Stack Developer",
    "minimum_skills_required": "HTML, CSS, Javascript, Reactjs, jQuery, Responsive website development, api integration, http, websocket, developer tool, SEO, wordpress, nodejs, javascript, http api",
    "minimum_qualifications": [
      "graduation"
    ],
    "preferred_streams": [
      "any"
    ],
    "entrance_exam": [
      "interview"
    ]
  },
  {
    "code": "qa",
    "name": "QA - Quality Assurance",
    "minimum_skills_required": "test case writing, manual testing, automation testing, selenium, jmeter",
    "minimum_qualifications": [
      "graduation"
    ],
    "preferred_streams": [
      "any"
    ],
    "entrance_exam": [
      "interview"
    ]
  },
  {
    "code": "program_manager",
    "name": "Program Manager",
    "minimum_skills_required": "scrum, Jira, communication, documentation, awareness of technology and business",
    "minimum_qualifications": [
      "graduation"
    ],
    "preferred_streams": [
      "any"
    ],
    "entrance_exam": [
      "interview"
    ]
  },
  {
    "code": "product_manager",
    "name": "Product Manager",
    "minimum_skills_required": "product case studies, profit loss of product, usecase writing, market fitment, product cost, break even",
    "minimum_qualifications": [
      "graduation"
    ],
    "preferred_streams": [
      "any"
    ],
    "entrance_exam": [
      "interview"
    ]
  },
  {
    "code": "librarian",
    "name": "Librarian",
    "keywords": [
      "librarian"
    ],
    "minimum_skills_required": "ways to arrange book, publisers",
    "minimum_qualifications": [
      "blib"
    ],
    "preferred_streams": "NA"
  },
  {
    "code": "fellow",
    "name": "Fellow",
    "minimum_qualifications": [
      "postgraduation"
    ],
    "preferred_streams": [
      "any"
    ]
  },
  {
    "code": "nurse",
    "name": "Nurse",
    "minimum_skills_required": "assistant to doctor in medication",
    "minimum_qualifications": [
      "diploma"
    ],
    "preferred_streams": [
      "any"
    ]
  },
  {
    "code": "medical_officer",
    "name": "Medical Officer",
    "keywords": [
      "medical officer"
    ],
    "minimum_qualifications": [
      "mbbs"
    ],
    "preferred_streams": [
      "any"
    ]
  },
  {
    "code": "pharmacist",
    "name": "Pharmacist",
    "minimum_qualifications": [
      "bphrama"
    ],
    "preferred_streams": [
      "any"
    ]
  },
  {
    "code": "teacher",
    "name": "School Teacher",
    "keywords": [
      "teacher"
    ],
    "minimum_skills_required": "GK, math, reasoning, english, Hindi",
    "minimum_qualifications": [
      "ded\",\"bed"
    ],
    "preferred_streams": [
      "any"
    ]
  },
  {
    "code": "assistant",
    "name": "Assistant"
  },
  {
    "code": "all",
    "name": "All"
  }
];
