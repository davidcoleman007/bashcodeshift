/**
 * Transform: Update Git Commands
 *
 * This transform updates git commands to use modern syntax and best practices.
 */

module.exports = function(fileInfo, api, options) {
  const { source } = fileInfo;
  const { j } = api;

  // Parse source into AST
  const ast = j(source);

  // Find all git commands
  const gitCommands = ast.find(j.Command, { name: 'git' });

  gitCommands.forEach(path => {
    const command = path.value;
    const args = command.arguments;

    if (args.length > 0) {
      const firstArg = args[0];

      switch (firstArg) {
        case 'checkout':
          // git checkout -b <branch> -> git switch -c <branch>
          if (args.length > 2 && args[1] === '-b') {
            command.arguments[0] = 'switch';
            command.arguments[1] = '-c';
          }
          // git checkout <branch> -> git switch <branch>
          else if (args.length > 1 && !args[1].startsWith('-')) {
            command.arguments[0] = 'switch';
          }
          break;

        case 'branch':
          // git branch -d <branch> -> git branch --delete <branch>
          if (args.length > 2 && args[1] === '-d') {
            command.arguments[1] = '--delete';
          }
          // git branch -D <branch> -> git branch --delete --force <branch>
          else if (args.length > 2 && args[1] === '-D') {
            command.arguments[1] = '--delete';
            command.arguments.splice(2, 0, '--force');
          }
          break;

        case 'push':
          // git push origin <branch> -> git push -u origin <branch> (if it's a new branch)
          if (args.length === 3 && args[1] === 'origin' && !args.includes('-u')) {
            // This is a heuristic - in practice you'd need more context
            // to determine if it's a new branch
            command.arguments.splice(1, 0, '-u');
          }
          break;

        case 'pull':
          // git pull origin <branch> -> git pull origin <branch> --rebase
          if (args.length === 3 && args[1] === 'origin' && !args.includes('--rebase')) {
            command.arguments.push('--rebase');
          }
          break;

        case 'merge':
          // git merge <branch> -> git merge <branch> --no-ff
          if (args.length === 2 && !args.includes('--no-ff')) {
            command.arguments.push('--no-ff');
          }
          break;

        case 'commit':
          // git commit -m "message" -> git commit -m "message" --no-verify
          if (args.includes('-m') && !args.includes('--no-verify')) {
            command.arguments.push('--no-verify');
          }
          break;

        case 'clone':
          // git clone <url> -> git clone <url> --depth 1 (for shallow clones)
          if (args.length === 2 && !args.includes('--depth')) {
            command.arguments.push('--depth', '1');
          }
          break;
      }
    }
  });

  // Return transformed source
  return ast.toSource();
};