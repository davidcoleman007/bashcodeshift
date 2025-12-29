/**
 * BashCodeshift - A JavaScript codemod toolkit for bash scripts
 * @module bashcodeshift
 */

import { BashParser } from './core/parser';
import { Transformer } from './core/transformer';
import { Runner } from './core/runner';
import * as utils from './core/utils';

// Export types
export * from './types';

// Export core classes
export { BashParser as Parser, Transformer, Runner, utils };

// Export convenience methods
export const parse = (source: string) => new BashParser().parse(source);
export const transform = (ast: any, transformFn: any) => {
  const transformer = new Transformer();
  return transformer.transform(ast, transformFn);
};
export const run = (transformPath: string, filePaths: string | string[], options: any) =>
  new Runner().run(transformPath, filePaths, options);