'use strict';
const path = require('path');
const jstransformer = require('jstransformer');
const inputformat = require('inputformat-to-jstransformer');

module.exports = function (file, locals) {
  const format = path.extname(file).replace('.', '');
  const transformer = inputformat(format);
  if (!transformer) return Promise.reject(new Error(
    `No jstransformer installed for the format "${format}"`
  ));
  return jstransformer(transformer).renderFileAsync(file, locals);
};
