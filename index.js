var fs = require('fs-extra');
var path = require('path');
var replaceExt=require('replace-ext');
var fm = require('front-matter');
var cons = require('consolidate');
var glob = require('glob');
var yaml = require('js-yaml');
var marked = require('marked');
var _ = require('lodash');
module.exports = function (engine, src, dist, layouts, cb) {
  // SANITY CHECKS
  // Check that src exists:
  fs.access(src, function (err) {
    if (err) return cb(err);
  });
  // Check that engine is a string:
  if (typeof engine !== 'string' || engine === '') return cb(new Error('Please pass a valid engine parameter'));
  // Check that engine is supported by consolidate.js:
  if (typeof cons[engine] !== 'function') return cb(new Error(engine+' is not a valid consolidate.js template engine'));
  // MAIN CODE
  // For each html file in src:
  forGlob(path.join(src, '**/*.html'), function (filePath) {
    // Load and parse FM:
    loadFile(filePath, function (err, data) {
      if (err) return cb(err);
      // Render it:
      render(data, filePath, function (err, html) {
        if (err) return cb(err);
        // Get path to write to:
        var writePath=path.join(dist, filePath.replace(src, ''));
        // Output using fs-extra:
        fs.outputFile(writePath, html, function (err) {
          if (err) return cb(err);
        });
      });
    });
  }, function () {
    // Empty for now, since forGlob() is sync
  });
  // For each markdown file in src:
  forGlob(path.join(src, '**/*.@(md|markdown)'), function (filePath) {
    // Load and parse FM:
    loadFile(filePath, function (err, data) {
      if (err) return cb(err);
      marked(data.body, function (err, body) {
        if (err) return cb(err);
        // Overwrite markdown with html:
        data.body=body;
        // Render it:
        render(data, filePath, function (err, html) {
          if (err) return cb(err);
          // Get path to write to:
          var writePath=replaceExt(path.join(dist, filePath.replace(src, '')), '.html');
          // Output using fs-extra:
          fs.outputFile(writePath, html, function (err) {
            if (err) return cb(err);
          });
        });
      });
    });
  }, function () {
    // Empty for now, since forGlob() is sync
  });
  // IN-SCOPE HELPER FUNCTIONS
  // Declare render() inside the main function for access to var engine
  function render(data, filePath, cb) {
    // Get defaults:
    getDefaults(filePath, function (err, defaults) {
      if (err) return cb(err);
      // Set Defaults:
      _.defaultsDeep(data.attributes, defaults);
      // If layout, render:
      if (data.attributes._layout) {
        // Get layouts/layoutName.* :
        var layout=glob.sync(path.join(layouts, data.attributes._layout)+'.*')[0];
        // Glob doesn't throw an error if the layout path doesn't exist, so we do:
        if (!layout) {
          cb(new Error('The file: '+path.join(layouts, data.attributes._layout)+'.'+engine+' does not exist'));
        }
        var locals=data.attributes;
        locals._body=data.body;
        // Render with consolidate.js:
        cons[engine](layout, locals, cb);
      } else {
        // Else, return body
        cb(null, data.body);
      }
    });
  }
  // Declare getDefaults inside the main function for access to var src
  function getDefaults(filePath, cb, defaults) {
    glob(path.join(path.dirname(filePath), '_defaults.*'), function (err, res) {
      if (!defaults) {
        defaults={};
      }
      if (err) return cb(err);
      if (!res[0]) {
        return recurse();
      }
      var ext=path.extname(res[0]);
      if (ext === '.yaml' || ext === '.yml') {
        try {
          _.defaultsDeep(defaults, yaml.safeLoad(fs.readFileSync(res[0], 'utf8')));
        } catch (e) {
          return cb(e);
        }
      } else if (ext === '.json') {
        try {
          // Use fs-extra:
          _.defaultsDeep(defaults, fs.readJsonSync(res[0]));
        } catch (e) {
          return cb(e);
        }
      }
      recurse();
    });
    function recurse() {
      if (path.dirname(filePath) === src.replace(path.sep, '')) {
        return cb(null, defaults);
      } else {
        var newPath=path.dirname(filePath);
        return getDefaults(newPath, cb, defaults);
      }
    }
  }
};
// HELPER FUNCTIONS
// loadFile() calls (err, front-matter object)
function loadFile(name, cb) {
  fs.readFile(name, 'utf8', function (err, res) {
    if (err) { return cb(err); }
    // Use try...catch for sync front-matter:
    try {
      var json=fm(res);
    } catch (e) {
      return cb(e);
    }
    cb(null, json);
  });
}
// Runs iter over each match of pattern and call cb
function forGlob(pattern, iter, cb) {
  glob(pattern, function (err, res) {
    if (err) { return cb(err); }
    res.forEach(iter);
    cb(null);
  });
}
