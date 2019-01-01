const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mkdirp = require('mkdirp');
const mustache = require('mustache');
const chalk = require('chalk');
const loadViews = require('./load-views');
const matter = require('gray-matter');
const PARTIALS_PATH = './templates/**/partials/**/*.?(html|mustache|json)';
const TPLS_PATH = './templates/**/*.?(html|mustache)';
const options = { ignore: PARTIALS_PATH };
const errorColor = chalk.red;
const successColor = chalk.green;

renderFiles();

async function renderFiles() {
  try {
    const partialsFiles = await getPartialsFileList();
    const partialsObject = await createPartialsObject(partialsFiles);
    const view = await loadViews();
    const templateFiles = await getTemplateFileList();

    writeTemplateFiles(templateFiles, partialsObject, view);
  } catch (error) {
    console.log(errorColor('Error creating templates ', error));
  }
}

function getPartialsFileList() {
  return new Promise((resolve, reject) => {
    glob(PARTIALS_PATH, {}, (error, files) => {
      return error ? reject(error) : resolve(files);
    });
  });
}

function createPartialsObject(partialsFiles) {
  return Promise.all(partialsFiles.map(parsePartial)).then(partialTuplesToObject);
}

function parsePartial(file) {
  let data = '';
  const absoluteFilePath = path.resolve(__dirname, '../..', file);
  const name = path
    .basename(file, '.mustache')
    .replace('.html', '')
    .replace('.json', '');

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(absoluteFilePath);
    readStream.on('data', streamData => (data += streamData));
    readStream.on('end', () => resolve([name, data]));
    readStream.on('error', error => reject(error));
  });
}

function partialTuplesToObject(tuplesArray) {
  return tuplesArray.reduce((acc, tuple) => {
    acc[tuple[0]] = tuple[1];
    return acc;
  }, {});
}

function getTemplateFileList() {
  return new Promise((resolve, reject) => {
    glob(TPLS_PATH, options, (error, files) => {
      return error ? reject(error) : resolve(files);
    });
  });
}

function writeTemplateFiles(files, partialsObject, view) {
  files.forEach(writeTemplateFile.bind(null, partialsObject, view));
}

async function writeTemplateFile(partialsObject, view, file) {
  let data = '';
  const { outFilePath, inFilePath } = filePaths(file);
  const dir = await makeFileDir(file);
  const readStream = fs.createReadStream(inFilePath);
  const writeStream = fs.createWriteStream(outFilePath);

  readStream.on('data', streamData => (data += streamData));
  readStream.on('end', function() {
    const parsed = matter(data);
    const frontMatter = parsed.data;
    const template = parsed.content;
    const rendered = mustache.render(template, { ...view, ...frontMatter }, partialsObject);
    writeStream.write(rendered);
    writeStream.end();
    console.log(successColor(`Rendered: ${outFilePath}`));
  });
  readStream.on('error', streamError.bind(null, 'reading'));
  writeStream.on('error', streamError.bind(null, 'writing'));
}

function makeFileDir(file) {
  const { dir } = filePaths(file);
  return mkdirpPromise(dir);
}

function mkdirpPromise(dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, (error, made) => {
      return error ? reject(error) : resolve(made);
    });
  });
}

function filePaths(file) {
  const outFilePath = path.resolve(__dirname, `../../html`, file);
  const inFilePath = path.resolve(__dirname, '../..', file);
  const dir = path.dirname(outFilePath).replace('/templates', '');

  return {
    dir,
    inFilePath,
    outFilePath: outFilePath.replace('.mustache', '.html').replace('/templates', '')
  };
}

function streamError(type, error) {
  throw new Error(`Error ${type} stream: ${error}`);
}
