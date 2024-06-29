// Data stored in a JavaScript variable
const businessSectors = [
    {
        sector: "Technology",
        subsectors: ["Software Development", "Hardware Manufacturing", "IT Services", "Electronics"]
    },
    {
        sector: "Finance",
        subsectors: ["Banking", "Investment Services", "Insurance", "Accounting"]
    },
    {
        sector: "Healthcare",
        subsectors: ["Hospitals and Clinics", "Pharmaceutical Manufacturing", "Biotechnology", "Health Insurance"]
    },
    {
        sector: "Retail",
        subsectors: ["Brick-and-Mortar Stores", "E-commerce", "Consumer Electronics", "Fashion and Apparel"]
    },
    {
        sector: "Manufacturing",
        subsectors: ["Automotive", "Aerospace", "Food and Beverage", "Textiles"]
    },
    {
        sector: "Hospitality and Tourism",
        subsectors: ["Hotels and Resorts", "Restaurants and Food Services", "Travel Agencies", "Event Management"]
    },
    {
        sector: "Real Estate",
        subsectors: ["Residential Real Estate", "Commercial Real Estate", "Property Development", "Property Management"]
    },
    {
        sector: "Energy",
        subsectors: ["Oil and Gas", "Renewable Energy", "Utilities", "Energy Trading"]
    },
    {
        sector: "Transportation and Logistics",
        subsectors: ["Shipping and Freight", "Airlines", "Rail Transportation", "Logistics and Supply Chain Management"]
    },
    {
        sector: "Telecommunications",
        subsectors: ["Mobile Network Operators", "Internet Service Providers", "Telecommunications Equipment Manufacturing", "Satellite Communications"]
    },
    {
        sector: "Entertainment and Media",
        subsectors: ["Film and Television Production", "Music Industry", "Publishing", "Digital Media"]
    },
    {
        sector: "Consumer Goods",
        subsectors: ["FMCG (Fast-Moving Consumer Goods)", "Personal Care Products", "Household Goods", "Food and Beverage"]
    },
    {
        sector: "Automotive",
        subsectors: ["Vehicle Manufacturing", "Automotive Parts and Accessories", "Dealerships and Sales", "Automotive Services"]
    },
    {
        sector: "Agriculture",
        subsectors: ["Crop Production", "Livestock Farming", "Agribusiness", "Agricultural Equipment Manufacturing"]
    },
    {
        sector: "Education",
        subsectors: ["Schools and Universities", "Educational Technology (EdTech)", "Training and Development", "Publishing and Educational Materials"]
    },
    {
        sector: "Construction",
        subsectors: ["Residential Construction", "Commercial Construction", "Civil Engineering", "Building Materials"]
    },
    {
        sector: "Professional Services",
        subsectors: ["Legal Services", "Accounting and Auditing", "Marketing and Advertising Agencies", "Recruitment and HR Services"]
    },
    {
        sector: "Government and Public Administration",
        subsectors: ["Public Administration", "Defense and Military", "Government Services", "Public Policy and Governance"]
    },
    {
        sector: "Nonprofit and Social Services",
        subsectors: ["Charitable Organizations", "NGOs (Non-Governmental Organizations)", "Social Advocacy Groups", "Foundations and Philanthropy"]
    },
    {
        sector: "Legal Services",
        subsectors: ["Law Firms", "Legal Consulting", "Legal Tech", "Alternative Dispute Resolution"]
    },
    {
        sector: "Environmental Services",
        subsectors: ["Environmental Consulting", "Waste Management", "Renewable Energy Development", "Environmental Remediation"]
    },
    {
        sector: "Fitness and Wellness",
        subsectors: ["Gyms and Fitness Centers", "Wellness Coaching", "Sports Equipment Manufacturing", "Health Food Products"]
    },
    {
        sector: "Gaming",
        subsectors: ["Video Game Development", "Gaming Platforms", "Esports", "Gaming Accessories and Merchandise"]
    },
    {
        sector: "Security and Surveillance",
        subsectors: ["Security Services", "Cybersecurity", "Surveillance Technology", "Private Investigation"]
    },
    {
        sector: "Animal Husbandry, Dairying and Fisheries",
        subsectors: []
    },
    {
        sector: "Chemicals and Fertilizers",
        subsectors: []
    },
    {
        sector: "Civil Aviation",
        subsectors: []
    }
];

const dataContainer = document.getElementById('data-container');
// Function to display the data
function displayData() {
    // const dataContainer = document.getElementById('data-container');
    let htmlContent = '';

    businessSectors.forEach(sector => {
        htmlContent += `<h2>${sector.sector}</h2>`;
        if (sector.subsectors.length > 0) {
            htmlContent += `<ul>`;
            sector.subsectors.forEach(subsector => {
                htmlContent += `<li>${subsector}</li>`;
            });
            htmlContent += `</ul>`;
        } else {
            htmlContent +=`<p>No subsectors listed</p>`;
        }
    });

    dataContainer.innerHTML = htmlContent;
}

// Call the displayData function when the page loads
window.addEventListener('DOMContentLoaded', displayData);