// Your JSON data
const profile = [
  {
    "name": "railway-job",
    "syllabus": "Mathematics: Arithmetic, Algebra, Geometry, Trigonometry, and Mensuration. Reasoning: Analogies, Coding-Decoding, Syllogism, Puzzles, Data Sufficiency, and Logical Reasoning. General Science: Physics, Chemistry, and Biology. General Awareness: Current Affairs, Indian History, Geography, Constitution, and Sports."
  },
  {
    "name": "bank-job",
    "syllabus": "Quantitative Aptitude: Number Series, Data Interpretation, Simplification, and Arithmetic Problems. Reasoning Ability: Blood Relations, Seating Arrangement, Puzzles, and Syllogism. General Awareness: Banking Awareness, Current Affairs, and Financial Terms. English Language: Reading Comprehension, Cloze Test, Error Detection, and Para Jumbles."
  },
  {
    "name": "web-developer",
    "syllabus": "Frontend Development: HTML, CSS, JavaScript, React.js. Backend Development: Node.js, Express.js, Databases (SQL, MongoDB). Version Control: Git, GitHub. Web Security: HTTPS, JWT, OAuth. Responsive Design: Flexbox, CSS Grid, and Media Queries."
  },
  {
    "name": "civil-aviation-officer",
    "syllabus": "Aviation Laws: Air Traffic Regulations, Aircraft Act, and Safety Protocols. Navigation Systems: Radar, GPS, and Air Traffic Control. Meteorology: Weather Patterns, Wind, and Cloud Formations. Aviation Security: Threat Assessment, Airport Security Procedures, Emergency Management. Communication Skills: English Proficiency, Reporting, and Coordination."
  }
];

// Function to get query parameters
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Function to normalize the job name (lowercase and remove special characters)
function normalizeString(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Fetch the syllabus based on the profilecode query parameter
function displaySyllabus() {
  const jobParam = getQueryParam('profilecode');
  
  if (!jobParam) {
    document.getElementById('job-title').textContent = 'Job Syllabus not found';
    document.getElementById('syllabus-content').textContent = '';
    return;
  }

  // Normalize the job name from the URL param
  const normalizedJobParam = normalizeString(jobParam);

  // Find the job profile with normalized name
  const jobProfile = profile.find(job => normalizeString(job.name) === normalizedJobParam);

  if (jobProfile) {
    document.getElementById('job-title').textContent = `${jobProfile.name.replace('-', ' ')} Syllabus`;
    document.getElementById('syllabus-content').textContent = jobProfile.syllabus;
  } else {
    document.getElementById('job-title').textContent = '';
    document.getElementById('syllabus-content').textContent = ` Syllabus not found` ;
  }
}

// Call the display function on page load
window.onload = displaySyllabus;
