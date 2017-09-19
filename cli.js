#!/usr/bin/env node
/* eslint no-console: "off" */
'use strict';
const path = require('path');
const onessg = require('./index.js');
const argv = require('yargs')
  .usage(`$0
$0 [-s <source_dir>] [-d <output_dir>] [-l <layout_dir>] [-c <config_dir>]`)
  .alias({
    s: 'src',
    d: 'dist',
    l: 'layouts',
    c: 'config',
  })
  .string(['s', 'd', 'l', 'c'])
  .default({
    s: 'src/',
    d: 'dist/',
    l: 'layouts/',
  })
  .describe({
    s: 'Set the src directory',
    d: 'Set the dist directory',
    l: 'Set the layouts directory',
    c: 'Set the directory that contains onessg.config.js',
  })
  .example(
    `$0
$0 -s posts/ -d output/ -l templates/`
  )
  .argv;

var conf = {
  src: argv.s,
  dist: argv.d,
  layouts: argv.l,
};

// Try to load config file:
try {
  let dir = argv.config ? path.resolve(argv.config) : process.cwd();
  conf = Object.assign({}, require(path.join(dir, 'onessg.config.js')), conf);
} catch (e) { /* Ignore */}

onessg(conf)
  .catch(function (err) {
    console.error(err);
    process.exit(1);
  });
