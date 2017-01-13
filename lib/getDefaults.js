'use strict';
var readFile = require('thenify')(require('fs-extra').readFile);
var path = require('path-extra');
var globby = require('globby');
var yaml = require('js-yaml');
// Only load a subset of lodash:
var _ = {
  spread: require('lodash/spread'),
  defaultsDeep: require('lodash/defaultsDeep'),
};
var cache = {};

// Config vars:
var src;

module.exports = function (data) {
  // Must have src/ in the path so we know when to stop:
  return recurse(path.join(src, data._path))
  .then(function (arr) {
    // Combine defaults:
    var defaults = _.spread(_.defaultsDeep)(arr);
    // Apply data, set cache: true, and return the new data:
    return _.defaultsDeep(data, defaults, {cache: true});
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
  .then(function (res) {
    var defaults = {};
    if (!res[0]) return defaults;
    defaults = readFile(res[0], 'utf8').then(d => yaml.safeLoad(d));
    return defaults;
  });
}

module.exports.setConf = function (conf) {
  src = conf.src;
};
