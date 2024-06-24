
const societies = [
    "Adventure Sports Clubs",
    "Agricultural Cooperative Societies",
    "Apartment Owners' Association",
    "Art and Craft Societies",
    "Bar Council of India (BCI)",
    "Board of Control for Cricket in India (BCCI)",
    "Charitable Trusts",
    "Confederation of Indian Industry (CII)",
    "Consumer Cooperative Societies",
    "Cooperative Housing Societies",
    "Credit Cooperative Societies",
    "Cultural Associations",
    "Disaster Relief Societies",
    "Educational Institutions",
    "Engineering Associations",
    "Environmental Conservation Organizations",
    "Federation of Indian Chambers of Commerce and Industry (FICCI)",
    "Gymnasiums and Fitness Centers",
    "Indian Academy of Pediatrics (IAP)",
    "Indian Academy of Sciences (IAS)",
    "Indian Association of Dermatologists, Venereologists, and Leprologists (IADVL)",
    "Indian Association of Physiotherapists (IAP)",
    "Indian Association of Social Sciences and Humanities (IASSH)",
    "Indian Chemical Society (ICS)",
    "Indian Dental Association (IDA)",
    "Indian Geotechnical Society (IGS)",
    "Indian Historical Records Commission (IHRC)",
    "Indian Institute of Architects (IIA)",
    "Indian Institute of Management Alumni Association (IIMAA)",
    "Indian Institute of Metals (IIM)",
    "Indian Institute of Technology Alumni Association (IITAA)",
    "Indian Medical Association (IMA)",
    "Indian National Bar Association (INBA)",
    "Indian National Science Academy (INSA)",
    "Indian Orthopaedic Association (IOA)",
    "Indian Pharmaceutical Association (IPA)",
    "Indian Psychiatric Society (IPS)",
    "Indian Red Cross Society",
    "Indian Science Congress Association (ISCA)",
    "Indian Society for Aerospace and Related Mechanisms (ISARM)",
    "Indian Society for Plant Physiology (ISPP)",
    "Indian Society for Technical Education (ISTE)",
    "Indian Society of Agricultural Chemistry (ISAC)",
    "Indian Society of Agricultural Economics (ISAE)",
    "Indian Society of Agricultural Engineers (ISAE)",
    "Indian Society of Agricultural Statistics (ISAS)",
    "Indian Society of Allergy and Immunology (ISAI)",
    "Indian Society of Anesthesiologists (ISA)",
    "Indian Society of Authors (ISA)",
    "Indian Society of Cardiology (ISC)",
    "Indian Society of Chemical Engineers (ISChE)",
    "Indian Society of Civil Engineers (ISCE)",
    "Indian Society of Coastal Agricultural Research (ISCAR)",
    "Indian Society of Critical Care Medicine (ISCCM)",
    "Indian Society of Dermatology, Venereology, and Leprology (ISDVL)",
    "Indian Society of Earth Sciences (ISES)",
    "Indian Society of Earthquake Technology (ISET)",
    "Indian Society of Electrical Engineers (ISEE)",
    "Indian Society of Emergency Medicine (ISEM)",
    "Indian Society of Endocrinology (ISE)",
    "Indian Society of Engineering and Technology (ISET)",
    "Indian Society of Gastroenterology (ISG)",
    "Indian Society of Gastrointestinal and Abdominal Radiology (ISGAR)",
    "Indian Society of Genetics and Plant Breeding (ISGPB)",
    "Indian Society of Hematology (ISH)",
    "Indian Society of Hematology and Blood Transfusion (ISHBT)",
    "Indian Society of Horticultural Sciences (ISHS)",
    "Indian Society of Hydraulics (ISH)",
    "Indian Society of Industrial and Applied Mathematics (ISIAM)",
    "Indian Society of Interventional Radiology (ISIR)",
    "Indian Society of Lighting Engineers (ISLE)",
    "Indian Society of Mechanical Engineers (ISME)",
    "Indian Society of Mining Engineers (ISME)",
    "Indian Society of Musculoskeletal Radiology (ISMRS)",
    "Indian Society of Neurology (ISN)",
    "Indian Society of Nuclear Medicine (ISNM)",
    "Indian Society of Oceanography (ISO)",
    "Indian Society of Obstetrics and Gynecology (ISOG)",
    "Indian Society of Ophthalmology (ISO)",
    "Indian Society of Optics and Photonics (ISOP)"
];

const societyList = document.getElementById("society-list");

societies.forEach(society => {
    const li = document.createElement("li");
    li.textContent = society;
    societyList.appendChild(li);
});
