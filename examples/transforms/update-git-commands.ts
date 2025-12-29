import { TransformFunction } from '../../src/types';

const transform: TransformFunction = (fileInfo, api, options) => {
  const { source } = fileInfo;
  const { b } = api;

  const ast = b(source);
  const gitCommands = ast.find('Command', { name: 'git' });

  gitCommands.forEach(path => {
    const command = path.value as any;
    const args = command.arguments;

    if (args.length > 0) {
      const firstArg = args[0];

      // Update deprecated git commands
      switch (firstArg) {
        case 'checkout':
          // git checkout -b <branch> -> git switch -c <branch>
          if (args.length > 2 && args[1] === '-b') {
            command.arguments = ['switch', '-c', ...args.slice(2)];
          }
          // git checkout <branch> -> git switch <branch>
          else if (args.length > 1 && !args[1].startsWith('-')) {
            command.arguments = ['switch', ...args.slice(1)];
          }
          break;

        case 'branch':
          // git branch -m <old> <new> -> git branch -m <new>
          if (args.length > 2 && args[1] === '-m') {
            command.arguments = ['branch', '-m', args[2]];
          }
          break;
      }
    }
  });

  return ast.toSource();
};

export default transform;