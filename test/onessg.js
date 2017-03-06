'use strict';
/* eslint no-console: "off" */
const fs = require('fs-extra');
const path = require('path-extra');
const assert = require('assert');
const suppose = require('suppose');
const resolve = require('autoresolve');
const onessg = require(resolve('index.js'));

// Expand the assert module:
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
  return onessg({
    src: path.join('test/fixtures/', fixture, 'src'),
    dist: distPath,
    layouts: layoutPath,
  })
  .then(() => {
    // Assert that dist/ & expected/ are equal:
    assert.dirsEqual(distPath, path.join('test/fixtures/', fixture, 'expected'));
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
    .on('error', err => {
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

  // Run before each test:
  setup(() => {
    dirs.src = 'test/fixtures/cli/src';
    dirs.dist = 'test/fixtures/cli/dist';
    dirs.layouts = 'test/fixtures/cli/layouts';
  });

  test('invalid src/', function (done) {
    dirs.src = 'noop';
    onessg(dirs)
    .catch(e => {
      done(assert(e));
    });
  });

  test('invalid layouts/', function (done) {
    dirs.layouts = 'noop';
    onessg(dirs)
    .catch(e => {
      done(assert(e));
    });
  });

  test('non-existent layout', function (done) {
    onessg({
      src: 'test/fixtures/non-existent-layout/src',
      dist: 'test/fixtures/non-existent-layout/dist',
      layouts: 'test/fixtures/non-existent-layout/layouts',
    })
    .catch(e => {
      done(assert(e));
    });
  });

  test('jstransformer not installed', function (done) {
    onessg({
      src: 'test/fixtures/jstransformer-not-installed/src',
      dist: 'test/fixtures/jstransformer-not-installed/dist',
      layouts: 'test/fixtures/jstransformer-not-installed/layouts',
    })
    .catch(e => {
      done(assert(e));
    });
  });
});
