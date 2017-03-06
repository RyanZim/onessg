/* eslint no-console: "off" */
'use strict';
var fs = require('fs-extra');
var path = require('path-extra');
var assert = require('assert');
var suppose = require('suppose');
var resolve = require('autoresolve');
var onessg = require(resolve('index.js'));
assert.dirsEqual = require('assert-dir-equal');
assert.fixture = function (fixture) {
  // Get layoutPath:
  var layoutPath = path.join('test/fixtures/', fixture, 'layouts');
  try {
    fs.accessSync(layoutPath);
  } catch (e) {
    // Use a dummy directory if there isn't a local one:
    layoutPath = 'test/fixtures/empty-dir';
  }

  // Clean dist:
  var distPath = path.join('test/fixtures/', fixture, 'dist');
  fs.removeSync(distPath);

  // Run onessg:
  return onessg('ejs', {
    src: path.join('test/fixtures/', fixture, 'src'),
    dist: distPath,
    layouts: layoutPath,
  }).then(function () {
    // Assert that dist/ & expected/ are equal:
    assert.dirsEqual(path.join('test/fixtures/', fixture, 'dist'), path.join('test/fixtures/', fixture, 'expected'));
  });
};

suite('cli', function () {
  this.timeout(5000);
  this.slow(3000);
  test('works', function (done) {
    fs.removeSync('test/fixtures/cli/dist');
    suppose(resolve('cli.js'), [
      'ejs',
      '-s', 'test/fixtures/cli/src',
      '-d', 'test/fixtures/cli/dist',
      '-l', 'test/fixtures/cli/layouts',
    ])
    .on('error', function (err) {
      console.error(err);
      done(err);
    })
    .end(function (code) {
      assert.dirsEqual('test/fixtures/cli/dist', 'test/fixtures/cli/expected');
      assert.equal(code, 0, 'CLI exited with non-zero exit code');
      done();
    });
  });
  test('returns errors', function (done) {
    var error;
    // Run cli.js ejs -s noop:
    suppose(resolve('cli.js'), ['ejs', '-s', 'noop'])
    .on('error', function (err) {
      error = err;
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
  test('empty files', () => assert.fixture('empty-files'));
  test('text', () => assert.fixture('text'));
  test('subfolders', () => assert.fixture('subfolders'));
});
suite('layouts & front-matter', function () {
  test('works', () => assert.fixture('layouts'));
  test('_path is set automatically', () => assert.fixture('_path'));
});
suite('_defaults file', function () {
  test('works', () => assert.fixture('_defaults'));
  test('can set default _layout', () => assert.fixture('default-layout'));
  test('works in subfolders', () => assert.fixture('_defaults-subfolders'));
});
suite('file types/extentions', function () {
  test('json', () => assert.fixture('json'));
  test('yml', () => assert.fixture('yml'));
  test('markdown', () => assert.fixture('markdown'));
});
suite('errors', function () {
  var dirs = {};
  setup(function () {
    dirs.src = 'test/fixtures/cli/src';
    dirs.dist = 'test/fixtures/cli/dist';
    dirs.layouts = 'test/fixtures/cli/layouts';
  });
  test('invalid src/', function (done) {
    dirs.src = 'noop';
    onessg('ejs', dirs)
    .catch(e => {
      done(assert(e));
    });
  });
  test('invalid layouts/', function (done) {
    dirs.layouts = 'noop';
    onessg('ejs', dirs)
    .catch(e => {
      done(assert(e));
    });
  });
  test('non-existent layout', function (done) {
    onessg('ejs', {
      src: 'test/fixtures/non-existent-layout/src',
      dist: 'test/fixtures/non-existent-layout/dist',
      layouts: 'test/fixtures/non-existent-layout/layouts',
    })
    .catch(e => {
      done(assert(e));
    });
  });
  test('invalid type for engine', function (done) {
    onessg(0, dirs)
    .catch(e => {
      done(assert(e));
    });
  });
  test('unsupported engine', function (done) {
    onessg('noop', dirs)
    .catch(e => {
      done(assert(e));
    });
  });
});
