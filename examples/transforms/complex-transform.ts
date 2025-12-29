import { TransformFunction } from '../../src/types';

/**
 * Complex transform example demonstrating jscodeshift-like API
 *
 * This transform:
 * - Converts npm to yarn commands
 * - Adds error handling to functions
 * - Updates git commands to modern syntax
 * - Adds logging to important commands
 * - Converts echo statements to printf for better formatting
 */
const transform: TransformFunction = (fileInfo, api, options) => {
  const { source } = fileInfo;
  const { b } = api;

  const ast = b(source);

  // 1. Convert npm commands to yarn
  ast.find('Command', { name: 'npm' }).forEach(path => {
    const command = path.value as any;
    command.name = 'yarn';

    if (command.arguments[0] === 'install') {
      command.arguments = command.arguments.slice(1);
    } else if (command.arguments[0] === 'uninstall') {
      command.arguments = ['remove', ...command.arguments.slice(1)];
    }
  });

  // 2. Add error handling to functions
  ast.find('Function').forEach(path => {
    const func = path.value as any;
    const body = func.body;

    // Check if set -e is already present
    const hasSetE = body.some((stmt: any) =>
      stmt.type === 'Command' && stmt.name === 'set' && stmt.arguments.includes('-e')
    );

    if (!hasSetE) {
      // Add set -e at the beginning
      const setE = ast.Command({ name: 'set', arguments: ['-e'] });
      body.unshift(setE);
    }
  });

  // 3. Update git commands to modern syntax
  ast.find('Command', { name: 'git' }).forEach(path => {
    const command = path.value as any;
    const args = command.arguments;

    if (args.length > 0) {
      switch (args[0]) {
        case 'checkout':
          if (args.length > 2 && args[1] === '-b') {
            // git checkout -b <branch> -> git switch -c <branch>
            command.arguments = ['switch', '-c', ...args.slice(2)];
          } else if (args.length > 1 && !args[1].startsWith('-')) {
            // git checkout <branch> -> git switch <branch>
            command.arguments = ['switch', ...args.slice(1)];
          }
          break;
      }
    }
  });

  // 4. Add logging to important commands
  const importantCommands = ['docker', 'kubectl', 'terraform', 'aws'];
  importantCommands.forEach(cmdName => {
    ast.find('Command', { name: cmdName }).forEach(path => {
      const command = path.value as any;

      // Create a logging command
      const logCmd = ast.Command({
        name: 'echo',
        arguments: [`[INFO] Running: ${cmdName} ${command.arguments.join(' ')}`]
      });

      // Insert logging before the command
      path.insertBefore(logCmd);
    });
  });

  // 5. Convert echo statements to printf for better formatting
  ast.find('Command', { name: 'echo' }).forEach(path => {
    const command = path.value as any;
    const args = command.arguments;

    if (args.length > 0 && args[0].includes('%')) {
      // Convert echo with format strings to printf
      command.name = 'printf';
      // printf needs a newline at the end
      if (!args[args.length - 1].endsWith('\\n')) {
        command.arguments[args.length - 1] += '\\n';
      }
    }
  });

  // 6. Add error handling to loops
  ast.find('Loop').forEach(path => {
    const loop = path.value as any;
    const body = loop.body;

    // Add error handling if not present
    const hasErrorHandling = body.some((stmt: any) =>
      stmt.type === 'Command' && stmt.name === 'set' && stmt.arguments.includes('-e')
    );

    if (!hasErrorHandling) {
      const setE = ast.Command({ name: 'set', arguments: ['-e'] });
      body.unshift(setE);
    }
  });

  // 7. Update variable assignments to use modern syntax
  ast.find('Variable').forEach(path => {
    const variable = path.value as any;

    // Add readonly to important variables
    const importantVars = ['API_KEY', 'SECRET', 'TOKEN', 'PASSWORD'];
    if (importantVars.some(v => variable.name.includes(v))) {
      variable.readonly = true;
    }
  });

  // 8. Add comments to complex conditionals
  ast.find('Conditional').forEach(path => {
    const conditional = path.value as any;

    if (conditional.condition.length > 50) {
      // Add a comment explaining complex conditions
      const comment = ast.Comment({
        value: `Complex condition: ${conditional.condition}`,
        kind: 'line'
      });

      path.insertBefore(comment);
    }
  });

  return ast.toSource();
};

export default transform;