var execSync=require('child_process').execSync;
var fs=require('fs-extra');
var path=require('path');
var assert=require('assert');
var replaceExt=require('replace-ext');
assert.file=function (fileName) {
  fileName=replaceExt(fileName, '.html');
  var expected=fs.readFileSync(path.join('test/expected', fileName), 'utf8');
  var actual=fs.readFileSync(path.join('test/dist', fileName), 'utf8');
  assert.equal(actual, expected);
};
// Clean dist:
// fs-extra:
fs.removeSync('test/dist/');
// Build with cli:
execSync('./../cli.js -e ejs', {cwd: 'test'});
// Tests:
suite('plain html', function () {
  test('empty file', function () {
    assert.file('empty.html');
  });
  test('text', function () {
    assert.file('text.html');
  });
  test('empty front-matter', function () {
    assert.file('empty-fm.html');
  });
});
suite('markdown', function () {
  test('empty file', function () {
    assert.file('empty-md.md');
  });
  test('text', function () {
    assert.file('text-md.md');
  });
  test('advanced markdown', function () {
    assert.file('markdown.md');
  });
  test('.markdown extention', function () {
    assert.file('text-markdown.markdown');
  });
});
suite('layouts & front-matter', function () {
  test('basic layout', function () {
    assert.file('layout.html');
  });
  test('locals', function () {
    assert.file('locals.html');
  });
  test('json front-matter', function () {
    assert.file('json-fm.html');
  });
});
suite('subfolders', function () {
  test('file with text', function () {
    assert.file('subfolder/text.html');
  });
  test('file with locals', function () {
    assert.file('subfolder/locals.html');
  });
});
suite('_defaults file', function () {
  test('sets defaults for locals', function () {
    assert.file('no-author.html');
  });
  test('defaults are overridable in front-matter', function () {
    assert.file('author.html');
  });
  test('can set default _layout', function () {
    assert.file('default-layout/text.html');
  });
  test('files in subfolders inherit defaults', function () {
    assert.file('subfolder/no-author-no-editor.html');
  });
  test('_defaults file in subfolder overrides root _defaults', function () {
    assert.file('overrides/no-author-no-editor.html');
  });
  test('_defaults.json works', function () {
    assert.file('json/no-author.html');
  });
});
