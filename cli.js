#!/usr/bin/env node
/* eslint no-console: "off" */
var argv = require('yargs')
.usage('$0 <template_engine> \n' +
'$0 <template_engine> [-s <source_dir>] [-d <output_dir>] [-l <layout_dir>]')
.demand(1, 1, 'Error: You must specify an template engine')
.default({
  s: 'src/',
  d: 'dist/',
  l: 'layouts/',
})
.string(['s', 'd', 'l'])
.alias({
  s: 'src',
  d: 'dist',
  l: 'layouts',
})
.describe({
  s: 'Set the src directory',
  d: 'Set the dist directory',
  l: 'Set the layouts directory',
})
.help()
.version()
.example('$0 ejs\n' +
'$0 ejs -s posts/ -d output/ -l templates/')
.epilog('A list of supported template engines may be found at: https://github.com/tj/consolidate.js/#supported-template-engines.')
.argv;
var onessg = require('./index.js');
var dirs={
  src: argv.s,
  dist: argv.d,
  layouts: argv.l,
};
onessg(argv._[0], dirs, function (err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
