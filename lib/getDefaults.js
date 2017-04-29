'use strict';
const readFile = require('fs-extra').readFile;
const path = require('path-extra');
const globby = require('globby');
const yaml = require('js-yaml');
// Only load a subset of lodash:
const _ = {
  spread: require('lodash/spread'),
  defaultsDeep: require('lodash/defaultsDeep'),
};

const cache = {};

// Config vars:
var src;

module.exports = function (data) {
  // Must have src/ in the path so we know when to stop:
  return recurse(path.join(src, data._path))
  .then(arr => {
    // Combine defaults:
    var defaults = _.spread(_.defaultsDeep)(arr);
    // Apply data and return the new data:
    return _.defaultsDeep(data, defaults);
  });
};

function recurse (p) {
  var arr = [];
  do {
    p = path.dirname(p);
    arr.push(load(p));
  } while (path.normalizeTrim(p) !== path.normalizeTrim(src));
  return Promise.all(arr);
}

function load(dirPath) {
  if (cache[dirPath]) return cache[dirPath];
  return cache[dirPath] = globby(path.join(dirPath, '_defaults.@(yaml|yml|json)'))
  .then(res => {
    if (!res[0]) return {};
    return readFile(res[0], 'utf8').then(yaml.safeLoad);
  });
}

module.exports.setConf = function (conf) {
  src = conf.src;
};
