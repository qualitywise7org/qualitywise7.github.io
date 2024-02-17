//read file and folder and output
const fs = require('node:fs');
const ejs = require('ejs');
const path = require('path');

const srcPath = 'src/main/ejs/main-files';
const destPath = 'target'; // use ../ instead of target to generate in root folder

function readFolder(dir){
	fs.readdirSync(dir).map(file => {
		// build the full path of the file
	    const filePath = path.join(dir, file);

	    // get the file stats
	    const fileStat = fs.statSync(filePath);

	    // if the file is a directory, recursively search the directory
        if (fileStat.isDirectory()) {
          readFolder(filePath);
        } else if(file.endsWith('.ejs')) {
          // if the file is a match, print it
          ejsCompile(filePath);
        }
	});
}

function ejsCompile(filePath){
	//let finalPath = filePath;//path.join(__dirname,filePath);
	console.log("ejs file = "+filePath);

	ejs.renderFile(filePath, function(err, data) {
        if(err)
	        console.log(err);
        writeOutput(filePath, data);
    });
}

function writeOutput(filePath, data){
    //create folder
    let writeFolder = path.dirname(filePath.split("main-files")[1]);
    writeFolder = path.join(destPath,writeFolder);

    try{
        fs.mkdirSync(writeFolder, { recursive: true });
    }catch(ex){

    }

    //write file
    let writeFile = path.basename(filePath).replace("ejs","html");
    let writeFullPath = path.join(writeFolder, writeFile);

    console.log("writePath=",writeFullPath);
    fs.writeFileSync(writeFullPath, data);
    console.log("write successfully...!\n")
}


//start script
readFolder(srcPath);
