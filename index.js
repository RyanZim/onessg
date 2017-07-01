'use strict';
const fs = require('fs-extra');
const path = require('path-extra');
const globby = require('globby');
const grayMatter = require('gray-matter');
const transformer = require('./lib/transformer');
const marked = require('universalify').fromCallback(require('marked'));
const cloneDeep = require('lodash').cloneDeep;
// Local Modules:
const getDefaults = require('./lib/getDefaults.js');

// Config vars:
var conf;

module.exports = function (config) {
  return setConf(config)
    .then(() => globby('**/*.@(html|md|markdown)', {nodir: true, cwd: conf.src}))
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
      var writePath = path.replaceExt(path.join(conf.dist, filePath), '.html');
      // Output using fs-extra:
      return fs.outputFile(writePath, html);
    });
}


// HELPER FUNCTIONS:

// Accepts filename
// Returns Promise(data object)
function loadFile(name) {
  return fs.readFile(path.join(conf.src, name), 'utf8')
    .then(grayMatter)
    .then(file => {
      // Need to perform a full clone of this object since gray-matter does some
      // agressive caching, and our mutation can mess up the cache
      var data = cloneDeep(file.data);
      data._body = file.content;
      data._path = path.removeExt(name);
      data._ext = path.extname(name);
      return data;
    });
}

// Accepts data object, path extname
// Returns Promise(data object)
function middleware(data) {
  // Check path's ext:
  switch (data._ext) {
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
  return globby(path.join(conf.layouts, data._layout) + '.*')
    .then(arr => {
      var layout = arr[0];
      // Globby doesn't throw an error if the layout path doesn't exist, so we do:
      if (!layout) throw new Error(`The layout: ${data._layout} cannot be found in ${conf.layouts}`);
      // Render with jstransformer:
      return transformer(layout, data);
    })
    .then(obj => obj.body);
}

// Validates configuration,
// Sets module-wide config vars,
// Calls setConf on helper modules
// Accepts config
// Returns a promise
function setConf(config) {
  // Check that src & layouts exists:
  return Promise.all([
    fs.access(config.src),
    fs.access(config.layouts),
  ])
    .then(() => {
    // Set vars:
      conf = config;
      // setConf in helper modules:
      getDefaults.setConf(conf);
      transformer.setConf(conf);
    });
}
