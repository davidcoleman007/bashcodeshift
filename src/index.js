/**
 * BashCodeshift - A JavaScript codemod toolkit for bash scripts
 * @module bashcodeshift
 */

const Parser = require('./core/parser');
const Transformer = require('./core/transformer');
const Runner = require('./core/runner');
const utils = require('./core/utils');

module.exports = {
  Parser,
  Transformer,
  Runner,
  utils,

  // Convenience methods
  parse: (source) => new Parser().parse(source),
  transform: (ast, transformFn) => new Transformer().transform(ast, transformFn),
  run: (transformPath, filePaths, options) => new Runner().run(transformPath, filePaths, options)
};