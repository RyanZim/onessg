'use strict';
var fs = require('fs-extra');
var path = require('path-extra');
var globby = require('globby');
var yaml = require('js-yaml');
var _ = require('lodash');
// Config vars:
var src;
module.exports = function getDefaults(filePath) {
  // Must have src/ in the path so we know when to stop:
  var dirPath=path.join(src, path.dirname(filePath));
  var arr=[load(dirPath)];
  recurse(dirPath);
  return Promise.all(arr)
  .then(function (arr) {
    // Combine defaults:
    return _.spread(_.defaultsDeep)(arr);
  });

  function recurse(dirPath) {
    // If we have reached src/, stop:
    if (path.normalizeTrim(dirPath) === path.normalizeTrim(src)) return;
    else {
      let newPath=path.dirname(dirPath);
      arr.push(load(newPath));
      return recurse(newPath);
    }
  }
};
module.exports.setConf = function (dirs) {
  src = dirs.src;
};

// Accepts a directory path
// Returns the contents of the directory/_defaults.* file as an object
// Returns {} if the file does not exist
function load(dirPath) {
  return globby(path.join(dirPath, '_defaults.*')).then(function (res) {
    var defaults={};
    if (!res[0]) return defaults;
    switch (path.extname(res[0])) {
    case '.yaml':
    case '.yml':
      defaults=yaml.safeLoad(fs.readFileSync(res[0], 'utf8'));
      break;
    case '.json':
      defaults=fs.readJsonSync(res[0]);
    }
    return defaults;
  });
}
