//read file and folder and output
const fs = require('node:fs');
const ejs = require('ejs');
const path = require('path');
const ejs_compiler = require('./ejs_compiler');

const srcPath = 'src/main/ejs/main-files';

//start script
ejs_compiler.readFolder(srcPath);
