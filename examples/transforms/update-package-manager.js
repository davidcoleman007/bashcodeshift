/**
 * Transform: Update Package Manager Commands
 *
 * This transform updates package manager commands from npm to yarn.
 * It handles common npm commands and converts them to their yarn equivalents.
 */

module.exports = function(fileInfo, api, options) {
  const { source } = fileInfo;
  const { j } = api;

  // Parse source into AST
  const ast = j(source);

  // Find all npm commands
  const npmCommands = ast.find(j.Command, { name: 'npm' });

  npmCommands.forEach(path => {
    const command = path.value;
    const args = command.arguments;

    // Convert npm commands to yarn equivalents
    if (args.length > 0) {
      const firstArg = args[0];

      switch (firstArg) {
        case 'install':
          // npm install -> yarn
          command.name = 'yarn';
          command.arguments = args.slice(1); // Remove 'install'
          break;

        case 'i':
          // npm i -> yarn
          command.name = 'yarn';
          command.arguments = args.slice(1); // Remove 'i'
          break;

        case 'add':
          // npm add <package> -> yarn add <package>
          command.name = 'yarn';
          break;

        case 'remove':
          // npm remove <package> -> yarn remove <package>
          command.name = 'yarn';
          command.arguments[0] = 'remove';
          break;

        case 'uninstall':
          // npm uninstall <package> -> yarn remove <package>
          command.name = 'yarn';
          command.arguments[0] = 'remove';
          break;

        case 'run':
          // npm run <script> -> yarn <script>
          command.name = 'yarn';
          command.arguments = args.slice(1); // Remove 'run'
          break;

        case 'test':
          // npm test -> yarn test
          command.name = 'yarn';
          break;

        case 'start':
          // npm start -> yarn start
          command.name = 'yarn';
          break;

        case 'build':
          // npm run build -> yarn build
          command.name = 'yarn';
          break;

        case 'dev':
          // npm run dev -> yarn dev
          command.name = 'yarn';
          break;

        case '--version':
          // npm --version -> yarn --version
          command.name = 'yarn';
          break;

        case 'init':
          // npm init -> yarn init
          command.name = 'yarn';
          break;

        case 'publish':
          // npm publish -> yarn publish
          command.name = 'yarn';
          break;

        case 'login':
          // npm login -> yarn login
          command.name = 'yarn';
          break;

        case 'logout':
          // npm logout -> yarn logout
          command.name = 'yarn';
          break;

        case 'whoami':
          // npm whoami -> yarn whoami
          command.name = 'yarn';
          break;

        case 'config':
          // npm config -> yarn config
          command.name = 'yarn';
          break;

        case 'cache':
          // npm cache clean -> yarn cache clean
          command.name = 'yarn';
          break;

        default:
          // For other commands, just change the name
          command.name = 'yarn';
          break;
      }
    } else {
      // npm without arguments -> yarn
      command.name = 'yarn';
    }
  });

  // Return transformed source
  return ast.toSource();
};