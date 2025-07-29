//read file and folder and output
const fs = require("node:fs");
const ejs = require("ejs");
const path = require("path");
const destPath = "../"; // use ../ or target instead of target to generate in root folder

const data = {
  job_options_data: require("../staticfiles/mainfiles/careeroptions/job-options/job_options_data.json"),
  business_options_data: require("../staticfiles/mainfiles/careeroptions/business-options/business_options_data.json"),
  career_guide_by_big_people_data: require("../staticfiles/mainfiles/careeroptions/career-guide-by-big-people/career_guide_by_big_people_data.json"),
  societies_data: require("../staticfiles/mainfiles/careeroptions/societies/societies_data.json"),
  government_department_which_provide_jobs_data: require("../staticfiles/mainfiles/careeroptions/government-department-which-provide-jobs/government_department_which_provide_jobs_data.json"),
  ministry_data: require("../staticfiles/mainfiles/careeroptions/ministries/ministry_data.json"),
  master_data: require('../website_data/website_masterdata.js')
};

function readFolder(dir) {
  fs.readdirSync(dir).map((file) => {
    // build the full path of the file
    const filePath = path.join(dir, file);

    // get the file stats
    const fileStat = fs.statSync(filePath);

    // if the file is a directory, recursively search the directory
    if (fileStat.isDirectory()) {
      readFolder(filePath);
    } else if (file.endsWith(".ejs")) {
      // if the file is a match, print it
      ejsCompile(filePath, data);
    }
  });
}

function ejsCompile(filePath, data) {
  //let finalPath = filePath;//path.join(__dirname,filePath);
  console.log("ejs file = " + filePath);

  ejs.renderFile(filePath, data, function (err, data) {
    if (err) console.log(err);
    writeOutput(filePath, data);
  });
}

function writeOutput(filePath, data) {
  //create folder
  let writeFolder = path.dirname(filePath.split("main-files")[1]);
  writeFolder = path.join(destPath, writeFolder);

  try {
    fs.mkdirSync(writeFolder, { recursive: true });
  } catch (ex) {
    console.log("hello world");
  }

  //write file
  let writeFile = path.basename(filePath).replace("ejs", "html");
  let writeFullPath = path.join(writeFolder, writeFile);

  console.log("writePath=", writeFullPath);
  fs.writeFileSync(writeFullPath, data);
  console.log("write successfully...!\n");
}

module.exports = { readFolder };
