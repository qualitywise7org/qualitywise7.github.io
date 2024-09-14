// Sample JSON data with job profiles and syllabuses
const profile = [
  {
    "name": "railway",
    "syllabus": "Mathematics: Number System, Simplification, Decimals and Fractions, HCF, LCM, Ratio and Proportion, Percentage, Mensuration (2D and 3D), Time and Work, Time and Distance, Profit and Loss, Simple and Compound Interest, Elementary Algebra, Geometry and Trigonometry, Age Calculations, Calendar & Clock, Pipes and Cisterns.\n" +
                "General Intelligence and Reasoning: Analogies, Alphabetical and Number Series, Coding and Decoding, Mathematical Operations, Relationships, Syllogism, Jumbling, Venn Diagrams, Data Interpretation and Sufficiency, Conclusions and Decision Making, Similarities and Differences, Analytical Reasoning, Classification, Directions, Statement – Arguments and Assumptions, Puzzle-Based Questions.\n" +
                "General Awareness: Current Affairs, Indian Geography, Indian Polity and Constitution, Indian Economy, Sports, Environmental Issues, Scientific Developments, Indian History, Culture of India, Indian Railways, Government Schemes.\n" +
                "General Science: Physics (Light, Sound, Electricity, Magnetism, Motion), Chemistry (Elements, Periodic Table, Acids and Bases), Biology (Human Body, Cells, Genetics, Nutrition).\n" +
                "Technical Knowledge (for Technical Posts): Basic Engineering, Tools, Measurements, Workshop Practices, Power Systems."
  },
  {
    "name": "bank",
    "syllabus": "Quantitative Aptitude: Number Series, Simplification, Profit and Loss, Percentage, Simple and Compound Interest, Ratio and Proportion, Time and Distance, Time and Work, Data Interpretation.\n" +
                "Reasoning Ability: Puzzles, Seating Arrangement, Syllogism, Blood Relations, Coding-Decoding, Direction Sense, Input-Output, Data Sufficiency, Logical Reasoning.\n" +
                "General Awareness: Banking Terms, Financial Systems, Monetary Policies, Current Affairs, Indian Economy, Important Banking Schemes.\n" +
                "English Language: Reading Comprehension, Error Detection, Sentence Correction, Fill in the Blanks, Cloze Test, Para Jumbles.\n" +
                "Computer Awareness: Basics of Computers, Software and Hardware, Internet, Networking, MS Office, Computer Security."
  },
  {
    "name": "web_developer",
    "syllabus": "Frontend Development: HTML, CSS, JavaScript, Responsive Design, CSS Frameworks (Bootstrap, Tailwind), DOM Manipulation, Version Control (Git), Web Performance Optimization.\n" +
                "Backend Development: Node.js, Express.js, REST APIs, Database Management (SQL, NoSQL), Authentication (JWT, OAuth), Server-Side Rendering (SSR).\n" +
                "Full Stack Development: MERN Stack (MongoDB, Express, React, Node), Deployment (Netlify, Heroku, Vercel), API Integration, Web Security Best Practices.\n" +
                "Additional Skills: DevOps Basics, Continuous Integration (CI/CD), Testing (Unit Testing, End-to-End Testing), Agile Methodologies."
  }
];


  
  // Function to get the query parameter from the URL
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  // Get the job name from the URL
  const jobName = getQueryParam('job');
  
  // Find the syllabus for the job
  const jobProfile = profile.find(p => p.name === jobName);
  
  // Display the syllabus dynamically in the HTML
  const syllabusContainer = document.getElementById('syllabus-container');
  if (jobProfile) {
    syllabusContainer.innerHTML = `
      <h1>${jobProfile.name} Syllabus</h1>
      <p>${jobProfile.syllabus}</p>
    `;
  } else {
    syllabusContainer.innerHTML = `<p>Syllabus not found</p>`;
  }
  