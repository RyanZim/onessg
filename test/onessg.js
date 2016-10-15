/* eslint no-console: "off" */
'use strict';
var fs=require('fs-extra');
var path=require('path-extra');
var assert=require('assert');
var suppose=require('suppose');
var resolve=require('autoresolve');
var onessg=require(resolve('index.js'));
assert.dirsEqual = require('assert-dir-equal');
assert.fixture=function (fixture, done) {
  // Get layoutPath:
  var layoutPath=path.join('test/fixtures/', fixture, 'layouts');
  try {
    fs.accessSync(layoutPath);
  } catch (e) {
    // Use a dummy directory if there isn't a local one:
    layoutPath='test/fixtures/empty-dir';
  }
  var distPath=path.join('test/fixtures/', fixture, 'dist');
  // Clean dist:
  fs.removeSync(distPath);
  // Run onessg:
  onessg('ejs', {
    src: path.join('test/fixtures/', fixture, 'src'),
    dist: distPath,
    layouts: layoutPath,
  }, function () {
    // Assert that dist/ & expected/ are equal:
    try {
      assert.dirsEqual(path.join('test/fixtures/', fixture, 'dist'), path.join('test/fixtures/', fixture, 'expected'));
    } catch (e) {
      return done(e);
    }
    done();
  });
};

suite('cli', function () {
  this.timeout(5000);
  this.slow(3000);
  test('works', function (done) {
    suppose(resolve('cli.js'), ['ejs',
    '-s', 'test/fixtures/cli/src',
    '-d', 'test/fixtures/cli/dist',
    '-l', 'test/fixtures/cli/layouts'])
    .on('error', function (err) {
      console.error(err);
      done(err);
    })
    .end(function (code) {
      assert.equal(code, 0, 'CLI exited with non-zero exit code');
      done();
    });
  });
  test('returns errors', function (done) {
    var error;
    // Run cli.js ejs -s noop:
    suppose(resolve('cli.js'), ['ejs', '-s', 'noop'])
    .on('error', function (err) {
      error=err;
    })
    .end(function (code) {
      assert.notEqual(code, 0, 'expected CLI to return non-zero exit code on error');
      // Errors:
      assert(error, 'expected CLI to print error message');
      done();
    });
  });
});
// Tests:
suite('html & markdown', function () {
  test('empty files', function (done) {
    assert.fixture('empty-files', done);
  });
  test('text', function (done) {
    assert.fixture('text', done);
  });
  test('subfolders', function (done) {
    assert.fixture('subfolders', done);
  });
});
suite('layouts & front-matter', function () {
  test('works', function (done) {
    assert.fixture('layouts', done);
  });
});
suite('_defaults file', function () {
  test('works', function (done) {
    assert.fixture('_defaults', done);
  });
  test('can set default _layout', function (done) {
    assert.fixture('default-layout', done);
  });
  test('works in subfolders', function (done) {
    assert.fixture('_defaults-subfolders', done);
  });
});
suite('file types/extentions', function () {
  test('json', function (done) {
    assert.fixture('json', done);
  });
  test('yml', function (done) {
    assert.fixture('yml', done);
  });
  test('markdown', function (done) {
    assert.fixture('markdown', done);
  });
});
suite('errors', function () {
  var dirs={};
  setup(function () {
    dirs.src='test/fixtures/cli/src';
    dirs.dist='test/fixtures/cli/dist';
    dirs.layouts='test/fixtures/cli/layouts';
  });
  test('invalid src/', function (done) {
    dirs.src='noop';
    onessg('ejs', dirs, function (e) {
      done(assert(e));
    });
  });
  test('invalid layouts/', function (done) {
    dirs.layouts='noop';
    onessg('ejs', dirs, function (e) {
      done(assert(e));
    });
  });
  test('non-existent layout', function (done) {
    onessg('ejs', {
      src: 'test/fixtures/non-existent-layout/src',
      dist: 'test/fixtures/non-existent-layout/dist',
      layouts: 'test/fixtures/non-existent-layout/layouts',
    }, function (e) {
      done(assert(e));
    });
  });
  test('invalid type for engine', function (done) {
    onessg(0, dirs, function (e) {
      done(assert(e));
    });
  });
  test('unsupported engine', function (done) {
    onessg('noop', dirs, function (e) {
      done(assert(e));
    });
  });
});
