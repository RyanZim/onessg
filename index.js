'use strict';
const fs = require('fs-extra');
const globby = require('globby');
const transformer = require('./lib/transformer');
// Local Modules:
const getDefaults = require('./lib/getDefaults.js');
const Pipeline = require('./lib/pipeline');

// Config vars:
var conf;

// module.exports = function (config) {
//   return setConf(config)
//     .then(() => globby('**/*.@(html|md|markdown)', {cwd: conf.src}))
//     .then(arr => Promise.all(arr.map(processFile)));
// };
module.exports = execute;

async function execute(config, setup) {
  await setConf(config);

  let pipeline = new Pipeline();

  if (typeof setup === 'function')
    setup(pipeline);
  else
    pipeline.useDefaultConfiguration(conf);

  let chain = pipeline.build();
  let names = await globby('**/*.@(html|md|markdown)', {cwd: conf.src});
  let tasks = names.map(chain);
  let res = await Promise.all(tasks);
}

// Validates configuration,
// Sets module-wide config vars,
// Calls setConf on helper modules
// Accepts config
// Returns a promise
function setConf(config) {
  // Check that src & layouts exists:
  return Promise.all([
    fs.access(config.src),
    fs.access(config.layouts),
  ])
    .then(() => {
    // Set vars:
      conf = config;
      // setConf in helper modules:
      getDefaults.setConf(conf);
      transformer.setConf(conf);
    });
}
