'use strict';
var p = require('thenify');
var fs = require('fs-extra');
var path = require('path-extra');
var globby = require('globby');
var matter = require('gray-matter');
var cons = require('consolidate');
var marked = p(require('marked'));
// Local Modules:
var getDefaults = require('./lib/getDefaults.js');
// Config vars:
var engine;
var src;
var layouts;
var dist;
var devMode;
module.exports = function (engine, conf, cb) {
  // Make engine and dirs available globally:
  setConf(engine, conf)
  .then(function () {
    // Get files:
    return globby('**/*.@(html|md|markdown)', {nodir: true, cwd: src});
  })
  .then(function (arr) {
    // Process each file
    // return a promise when all files have been processed:
    return Promise.all(arr.map(function (item) {
      return processFile(item);
    }));
  })
  .then(function () {
    // Call cb:
    cb();
  })
  .catch(cb);
};

// Accepts filePath
// Returns Promise when file has been written
function processFile(filePath) {
  // Load file and convert to a data object:
  return loadFile(filePath)
  .then(function (data) {
    // If it's a draft and devMode is off, return undefined:
    if (data._draft && !devMode) return undefined;
    // Else, run through middleware:
    return middleware(data, path.extname(filePath))
    .then(function (data) {
      return getDefaults(data, filePath);
    })
    .then(function (data) {
      // If _layout, render it:
      if (data._layout) return render(data, filePath);
      // Else, return _body:
      else return data._body;
    })
    .then(function (html) {
      // Get path to write to using path-extra:
      var writePath=path.replaceExt(path.join(dist, filePath), '.html');
      // Output using fs-extra:
      return p(fs.outputFile)(writePath, html);
    });
  });
}
// HELPER FUNCTIONS

// Accepts filename
// Returns Promise(data object)
function loadFile(name) {
  return p(fs.readFile)(path.join(src, name), 'utf8')
  .then(function (text) {
    return matter(text);
  })
  .then(function (file) {
    var data = file.data;
    data._body = file.content;
    return data;
  });
}

// Accepts data object, path extname
// Returns Promise(data object)
function middleware(data, ext) {
  // Check path's ext:
  switch (ext) {
  case '.html':
    // noop:
    return Promise.resolve(data);
  case '.md':
  case '.markdown':
    // Render markdown:
    return marked(data._body)
    .then(function (res) {
      // Overwrite data._body:
      data._body = res;
      return data;
    });
  }
}

// Accepts data object
// Returns Promise(html string)
function render(data) {
  return globby(path.join(layouts, data._layout)+'.*')
  .then(function (arr) {
    var layout = arr[0];
    // Globby doesn't throw an error if the layout path doesn't exist, so we do:
    if (!layout) throw new Error(`The layout: ${data._layout} cannot be found in ${layouts}`);
    // Render with consolidate.js:
    return p(cons[engine])(layout, data);
  });
}

// Validates configuration,
// Sets module-wide config vars,
// Calls setConf on helper modules
// Accepts engine, dirs
// Returns a promise
function setConf(eng, conf) {
  var access = p(fs.access);
  // Check that src & layouts exists:
  return Promise.all([
    access(conf.src),
    access(conf.layouts),
    new Promise(function (resolve) {
      // Check that engine is a string:
      if (typeof eng !== 'string' || eng === '') throw new Error('Please pass a valid engine parameter');
      // Check that engine is supported by consolidate.js:
      if (typeof cons[eng] !== 'function') throw new Error(`${eng} is not a valid consolidate.js template engine`);
      resolve();
    }),
  ])
  .then(function () {
    // Set vars:
    src=conf.src;
    dist=conf.dist;
    layouts=conf.layouts;
    engine=eng;
    devMode=conf.devMode;
    // setConf in helper modules:
    getDefaults.setConf(conf);
  });
}
