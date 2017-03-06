'use strict';
const p = require('thenify');
const fs = require('fs-extra');
const pfs = {
  access: p(fs.access),
  outputFile: p(fs.outputFile),
  readFile: p(fs.readFile),
};
const path = require('path-extra');
const globby = require('globby');
const grayMatter = require('gray-matter');
const cons = require('consolidate');
const marked = p(require('marked'));
// Local Modules:
const getDefaults = require('./lib/getDefaults.js');

// Config vars:
var engine;
var src;
var layouts;
var dist;

module.exports = function (engine, conf) {
  return setConf(engine, conf)
  .then(() => globby('**/*.@(html|md|markdown)', {nodir: true, cwd: src}))
  .then(arr => Promise.all(arr.map(processFile)));
};

// Accepts filePath
// Returns Promise when file has been written
function processFile(filePath) {
  // Load file and convert to a data object:
  return loadFile(filePath)
  .then(middleware)
  .then(getDefaults)
  .then(data => {
    // If _layout, render it:
    if (data._layout) return render(data);
    // Else, return _body:
    else return data._body;
  })
  .then(html => {
    // Get path to write to using path-extra:
    var writePath = path.replaceExt(path.join(dist, filePath), '.html');
    // Output using fs-extra:
    return pfs.outputFile(writePath, html);
  });
}


// HELPER FUNCTIONS:

// Accepts filename
// Returns Promise(data object)
function loadFile(name) {
  return pfs.readFile(path.join(src, name), 'utf8')
  .then(grayMatter)
  .then(file => {
    var data = file.data;
    data._body = file.content;
    data._path = name;
    return data;
  });
}

// Accepts data object, path extname
// Returns Promise(data object)
function middleware(data) {
  // Check path's ext:
  switch (path.extname(data._path)) {
  case '.html':
    // noop:
    return Promise.resolve(data);
  case '.md':
  case '.markdown':
    // Render markdown:
    return marked(data._body)
    .then(res => {
      // Overwrite data._body:
      data._body = res;
      return data;
    });
  }
}

// Accepts data object
// Returns Promise(html string)
function render(data) {
  return globby(path.join(layouts, data._layout) + '.*')
  .then(arr => {
    var layout = arr[0];
    // Globby doesn't throw an error if the layout path doesn't exist, so we do:
    if (!layout) throw new Error(`The layout: ${data._layout} cannot be found in ${layouts}`);
    // Render with consolidate.js:
    return engine(layout, data);
  });
}

// Validates configuration,
// Sets module-wide config vars,
// Calls setConf on helper modules
// Accepts engine, dirs
// Returns a promise
function setConf(eng, conf) {
  // Check that src & layouts exists:
  return Promise.all([
    pfs.access(conf.src),
    pfs.access(conf.layouts),
    new Promise(resolve => {
      // Check that engine is a string:
      if (typeof eng !== 'string' || eng === '') throw new Error('Please pass a valid engine parameter');
      // Check that engine is supported by consolidate.js:
      if (typeof cons[eng] !== 'function') throw new Error(`${eng} is not a valid consolidate.js template engine`);
      resolve();
    }),
  ])
  .then(() => {
    // Set vars:
    src = conf.src;
    dist = conf.dist;
    layouts = conf.layouts;
    engine = p(cons[eng]);
    // setConf in helper modules:
    getDefaults.setConf(conf);
  });
}
