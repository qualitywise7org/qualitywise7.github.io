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
  },
  {
    "name": "civil_aviation_officer",
    "syllabus": "Aviation Laws and Regulations: ICAO Standards, Indian Civil Aviation Regulations (DGCA), Air Traffic Rules, Safety and Security Protocols.\n" +
                "Air Navigation: Principles of Flight, Airspace Classification, Navigation Aids (NDB, VOR, DME), Communication Systems.\n" +
                "Meteorology: Weather Patterns, Air Pressure, Winds, Clouds, Turbulence, Aviation Weather Reports (METAR, TAF).\n" +
                "Aircraft Systems: Aerodynamics, Aircraft Maintenance, Engine Systems, Flight Controls, Avionics.\n" +
                "General Awareness: Aviation Industry Developments, Aircraft Accidents, National and International Aviation News.\n" +
                "Communication Skills: Report Writing, Public Relations, Crisis Management, Aviation Safety Reports.\n" +
                "Mathematics and Physics: Basic Principles related to Aircraft Dynamics, Navigation Calculations, Aircraft Weight and Balance."
  }
];


  
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Function to normalize the job name (lowercase and remove special characters)
function normalizeString(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Fetch the syllabus based on the job query parameter
function displaySyllabus() {
  const jobParam = getQueryParam('job');
  
  if (!jobParam) {
    document.getElementById('job-title').textContent = 'Job not found';
    document.getElementById('syllabus-content').textContent = '';
    return;
  }

  // Normalize the job name from the URL param
  const normalizedJobParam = normalizeString(jobParam);

  // Find the job profile with normalized name
  const jobProfile = profile.find(job => normalizeString(job.name) === normalizedJobParam);

  if (jobProfile) {
    document.getElementById('job-title').textContent = `${jobProfile.name} Syllabus`;
    document.getElementById('syllabus-content').textContent = jobProfile.syllabus;
  } else {
    document.getElementById('job-title').textContent = 'Job Syllabus not found';
    document.getElementById('syllabus-content').textContent = '';
  }
}

// Call the display function on page load
window.onload = displaySyllabus;