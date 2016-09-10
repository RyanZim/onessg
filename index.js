var fs = require('fs-extra');
var path = require('path');
var replaceExt=require('replace-ext');
var glob = require('glob');
var matter = require('gray-matter');
var cons = require('consolidate');
var yaml = require('js-yaml');
var marked = require('marked');
var async = require('async');
var _ = require('lodash');
// Directory vars:
var src;
var layouts;
var dist;
module.exports = function (engine, dirs, cb) {
  // Make dirs available globally
  setDirs(dirs, function (err) {
    if (err) cb(err);
  });
  // Check that engine is a string:
  if (typeof engine !== 'string' || engine === '') return cb(new Error('Please pass a valid engine parameter'));
  // Check that engine is supported by consolidate.js:
  if (typeof cons[engine] !== 'function') return cb(new Error(engine+' is not a valid consolidate.js template engine'));
  // For each file in src:
  forGlob('**/*.@(html|md|markdown)', function (filePath, cb) {
    // Load and parse FM:
    loadFile(filePath, function (err, file) {
      if (err) return cb(err);
      // Run through middleware:
      middleware(file.content, path.extname(filePath), function (err, body) {
        if (err) return cb(err);
        // Overwrite body:
        file.content=body;
        // Render it:
        render(file, engine, filePath, function (err, html) {
          if (err) return cb(err);
          // Write to file and pass cb
          writeFile(html, filePath, cb);
        });
      });
    });
  }, function (err) {
    cb(err);
  });
};
// HELPER FUNCTIONS
function render(file, engine, filePath, cb) {
  // Get defaults:
  getDefaults(path.join(src, filePath), function (err, defaults) {
    if (err) return cb(err);
    // Set Defaults:
    _.defaultsDeep(file.data, defaults);
    // If layout, render:
    if (file.data._layout) {
      // Get layouts/layoutName.* :
      var layout=glob.sync(path.join(layouts, file.data._layout)+'.*')[0];
      // Glob doesn't throw an error if the layout path doesn't exist, so we do:
      if (!layout) cb(new Error('The layout: '+file.data._layout+' cannot be found in '+layouts));
      var locals=file.data;
      locals._body=file.content;
      // Render with consolidate.js:
      cons[engine](layout, locals, cb);
    } else cb(null, file.content); // Else, return body
  });
}
function getDefaults(filePath, cb) {
  var dirPath=path.dirname(filePath);
  var dirArr=[dirPath];
  var defaultArr=[];
  recurse(dirPath);
  async.eachOf(dirArr, load, function (err) {
    if (err) cb(err);
    cb(null, _.spread(_.defaultsDeep)(defaultArr));
  });
  function recurse(filePath) {
    if (filePath+path.sep === path.normalize(src+path.sep)) return;
    else {
      var newPath=path.dirname(filePath);
      dirArr.push(newPath);
      return recurse(newPath);
    }
  }
  function load(dirPath, i, cb) {
    glob(path.join(dirPath, '_defaults.*'), function (err, res) {
      if (err) return cb(err);
      var defaults={};
      if (!res[0]) {
        defaultArr[i]=defaults;
        cb(null);
        return;
      }
      try {
        switch (path.extname(res[0])) {
        case '.yaml':
        case '.yml':
          defaults=yaml.safeLoad(fs.readFileSync(res[0], 'utf8'));
          break;
        case '.json':
          defaults=fs.readJsonSync(res[0]);
        }
      } catch (e) {
        return cb(e);
      }
      defaultArr[i]=defaults;
      cb(null);
    });
  }
}
function middleware(text, ext, cb) {
  // Check path's ext:
  switch (ext) {
  case '.html':
    // noop:
    return cb(null, text);
  case '.md':
  case '.markdown':
    // Render markdown:
    return marked(text, cb);
  }
}
function writeFile(html, filePath, cb) {
  // Get path to write to:
  var writePath=replaceExt(path.join(dist, filePath), '.html');
  // Output using fs-extra:
  fs.outputFile(writePath, html, function (err) {
    cb(err);
  });
}
// loadFile() calls (err, front-matter object)
function loadFile(name, cb) {
  fs.readFile(path.join(src, name), 'utf8', function (err, res) {
    if (err) return cb(err);
    var json;
    // Use try...catch for sync front-matter:
    try {
      json=matter(res);
    } catch (e) {
      return cb(e);
    }
    cb(null, json);
  });
}
// Runs iter over each match of pattern and call cb
function forGlob(pattern, iter, cb) {
  glob(pattern, {nodir: true, cwd: src}, function (err, res) {
    if (err) return cb(err);
    async.each(res, iter, cb);
  });
  return;
}

function setDirs(dirs, cb) {
  // Check that src exists:
  fs.access(dirs.src, function (err) {
    if (err) return cb(err);
  });
  // Check that layouts exists:
  fs.access(dirs.layouts, function (err) {
    if (err) return cb(err);
  });
  src=dirs.src;
  dist=dirs.dist;
  layouts=dirs.layouts;
  cb();
}
