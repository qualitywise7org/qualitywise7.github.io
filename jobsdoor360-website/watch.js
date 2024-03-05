//read file and folder and output
const fs = require('node:fs');
const ejs = require('ejs');
const path = require('path');
const chokidar = require('chokidar');
const ejs_compiler = require('./ejs_compiler');

const srcPath = 'src/main/ejs/main-files';


const watcher = chokidar.watch('src/main/ejs', {
    ignored: /^\\./, // Ignore hidden files
    persistent: true, // Keep watching
});

watcher
    .on('add', (path) => {
        console.log('File', path, 'has been added');
        ejs_compiler.readFolder(srcPath);
    })
    .on('change', (path) => {
        console.log('File', path, 'has been changed');
        ejs_compiler.readFolder(srcPath);
    })
    .on('unlink', (path) => {
        console.log('File', path, 'has been removed');
    })
    .on('error', (error) => {
        console.error('Error happened', error);
    });

console.log("watcher started...!");
