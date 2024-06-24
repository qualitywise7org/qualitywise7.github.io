const jobsSectors = [
    { sector: "Technology and Information Technology (IT)", subsectors: ["Software Development", "Hardware Manufacturing", "IT Services", "Electronics"] },
    { sector: "Finance and Banking", subsectors: ["Banking", "Investment Services", "Insurance", "Accounting"] },
    { sector: "Healthcare and Pharmaceuticals", subsectors: ["Hospitals and Clinics", "Pharmaceutical Manufacturing", "Biotechnology", "Health Insurance"] },
    { sector: "Retail and Consumer Goods", subsectors: ["Brick-and-Mortar Stores", "E-commerce", "Consumer Electronics", "Fashion and Apparel"] },
    { sector: "Manufacturing", subsectors: ["Automotive", "Aerospace", "Food and Beverage", "Textiles"] },
    { sector: "Hospitality and Tourism", subsectors: ["Hotels and Resorts", "Restaurants and Food Services", "Travel Agencies", "Event Management"] },
    { sector: "Real Estate and Property", subsectors: ["Residential Real Estate", "Commercial Real Estate", "Property Development", "Property Management"] },
    { sector: "Energy and Utilities", subsectors: ["Oil and Gas", "Renewable Energy", "Utilities", "Energy Trading"] },
    { sector: "Transportation and Logistics", subsectors: ["Shipping and Freight", "Airlines", "Rail Transportation", "Logistics and Supply Chain Management"] },
    { sector: "Telecommunications", subsectors: ["Mobile Network Operators", "Internet Service Providers", "Telecommunications Equipment Manufacturing", "Satellite Communications"] },
    { sector: "Entertainment and Media", subsectors: ["Film and Television Production", "Music Industry", "Publishing", "Digital Media"] },
    { sector: "Construction and Infrastructure", subsectors: ["Residential Construction", "Commercial Construction", "Civil Engineering", "Building Materials"] },
    { sector: "Education and Training", subsectors: ["Schools and Universities", "Educational Technology (EdTech)", "Training and Development", "Publishing and Educational Materials"] },
    { sector: "Professional Services", subsectors: ["Legal Services", "Accounting and Auditing", "Marketing and Advertising Agencies", "Recruitment and HR Services"] },
    { sector: "Government and Public Administration", subsectors: ["Public Administration", "Defense and Military", "Government Services", "Public Policy and Governance"] },
    { sector: "Nonprofit and Social Services", subsectors: ["Charitable Organizations", "NGOs (Non-Governmental Organizations)", "Social Advocacy Groups", "Foundations and Philanthropy"] },
    { sector: "Legal Services", subsectors: ["Law Firms", "Legal Consulting", "Legal Tech", "Alternative Dispute Resolution"] },
    { sector: "Environmental Services", subsectors: ["Environmental Consulting", "Waste Management", "Renewable Energy Development", "Environmental Remediation"] },
    { sector: "Fitness and Wellness", subsectors: ["Gyms and Fitness Centers", "Wellness Coaching", "Sports Equipment Manufacturing", "Health Food Products"] },
    { sector: "Gaming and Entertainment", subsectors: ["Video Game Development", "Gaming Platforms", "Esports", "Gaming Accessories and Merchandise"] },
    { sector: "Security and Surveillance", subsectors: ["Security Services", "Cybersecurity", "Surveillance Technology", "Private Investigation"] },
    { sector: "Agriculture and Farming", subsectors: ["Crop Production", "Livestock Farming", "Agribusiness", "Agricultural Equipment Manufacturing"] },
    { sector: "Automotive", subsectors: ["Vehicle Manufacturing", "Automotive Parts and Accessories", "Dealerships and Sales", "Automotive Services"] },
    { sector: "Textile and Apparel", subsectors: ["Textile Manufacturing", "Apparel Production", "Fashion Design", "Textile Machinery Manufacturing"] },
    { sector: "Chemicals", subsectors: ["Basic Chemicals", "Specialty Chemicals", "Petrochemicals", "Agrochemicals"] },
    { sector: "Mining and Metals", subsectors: ["Metal Ore Mining", "Coal Mining", "Mineral Mining", "Metal Fabrication"] },
    { sector: "Food and Beverage", subsectors: ["Food Processing", "Beverage Manufacturing", "Food Retail", "Food Distribution"] },
    { sector: "Pharmaceuticals", subsectors: ["Pharmaceutical Manufacturing", "Biopharmaceuticals", "Pharmaceutical Distribution", "Pharmaceutical Services"] },
    { sector: "Electronics and Semiconductor", subsectors: ["Electronic Components", "Semiconductor Manufacturing", "Consumer Electronics", "Electronic Equipment Manufacturing"] },
    { sector: "Packaging", subsectors: ["Packaging Materials", "Packaging Machinery", "Flexible Packaging", "Rigid Packaging"] },
    { sector: "Civil Aviation", subsectors: [] }
];

const dataContainer = document.getElementById('data-container');
function displayData() {
    // const dataContainer = document.getElementById('data-container');
    let htmlContent = '';

    jobsSectors.forEach(sector => {
        htmlContent += `<h2>${sector.sector}</h2>`;
        if (sector.subsectors.length > 0) {
            htmlContent += `<ul>`;
            sector.subsectors.forEach(subsector => {
                htmlContent += `<li>${subsector}</li>`;
            });
            htmlContent += `</ul>`;
        } else {
            htmlContent += `<p>No subsectors listed</p>`;
        }
    });

    dataContainer.innerHTML = htmlContent;
}

window.addEventListener('DOMContentLoaded', displayData);
// document.getElementById('job-option').addEventListener('click', function(event){
//     event.preventDefault();
//     displayData();
// });
