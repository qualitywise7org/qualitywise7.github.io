// ============================================================
// Findme: career clusters, dimensions and JobsDoor360 product links.
//
// This is the ONE data file for "what a cluster looks like". The engine
// (findme-engine.js) scores a user against CLUSTERS[*].vector and the
// report (findme-report.js) reads roles, exams, plans and products from
// here. To align with other psychometric work later, edit only this file.
//
// Plain ES module with no DOM access, so Node tests can import it.
// Content (roles, exams, plans) should be reviewed by the JobsDoor360 team.
// ============================================================

// ---- Dimensions -------------------------------------------------------
// RIASEC (Holland), Big Five (OCEAN), talent signals (Gardner-inspired),
// and work values (Schein anchors + work-values inventories).
export const DIM_GROUPS = {
  riasec: { weight: 1.0, dims: ["R", "I", "A", "S", "E", "C"] },
  big5: { weight: 0.5, dims: ["O", "C_big", "E_big", "A_big", "N"] },
  talent: { weight: 0.8, dims: ["t_body", "t_music", "t_word", "t_logic", "t_nature", "t_people", "t_self", "t_space"] },
  values: { weight: 0.5, dims: ["v_security", "v_autonomy", "v_service", "v_money", "v_impact", "v_creativity", "v_lifestyle", "v_challenge"] },
};

export const DIMS = Object.values(DIM_GROUPS).flatMap((g) => g.dims);

export function dimGroup(dim) {
  for (const [name, g] of Object.entries(DIM_GROUPS)) if (g.dims.includes(dim)) return name;
  return null;
}

// Plain-language labels used in the report. `low` is shown when the score
// is clearly negative (for N, low means "calm under pressure").
export const DIM_INFO = {
  R: { label: "Hands-on doer", hi: "Haath se kaam karne wale", plain: "You like making, fixing and doing real, physical things." },
  I: { label: "Curious thinker", hi: "Sochne-samajhne wale", plain: "You like figuring out how and why things work." },
  A: { label: "Creator", hi: "Creative soch wale", plain: "You like expressing ideas in your own original way." },
  S: { label: "Helper", hi: "Logon ki madad karne wale", plain: "You feel good when you teach, care for or support people." },
  E: { label: "Go-getter", hi: "Aage badhkar lead karne wale", plain: "You like leading, persuading and making things happen." },
  C: { label: "Organiser", hi: "Plan aur system wale", plain: "You like order, clear steps and getting the details right." },

  O: { label: "Open to new ideas", low: "Prefers the familiar", plain: "You enjoy new experiences, ideas and ways of doing things." },
  C_big: { label: "Disciplined", low: "Flexible and spontaneous", plain: "You plan ahead and finish what you start." },
  E_big: { label: "Outgoing", low: "Quiet and reflective", plain: "You get energy from people and lively places." },
  A_big: { label: "Warm and cooperative", low: "Direct and competitive", plain: "You care about harmony and other people's feelings." },
  N: { label: "Feels things deeply", low: "Calm under pressure", plain: "Pressure and setbacks affect you strongly." },

  t_body: { label: "Body and movement", plain: "You think and express yourself through movement." },
  t_music: { label: "Music and rhythm", plain: "Sound, rhythm and melody come naturally to you." },
  t_word: { label: "Words and language", plain: "You are good with words, speaking or writing." },
  t_logic: { label: "Logic and numbers", plain: "Patterns, numbers and step-by-step reasoning click for you." },
  t_nature: { label: "Nature and living things", plain: "Plants, animals, the body and the natural world interest you." },
  t_people: { label: "Reading people", plain: "You understand what others feel and need." },
  t_self: { label: "Self-awareness", plain: "You know your own mind and reflect a lot." },
  t_space: { label: "Visual and spatial", plain: "You picture things in 3D and notice how things look." },

  v_security: { label: "Stability", plain: "A steady income and a secure path matter to you." },
  v_autonomy: { label: "Freedom", plain: "You want to do things your own way." },
  v_service: { label: "Helping others", plain: "You want your work to help people directly." },
  v_money: { label: "Earning well", plain: "Financial reward is an important goal for you." },
  v_impact: { label: "Making a difference", plain: "You want to change things at a big scale." },
  v_creativity: { label: "Creative expression", plain: "You need room to create and express yourself." },
  v_lifestyle: { label: "Life balance", plain: "Time for family, health and hobbies matters to you." },
  v_challenge: { label: "Tough challenges", plain: "You are driven by hard problems and competition." },
};

// ---- Life stage (picked on the start screen) ----------------------------
export const STAGES = {
  school_8_10: { label: "Class 8 to 10", hi: "Class 8 se 10" },
  school_11_12: { label: "Class 11 or 12", hi: "Class 11 ya 12" },
  college: { label: "In college", hi: "College mein" },
  graduate: { label: "Graduated or working", hi: "Graduate / job mein" },
};
export const SCHOOL_STAGES = ["school_8_10", "school_11_12"];

// ---- JobsDoor360 products -------------------------------------------------
// Shown in the report ONLY when a cluster rule below matches.
const WP = "https://allizwell.jobsdoor360.in/";
export const PRODUCTS = {
  courses: {
    label: "JobsDoor360 Courses",
    href: "/courses/",
    icon: "fa-laptop-code",
    why: "Web, backend and full-stack development, with mock interviews and internships.",
  },
  certifications: {
    label: "Free certification tests",
    href: "/test/",
    icon: "fa-certificate",
    why: "Check your level in coding and tech skills and earn a free certificate.",
  },
  study_school: {
    label: "Study material: Class 5 to 12",
    href: "/study-material/",
    icon: "fa-book-open",
    why: "Free books, videos and activities to make your school basics strong.",
  },
  study_dsa: {
    label: "Study material: DSA",
    href: WP + "dsa/",
    icon: "fa-diagram-project",
    external: true,
    why: "Data structures and algorithms, the core of coding interviews.",
  },
  study_java: {
    label: "Study material: Java",
    href: WP + "java/",
    icon: "fa-mug-hot",
    external: true,
    why: "Core Java and OOP, still one of the most hired-for languages.",
  },
  study_ml: {
    label: "Study material: Machine Learning",
    href: WP + "machine-learning/",
    icon: "fa-brain",
    external: true,
    why: "The maths, main algorithms and small projects to start with ML.",
  },
  study_sd: {
    label: "Study material: System Design",
    href: WP + "system-design/",
    icon: "fa-sitemap",
    external: true,
    why: "How big systems scale, with real interview questions.",
  },
  placement: {
    label: "Placement classes",
    href: WP + "placement-classes/",
    icon: "fa-briefcase",
    external: true,
    why: "Aptitude, coding rounds and interview prep for campus placements.",
  },
  smart_career: {
    label: "Smart Career assessment",
    href: "/smart-decisions/career/",
    icon: "fa-graduation-cap",
    why: "A focused 13-question check on stream and course choice after Class 10 or 12.",
  },
  counselling: {
    label: "Career counselling",
    href: "/career-counselling/",
    icon: "fa-comments",
    why: "Talk it through with a counsellor and get a written plan for your path.",
  },
  smart_investment: {
    label: "Smart Investment",
    href: "/smart-decisions/investment/",
    icon: "fa-chart-line",
    why: "See how a real money decision (a property price) is analysed, for free.",
  },
};

// ---- Clusters -------------------------------------------------------------
// vector: raw affinity per dimension (-2..3). Missing dims = 0. The engine
// centres these across clusters, so only differences between clusters count.
// products: { key, stages?: [...], maxRank }  -> show the product only if
// this cluster is ranked <= maxRank and (no stages listed or user stage in list).
export const CLUSTERS = {
  engineering_tech: {
    label: "Engineering and Technology",
    hi: "Engineering aur Technology",
    emoji: "💻",
    icon: "fa-microchip",
    tagline: "You enjoy logic, building and solving tricky problems.",
    tagline_hi: "Tumhe logic, cheezein banana aur mushkil problems solve karna pasand hai.",
    vector: { R: 2, I: 3, C: 1.5, O: 1.5, C_big: 1, t_logic: 3, t_space: 2, v_challenge: 2, v_money: 1, v_security: 1 },
    roles: [
      { title: "Software developer", note: "builds apps, websites and the systems behind them" },
      { title: "Data scientist / ML engineer", note: "finds patterns in data and builds AI models" },
      { title: "Electronics or robotics engineer", note: "designs circuits, drones and smart devices" },
      { title: "Cybersecurity analyst", note: "protects systems from attacks" },
      { title: "Civil or mechanical engineer", note: "designs roads, bridges, engines and machines" },
      { title: "Game developer", note: "codes the logic and physics of games", nontraditional: true },
      { title: "Indie app maker", note: "builds and sells your own small apps or tools", nontraditional: true },
      { title: "Tech YouTuber / developer advocate", note: "teaches tech to others online", nontraditional: true },
    ],
    exams: ["JEE Main", "JEE Advanced", "BITSAT", "State CETs (MHT CET, KCET, WBJEE)", "CUET (for BSc CS / BCA)", "GATE (after graduation)"],
    courses: ["B.Tech / BE", "BCA or BSc Computer Science", "Polytechnic diploma in engineering"],
    skills: ["Maths and problem solving", "One programming language (Python or Java)", "Data structures and algorithms", "Building small projects"],
    plan: {
      d30: ["Pick one language (Python or Java) and code 20 minutes a day", "Solve 15 easy logic or coding puzzles"],
      d60: ["Build one small project you would actually use (a to-do app, a calculator, a game)", "Learn basic data structures: arrays, strings, hashing"],
      d90: ["Put your project on GitHub and show it to someone", "Try a free certification test and note your weak topics"],
    },
    products: [
      { key: "courses", stages: ["college", "graduate"], maxRank: 2 },
      { key: "certifications", maxRank: 2 },
      { key: "placement", stages: ["college"], maxRank: 2 },
      { key: "study_dsa", stages: ["school_11_12", "college", "graduate"], maxRank: 2 },
      { key: "study_java", stages: ["school_11_12", "college", "graduate"], maxRank: 2 },
      { key: "study_ml", stages: ["college", "graduate"], maxRank: 1 },
      { key: "study_sd", stages: ["college", "graduate"], maxRank: 1 },
      { key: "study_school", stages: ["school_8_10", "school_11_12"], maxRank: 2 },
    ],
  },

  medicine_health: {
    label: "Medicine and Health",
    hi: "Medicine aur Health",
    emoji: "🩺",
    icon: "fa-stethoscope",
    tagline: "You care about people and are curious about how the body works.",
    tagline_hi: "Tumhe logon ki parwah hai aur sharir kaise kaam karta hai, ye jaanne ka shauk hai.",
    vector: { I: 3, S: 2.5, R: 1, C_big: 2.5, A_big: 2, N: -1.5, t_nature: 2, t_people: 1.5, t_logic: 1, v_service: 3, v_security: 2, v_challenge: 1 },
    roles: [
      { title: "Doctor (MBBS and beyond)", note: "diagnoses and treats patients" },
      { title: "Dentist", note: "cares for teeth and oral health" },
      { title: "Nurse", note: "the backbone of patient care in every hospital" },
      { title: "Physiotherapist", note: "helps people recover movement after injury" },
      { title: "Pharmacist", note: "knows medicines inside out" },
      { title: "Clinical psychologist", note: "supports mental health (needs an MPhil/licensed training)" },
      { title: "Sports nutritionist", note: "plans diets for athletes and teams", nontraditional: true },
      { title: "Public health or health-tech professional", note: "improves health systems or builds health apps", nontraditional: true },
    ],
    exams: ["NEET-UG (MBBS, BDS, BAMS, BHMS)", "CUET (BSc nursing / allied health at some universities)", "State CETs for B.Pharm", "AIIMS nursing and paramedical entrances"],
    courses: ["MBBS / BDS / AYUSH degrees", "BSc Nursing", "BPT (physiotherapy)", "B.Pharm", "BSc Nutrition or Psychology"],
    skills: ["Biology and chemistry basics", "Patience and calm under pressure", "Clear, kind communication", "A study routine you can keep for years"],
    plan: {
      d30: ["Read about 3 health careers beyond doctor (nurse, physio, pharmacist)", "Make a weekly biology revision timetable"],
      d60: ["Talk to one person working in a hospital or clinic about their day", "Take a first aid course (Red Cross or St John Ambulance)"],
      d90: ["Volunteer at a health camp or NGO for a few days", "Decide whether NEET is your main route and plan your preparation"],
    },
    products: [
      { key: "study_school", stages: ["school_8_10", "school_11_12"], maxRank: 2 },
      { key: "smart_career", stages: ["school_8_10", "school_11_12"], maxRank: 2 },
    ],
  },

  pure_science_research: {
    label: "Science and Research",
    hi: "Science aur Research",
    emoji: "🔬",
    icon: "fa-flask",
    tagline: "You love asking 'why' and digging until you find the answer.",
    tagline_hi: "Tum 'kyun' poochte ho aur jawab milne tak khojte rehte ho.",
    vector: { I: 3, O: 3, A: 0.5, C_big: 1.5, E_big: -1, t_logic: 2.5, t_nature: 2.5, t_self: 1.5, v_challenge: 2.5, v_autonomy: 1.5, v_impact: 1 },
    roles: [
      { title: "Research scientist", note: "physics, chemistry, biology or maths at an institute or lab" },
      { title: "Data or climate scientist", note: "models weather, climate and big data" },
      { title: "Astronomer / space scientist", note: "works with ISRO-style missions and telescopes" },
      { title: "Environmental scientist", note: "studies pollution, water and wildlife" },
      { title: "Professor", note: "teaches and researches at a university" },
      { title: "Science communicator", note: "explains science through videos, books or museums", nontraditional: true },
      { title: "Lab-to-startup founder", note: "turns a research idea into a product", nontraditional: true },
    ],
    exams: ["IISER Aptitude Test (IAT)", "NEST (NISER and UM-DAE CEBS)", "CUET (BSc at central universities)", "JEE (for IISc / IIT science programmes)", "IIT JAM (after BSc)"],
    courses: ["BS-MS (IISER / NISER)", "BSc in a pure science", "Integrated MSc"],
    skills: ["Deep reading and note-making", "Maths and statistics", "Doing small experiments", "Writing up what you found"],
    plan: {
      d30: ["Pick one science question you care about and read 3 articles on it", "Watch one research talk or lecture a week"],
      d60: ["Do a small home experiment or data project and write a one-page report", "Join a science club, olympiad or online course"],
      d90: ["Email a college lab or teacher to ask about a short project", "Shortlist IISER / NISER / university BSc options"],
    },
    products: [
      { key: "study_school", stages: ["school_8_10", "school_11_12"], maxRank: 2 },
      { key: "study_ml", stages: ["college", "graduate"], maxRank: 1 },
    ],
  },

  finance_business: {
    label: "Finance and Business",
    hi: "Finance aur Business",
    emoji: "📊",
    icon: "fa-chart-pie",
    tagline: "You are good with numbers, plans and how money works.",
    tagline_hi: "Tum numbers, planning aur paison ke mamle mein achhe ho.",
    vector: { C: 3, E: 2, I: 1, C_big: 2.5, t_logic: 2.5, t_people: 1, v_money: 3, v_security: 2 },
    roles: [
      { title: "Chartered Accountant (CA)", note: "audits, taxes and company finance" },
      { title: "Financial or investment analyst", note: "studies companies and markets" },
      { title: "Banker", note: "from branch banking to investment banking" },
      { title: "Company Secretary / CMA", note: "keeps companies compliant and cost-efficient" },
      { title: "Business analyst / consultant", note: "helps companies fix how they work" },
      { title: "Actuary", note: "uses maths to price risk for insurers" },
      { title: "Personal-finance educator", note: "teaches people to manage money online", nontraditional: true },
      { title: "Fintech product manager", note: "designs payment and investing apps", nontraditional: true },
    ],
    exams: ["CA Foundation (ICAI)", "CSEET (Company Secretary)", "CMA Foundation", "IPMAT (IIM Indore / Rohtak)", "CUET (BCom, BBA, Economics)", "NPAT / SET (private BBA)"],
    courses: ["BCom / BCom (Hons)", "BBA", "BA / BSc Economics", "CA / CS / CMA"],
    skills: ["Accounts and Excel", "Reading a company's numbers", "Clear written reports", "Basic economics"],
    plan: {
      d30: ["Track your own spending for a month in a spreadsheet", "Read the business page of a newspaper 3 times a week"],
      d60: ["Learn basic Excel (formulas, charts) with free videos", "Read one company's annual report summary and note 5 things"],
      d90: ["Compare CA, BCom and BBA routes and pick one to explore deeply", "Try a virtual stock-market game without real money"],
    },
    products: [
      { key: "counselling", maxRank: 2 },
      { key: "smart_investment", stages: ["graduate"], maxRank: 1 },
    ],
  },

  entrepreneurship: {
    label: "Entrepreneurship",
    hi: "Apna Business / Startup",
    emoji: "🚀",
    icon: "fa-rocket",
    tagline: "You spot chances, take charge and like building something of your own.",
    tagline_hi: "Tum mauke pehchante ho, aage badhte ho aur apna kuch banana chahte ho.",
    vector: { E: 3, A: 1, O: 2.5, E_big: 2.5, N: -1, t_people: 2, t_self: 1.5, v_autonomy: 3, v_money: 2, v_challenge: 2, v_impact: 1, v_security: -1.5 },
    roles: [
      { title: "Startup founder", note: "builds a new product or service from scratch" },
      { title: "Family-business innovator", note: "takes an existing business online or to new cities" },
      { title: "Sales and business development", note: "wins customers and partners" },
      { title: "Product manager", note: "decides what a product should do and why" },
      { title: "D2C brand owner", note: "sells your own brand online", nontraditional: true },
      { title: "Social entrepreneur", note: "runs a business that solves a social problem", nontraditional: true },
      { title: "Creator-entrepreneur", note: "builds a business around your audience", nontraditional: true },
    ],
    exams: ["IPMAT (IIM integrated management)", "CUET (BBA / BCom)", "NPAT / SET (private BBA)", "CAT (MBA, after graduation)"],
    courses: ["BBA / BMS", "Any degree plus college E-cell", "Startup India / Atal Innovation Mission programmes"],
    skills: ["Selling and talking to customers", "Basic accounts and pricing", "Taking feedback without giving up", "Making a simple plan and budget"],
    plan: {
      d30: ["List 10 problems people around you complain about", "Talk to 5 people about one of them"],
      d60: ["Run a tiny test: sell something at a fest, stall or online for a week", "Learn how to work out cost, price and profit"],
      d90: ["Write a one-page business plan and show it to a mentor", "Join your school ATL lab or college E-cell"],
    },
    products: [
      { key: "counselling", maxRank: 2 },
    ],
  },

  law_civil_services: {
    label: "Law, Civil Services and Public Life",
    hi: "Law, Civil Services aur Public Service",
    emoji: "⚖️",
    icon: "fa-scale-balanced",
    tagline: "You care about fairness, rules and making society work better.",
    tagline_hi: "Tumhe insaaf, niyam aur samaj ko behtar banane ki parwah hai.",
    vector: { E: 2, S: 2, C: 2, I: 1, C_big: 2.5, E_big: 1, t_word: 3, t_people: 1.5, v_service: 2.5, v_impact: 3, v_security: 2 },
    roles: [
      { title: "Lawyer / advocate", note: "argues cases and advises clients" },
      { title: "Corporate lawyer", note: "handles deals and contracts for companies" },
      { title: "IAS / IPS / IFS officer", note: "runs districts, policing or diplomacy (via UPSC)" },
      { title: "Judge", note: "via judicial services exams after law" },
      { title: "Defence officer", note: "Army, Navy or Air Force (via NDA / CDS)" },
      { title: "Policy researcher", note: "studies what laws and schemes actually work", nontraditional: true },
      { title: "Legal-tech or legal content creator", note: "explains rights and laws simply online", nontraditional: true },
    ],
    exams: ["CLAT", "AILET (NLU Delhi)", "MH CET Law and other state law CETs", "CUET (BA Political Science, History)", "UPSC CSE (after graduation)", "State PSCs and SSC CGL", "NDA / CDS (defence)"],
    courses: ["5-year integrated LLB (BA LLB, BBA LLB)", "BA in Political Science, History or Economics", "3-year LLB after graduation"],
    skills: ["Reading and summarising long texts", "Debating and public speaking", "Current affairs habit", "Clear writing"],
    plan: {
      d30: ["Read one newspaper editorial a day and summarise it in 3 lines", "Watch a Rajya Sabha TV or Supreme Court explainer"],
      d60: ["Join a debate, MUN or youth parliament", "Try 3 CLAT or UPSC-style reasoning passages a week"],
      d90: ["Visit a district court or talk to a lawyer or officer", "Choose between the law and UPSC routes and plan your next year"],
    },
    products: [
      { key: "counselling", maxRank: 2 },
      { key: "smart_career", stages: ["school_8_10", "school_11_12"], maxRank: 2 },
    ],
  },

  design_visual: {
    label: "Design and Visual Arts",
    hi: "Design aur Visual Arts",
    emoji: "🎨",
    icon: "fa-palette",
    tagline: "You see the world in shapes, colours and better ways to make things.",
    tagline_hi: "Tum duniya ko shapes, colours aur behtar design ki nazar se dekhte ho.",
    vector: { A: 3, R: 1, I: 0.5, O: 3, t_space: 3, t_self: 1, v_creativity: 3, v_autonomy: 1.5 },
    roles: [
      { title: "UI/UX designer", note: "designs how apps and websites look and feel" },
      { title: "Fashion designer", note: "creates clothes, textiles and accessories" },
      { title: "Graphic designer / illustrator", note: "logos, posters, books and brands" },
      { title: "Architect", note: "designs buildings and spaces" },
      { title: "Product / industrial designer", note: "designs everyday objects" },
      { title: "Animator or game artist", note: "brings characters and worlds to life" },
      { title: "Tattoo or mural artist", note: "art on skin and walls", nontraditional: true },
      { title: "Craft revival designer", note: "works with artisans to modernise Indian crafts", nontraditional: true },
    ],
    exams: ["NID DAT", "NIFT entrance", "UCEED (IIT B.Des)", "NATA / JEE Main Paper 2 (architecture)", "Private design school tests (e.g. Srishti, Pearl, MIT-ID)"],
    courses: ["B.Des", "B.Arch", "BFA (Fine Arts)", "Diploma in animation or UI design"],
    skills: ["Sketching every day", "A design tool (Figma, Canva, Illustrator)", "Observing and noting how things are used", "Building a portfolio"],
    plan: {
      d30: ["Keep a sketchbook and draw one thing a day", "Redesign one poster or app screen you dislike"],
      d60: ["Learn Figma or Canva basics and make 3 small designs", "Practise NID / NIFT-style sample questions"],
      d90: ["Put 8 to 10 best pieces into a simple portfolio", "Visit a design college open day or exhibition"],
    },
    products: [
      { key: "counselling", maxRank: 2 },
      { key: "smart_career", stages: ["school_8_10", "school_11_12"], maxRank: 2 },
    ],
  },

  performing_arts: {
    label: "Performing Arts",
    hi: "Performing Arts (Dance, Music, Acting)",
    emoji: "💃",
    icon: "fa-masks-theater",
    tagline: "You come alive on stage, with music, movement and an audience.",
    tagline_hi: "Stage, music aur dance pe tum sabse zyada khilte ho.",
    vector: { A: 3, S: 1, E: 1, O: 2.5, E_big: 2, t_body: 3, t_music: 3, t_self: 1.5, v_creativity: 3, v_lifestyle: 1.5, v_security: -1 },
    roles: [
      { title: "Dancer / performer", note: "classical, contemporary or film" },
      { title: "Choreographer", note: "creates dance for stage, films and events" },
      { title: "Musician / singer / music producer", note: "performs, records or produces" },
      { title: "Actor (stage, film, OTT)", note: "brings stories to life" },
      { title: "Dance or movement educator", note: "teaches in schools, studios or online", nontraditional: true },
      { title: "Fitness or dance entrepreneur", note: "runs your own dance-fitness studio or classes", nontraditional: true },
      { title: "Event and show director", note: "plans weddings, concerts and stage shows", nontraditional: true },
      { title: "Dance / movement therapy practitioner", note: "uses movement for well-being (needs proper certification)", nontraditional: true },
    ],
    exams: ["CUET (BA / BPA in performing arts at central universities)", "University auditions (e.g. MSU Baroda, BHU, Rabindra Bharati)", "Gandharva Mahavidyalaya / Trinity grade exams", "NSD and FTII entrances (after graduation)"],
    courses: ["BPA / BA in Dance, Music or Theatre", "Diploma from a recognised academy", "Certified fitness or dance-fitness trainer courses"],
    skills: ["Daily practice (riyaz)", "Stage confidence", "Recording and posting your work", "Basic business skills for classes and shows"],
    plan: {
      d30: ["Fix a daily practice slot, even 30 minutes", "Record one performance a week and watch it back"],
      d60: ["Perform at school, college or a local event", "Find a guru, academy or online mentor"],
      d90: ["Create a short showreel or Instagram page of your work", "Look up BPA courses and grade exams and pick a route"],
    },
    products: [
      { key: "counselling", maxRank: 2 },
    ],
  },

  sports: {
    label: "Sports and Fitness",
    hi: "Sports aur Fitness",
    emoji: "🏏",
    icon: "fa-person-running",
    tagline: "You love the field, the competition and pushing your body.",
    tagline_hi: "Tumhe maidan, competition aur apni body ko push karna pasand hai.",
    vector: { R: 3, E: 1, S: 0.5, C_big: 2, E_big: 1.5, N: -2, t_body: 3, t_nature: 0.5, v_challenge: 3, v_lifestyle: 1.5 },
    roles: [
      { title: "Professional athlete", note: "cricket, football, kabaddi, athletics and more" },
      { title: "Coach", note: "trains players and teams" },
      { title: "Fitness trainer", note: "gyms, sports clubs or online" },
      { title: "Sports physiotherapist", note: "keeps athletes fit and recovering" },
      { title: "Defence or police services", note: "fitness-heavy service careers (via NDA, CAPF)" },
      { title: "Sports analyst", note: "uses data and video to improve teams", nontraditional: true },
      { title: "Esports player or coach", note: "competitive gaming", nontraditional: true },
      { title: "Sports commentator or creator", note: "talks and makes content about the game", nontraditional: true },
    ],
    exams: ["SAI selection trials and Khelo India", "State and national federation trials", "LNIPE / university BPEd or BPES entrances", "NIS Patiala coaching diploma", "NDA (if defence appeals)"],
    courses: ["BPEd / BPES (physical education)", "BSc Sports Science", "Certified fitness trainer courses"],
    skills: ["Training discipline", "Diet and recovery", "Handling pressure and losses", "A backup skill alongside sport"],
    plan: {
      d30: ["Train on a fixed schedule and log every session", "Pick your main sport and position"],
      d60: ["Join a club, academy or district trial", "Learn basics of sports nutrition and recovery"],
      d90: ["Play one competitive tournament", "Talk to a coach about trials and a backup study plan"],
    },
    products: [
      { key: "counselling", maxRank: 2 },
    ],
  },

  content_media: {
    label: "Content, Media and Communication",
    hi: "Content, Media aur Communication",
    emoji: "🎬",
    icon: "fa-video",
    tagline: "You love telling stories and getting people to listen.",
    tagline_hi: "Tumhe kahaniyan sunana aur logon ka dhyaan kheenchna pasand hai.",
    vector: { A: 2.5, E: 2, S: 1, O: 2.5, E_big: 2, t_word: 2.5, t_people: 2, t_music: 0.5, t_space: 1, v_creativity: 2.5, v_autonomy: 2, v_impact: 1, v_money: 1 },
    roles: [
      { title: "Content creator / YouTuber", note: "builds an audience around a topic you love" },
      { title: "Journalist / reporter", note: "finds and tells true stories" },
      { title: "Video editor or filmmaker", note: "shapes footage into stories" },
      { title: "Copywriter / content writer", note: "writes for brands and websites" },
      { title: "Social media manager", note: "runs brand pages and campaigns" },
      { title: "Podcaster or RJ", note: "voice-first storytelling", nontraditional: true },
      { title: "Brand storyteller for startups", note: "helps young companies find their voice", nontraditional: true },
    ],
    exams: ["CUET (BA Journalism and Mass Communication)", "University and private media school tests (e.g. SIMC via SET, XIC)", "IIMC (PG diploma, after graduation)", "FTII / SRFTI JET (film, after graduation)"],
    courses: ["BA Journalism and Mass Communication (BJMC)", "BA English or Media Studies", "Short courses in video editing or digital marketing"],
    skills: ["Writing every day", "Phone video and basic editing", "Understanding your audience", "Consistency (posting on a schedule)"],
    plan: {
      d30: ["Pick one topic and post 4 pieces (posts, reels or blogs)", "Learn one free editing app well"],
      d60: ["Study 3 creators you admire and note what they do differently", "Write for your school or college magazine"],
      d90: ["Look back at your 12 best pieces and see what worked", "Explore BJMC courses or a media internship"],
    },
    products: [
      { key: "counselling", maxRank: 2 },
    ],
  },

  social_education: {
    label: "Education, Psychology and Social Impact",
    hi: "Education, Psychology aur Social Work",
    emoji: "🤝",
    icon: "fa-hands-holding-child",
    tagline: "You are happiest when you help someone grow or feel better.",
    tagline_hi: "Kisi ki madad karke ya kisi ko aage badhte dekh tumhe sabse zyada khushi milti hai.",
    vector: { S: 3, A: 0.5, A_big: 3, E_big: 1, t_people: 3, t_word: 1.5, t_self: 1, v_service: 3, v_impact: 2, v_security: 1 },
    roles: [
      { title: "Teacher", note: "school, college or coaching" },
      { title: "Counsellor / psychologist", note: "supports students and adults (needs proper training)" },
      { title: "Social worker", note: "works with communities and NGOs" },
      { title: "HR professional", note: "hires and looks after people in companies" },
      { title: "Special educator", note: "teaches children with different learning needs" },
      { title: "Edtech content creator", note: "makes learning videos and courses", nontraditional: true },
      { title: "NGO founder or CSR manager", note: "runs social programmes", nontraditional: true },
    ],
    exams: ["CUET (BA Psychology, Sociology, B.El.Ed, BSW)", "CTET / state TETs (teaching, after B.Ed)", "Teach For India and similar fellowships (after graduation)", "CUET-PG for MA / MSW (e.g. TISS)"],
    courses: ["BA Psychology", "BSW (social work)", "B.El.Ed / B.Ed", "BA Sociology"],
    skills: ["Listening well", "Explaining things simply", "Patience", "Planning small sessions or activities"],
    plan: {
      d30: ["Teach a younger student or sibling one topic a week", "Read about 3 helping careers (teacher, counsellor, social worker)"],
      d60: ["Volunteer with NSS, an NGO or a community drive", "Try a free intro course in psychology"],
      d90: ["Run one small workshop or activity for your class or locality", "Shortlist psychology, BSW or B.El.Ed colleges"],
    },
    products: [
      { key: "counselling", maxRank: 2 },
      { key: "study_school", stages: ["school_8_10", "school_11_12"], maxRank: 1 },
    ],
  },

  skilled_trades: {
    label: "Skilled Trades and Hands-on Careers",
    hi: "Skilled Trades aur Hands-on Kaam",
    emoji: "🛠️",
    icon: "fa-screwdriver-wrench",
    tagline: "You like real tools, real results and learning by doing.",
    tagline_hi: "Tumhe asli tools, asli result aur kaam karke seekhna pasand hai.",
    vector: { R: 3, C: 1.5, C_big: 1.5, O: -0.5, t_body: 1.5, t_space: 2, t_logic: 1, v_security: 2, v_lifestyle: 1.5, v_autonomy: 1 },
    roles: [
      { title: "Electrician or EV technician", note: "wiring, solar and electric vehicles" },
      { title: "Automobile or aircraft maintenance technician", note: "keeps vehicles and planes running" },
      { title: "Chef / hotel professional", note: "kitchens, hotels and hospitality" },
      { title: "CNC machinist or welder", note: "precision manufacturing" },
      { title: "Interior fit-out or carpentry specialist", note: "builds furniture and interiors" },
      { title: "Drone pilot / operator", note: "survey, farming and film shoots", nontraditional: true },
      { title: "Repair or workshop business owner", note: "runs your own service centre", nontraditional: true },
    ],
    exams: ["ITI admissions (state)", "Polytechnic diploma entrances (state)", "NCHM JEE (hotel management)", "Skill India / PMKVY and apprenticeship (NAPS) schemes", "DGCA-approved drone pilot training"],
    courses: ["ITI trades", "Polytechnic diploma", "Hotel management", "Apprenticeships with companies"],
    skills: ["Using tools safely", "Reading simple drawings and manuals", "Precision and patience", "Talking to customers"],
    plan: {
      d30: ["Fix or build one thing at home with a guide video", "List 3 trades that interest you and what they pay locally"],
      d60: ["Spend a day with a technician, chef or mechanic", "Look up the nearest ITI or polytechnic and its courses"],
      d90: ["Do a short skill course or apprenticeship", "Plan which certificate gets you working fastest"],
    },
    products: [
      { key: "counselling", maxRank: 2 },
    ],
  },
};

export const CLUSTER_KEYS = Object.keys(CLUSTERS);

// Full-length vector for a cluster (missing dims = 0), in DIMS order.
export function clusterVector(key) {
  const v = CLUSTERS[key].vector;
  return DIMS.map((d) => v[d] || 0);
}
