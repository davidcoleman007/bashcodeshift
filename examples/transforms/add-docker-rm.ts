import { TransformFunction } from '../../src/types';

const transform: TransformFunction = (fileInfo, api, options) => {
  const { source } = fileInfo;
  const { b } = api;

  const ast = b(source);
  const dockerRunCommands = ast.find('Command', { name: 'docker' });

  dockerRunCommands.forEach(path => {
    const command = path.value as any;
    const args = command.arguments;

    if (args.length > 0 && args[0] === 'run') {
      // Check if --rm flag is already present
      const hasRmFlag = args.includes('--rm');

      if (!hasRmFlag) {
        // Insert --rm after 'run'
        command.arguments.splice(1, 0, '--rm');
      }
    }
  });

  return ast.toSource();
};

export default transform;