/**
 * Transform: Update Package Manager Commands
 *
 * This transform updates package manager commands from npm to yarn.
 * It handles common npm commands and converts them to their yarn equivalents.
 */

import { TransformFunction } from '../../src/types';

const transform: TransformFunction = (fileInfo, api, options) => {
  const { source } = fileInfo;
  const { b } = api;

  const ast = b(source);

  // Find all npm commands and convert to yarn
  ast.find('Command', { name: 'npm' }).forEach(path => {
    const command = path.value as any;
    const args = command.arguments;

    if (args.length > 0) {
      const firstArg = args[0];
      switch (firstArg) {
        case 'install':
          command.name = 'yarn';
          command.arguments = args.slice(1);
          break;
        case 'uninstall':
          command.name = 'yarn';
          command.arguments = ['remove', ...args.slice(1)];
          break;
        case 'run':
          command.name = 'yarn';
          break;
        case 'start':
          command.name = 'yarn';
          break;
        case 'test':
          command.name = 'yarn';
          break;
        case 'build':
          command.name = 'yarn';
          break;
        default:
          command.name = 'yarn';
      }
    } else {
      command.name = 'yarn';
    }
  });

  return ast.toSource();
};

export default transform;