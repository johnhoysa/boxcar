const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const VIEWS_PATH = './templates/**/views/**/*.json';
const errorColor = chalk.bold.red;

async function loadViews() {
  try {
    const fileList = await getViewsFileList();
    const view = await combineObjectsFromFiles(fileList);
    return view;
  } catch (error) {
    console.log(errorColor(`Could not load views ${error}`));
  }
}

function getViewsFileList() {
  return new Promise((resolve, reject) => {
    glob(VIEWS_PATH, {}, (error, files) => {
      return error ? reject(error) : resolve(files);
    });
  });
}

function combineObjectsFromFiles(files) {
  return Promise.all(files.map(createView)).then(objects => {
    return objects.reduce((acc, obj) => {
      return { ...obj, ...acc };
    }, {});
  });
}

function createView(file) {
  let data = '';
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(file);
    readStream.on('data', streamData => (data += streamData));
    readStream.on('end', () => {
      resolve(JSON.parse(data));
    });
  });
}

module.exports = loadViews;
