'use strict';
var p = require('thenify');
var fs = require('fs-extra');
var path = require('path-extra');
var globby = require('globby');
var yaml = require('js-yaml');
var cache = {};
// Only load a subset of lodash:
var _ = {
  spread: require('lodash/spread'),
  defaultsDeep: require('lodash/defaultsDeep'),
};
// Config vars:
var src;
module.exports = function getDefaults(data, filePath) {
  // Must have src/ in the path so we know when to stop:
  var dirPath = path.join(src, path.dirname(filePath));
  var arr = [load(dirPath)];
  recurse(dirPath);
  return Promise.all(arr)
  .then(function (arr) {
    // Combine defaults:
    var defaults = _.spread(_.defaultsDeep)(arr);
    // Apply data, set cache: true, and return the new data:
    return _.defaultsDeep(data, defaults, {cache: true});
  });

  function recurse(dirPath) {
    // If we have reached src/, stop:
    if (path.normalizeTrim(dirPath) === path.normalizeTrim(src)) return;
    else {
      let newPath = path.dirname(dirPath);
      arr.push(load(newPath));
      return recurse(newPath);
    }
  }
};
module.exports.setConf = function (conf) {
  src = conf.src;
};

function load(dirPath) {
  if (cache[dirPath]) return cache[dirPath];
  else {
    var val = loadFromFile(dirPath);
    cache[dirPath] = val;
    return val;
  }
}
function loadFromFile(dirPath) {
  return globby(path.join(dirPath, '_defaults.*'))
  .then(function (res) {
    var defaults = {};
    if (!res[0]) return defaults;
    switch (path.extname(res[0])) {
    case '.yaml':
    case '.yml':
      defaults = p(fs.readFile)(res[0], 'utf8').then(d => yaml.safeLoad(d));
      break;
    case '.json':
      defaults = p(fs.readJson)(res[0]);
    }
    return defaults;
  });
}
