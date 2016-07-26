var fs = require('fs');
var path = require('path');
var fm = require('front-matter');
var cons = require('consolidate');
var glob = require('glob');
module.exports = function (engine, src, dist, layouts) {
  // SANITY CHECKS
  // Check that src exists:
  fs.access(src, function (err) {
    if (err) throw err;
  });
  // Check that engine is a string:
  if (typeof engine !== 'string' || engine === '') throw new Error('Please pass a valid engine parameter');
  // Check that engine is supported by consolidate.js:
  if (typeof cons[engine] !== 'function') throw new Error(engine+' is not a valid consolidate.js template engine');
  // MAIN CODE
  // For each file in src:
  forGlob(path.join(src, '**.html'), function (filePath) {
    // Load and parse FM:
    loadFile(filePath, function (err, data) {
      if (err) throw err;
      // Render it:
      render(data, function (err, html) {
        if (err) throw err;
        // Get path to write to:
        var writePath=path.join(dist, filePath.replace(src, ''));
        // Write output:
        fs.writeFile(writePath, html, function (err) {
          if (err) throw err;
        });
      });
    });
  }, function () {
    // Empty for now, since forGlob() is sync
  });
  // Declare render() inside the main function for access to var engine
  function render(data, cb) {
    // If layout, render:
    if (data.attributes._layout) {
      // Get layouts/layoutName.* :
      var layout=glob.sync(path.join(layouts, data.attributes._layout)+'.*')[0];
      // Glob doesn't throw an error if the layout path doesn't exist, so we do:
      if (!layout) {
        cb(new Error('The file: '+path.join(layouts, data.attributes._layout)+'.'+engine+' does not exist'))
      }
      // Construct locals object:
      var locals=data.attributes;
      locals._body=data.body;
      // Render with consolidate.js:
      cons[engine](layout, locals, cb);
    } else {
      // Else, return body
      cb(null, data.body)
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
