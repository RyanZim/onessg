#!/usr/bin/env node
var argv = require('yargs')
.usage('$0 -e ejs \n\nOverride Defaults: \n$0 -e ejs -s source/ -d _output -l templates')
.demand(['e'])
.default({
  s: 'src/',
  d: 'dist/',
  l: 'layouts/'
})
.string(['e', 's', 'd', 'l'])
.alias({
  e: 'engine',
  s: 'src',
  d: 'dist',
  l: 'layouts'
})
.describe({
  e: 'Set the valid consolidate.js template engine to use when parsing layouts',
  s: 'Set the src directory',
  d: 'Set the dist directory',
  l: 'Set the layouts directory'
})
.help()
.argv;
var ssg = require('./index.js');
ssg(argv.e, argv.s, argv.d, argv.l);
