#!/usr/bin/env node
/* eslint no-console: "off" */
'use strict';
var argv = require('yargs')
.usage(`$0 <template_engine> [--dev]
$0 <template_engine> [-s <source_dir>] [-d <output_dir>] [-l <layout_dir>] [--dev]`)
.demand(1, 1, 'Error: You must specify an template engine')
.alias({
  s: 'src',
  d: 'dist',
  l: 'layouts',
})
.string(['s', 'd', 'l'])
.boolean('dev')
.default({
  s: 'src/',
  d: 'dist/',
  l: 'layouts/',
})
.describe({
  s: 'Set the src directory',
  d: 'Set the dist directory',
  l: 'Set the layouts directory',
  dev: 'Dev Mode, compiles drafts along with normal files',
})
.help()
.version()
.example(`$0 ejs
$0 ejs -s posts/ -d output/ -l templates/`)
.epilog('A list of supported template engines may be found at: https://github.com/tj/consolidate.js/#supported-template-engines.')
.argv;
var onessg = require('./index.js');
var conf={
  src: argv.s,
  dist: argv.d,
  layouts: argv.l,
  devMode: argv.dev,
};
onessg(argv._[0], conf, function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
