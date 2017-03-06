#!/usr/bin/env node
/* eslint no-console: "off" */
'use strict';
var argv = require('yargs')
.usage(`$0
$0 [-s <source_dir>] [-d <output_dir>] [-l <layout_dir>]`)
.alias({
  s: 'src',
  d: 'dist',
  l: 'layouts',
})
.string(['s', 'd', 'l'])
.default({
  s: 'src/',
  d: 'dist/',
  l: 'layouts/',
})
.describe({
  s: 'Set the src directory',
  d: 'Set the dist directory',
  l: 'Set the layouts directory',
})
.help()
.version()
.example(`$0
$0 -s posts/ -d output/ -l templates/`)
.argv;
var onessg = require('./index.js');
var conf = {
  src: argv.s,
  dist: argv.d,
  layouts: argv.l,
};
onessg(conf)
.catch(function (err) {
  console.error(err);
  process.exit(1);
});
