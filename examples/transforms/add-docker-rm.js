/**
 * Transform: Add Docker --rm Flag
 *
 * This transform adds the --rm flag to docker run commands to automatically
 * remove containers when they exit.
 */

module.exports = function(fileInfo, api, options) {
  const { source } = fileInfo;
  const { j } = api;

  // Parse source into AST
  const ast = j(source);

  // Find all docker commands
  const dockerCommands = ast.find(j.Command, { name: 'docker' });

  dockerCommands.forEach(path => {
    const command = path.value;
    const args = command.arguments;

    // Check if this is a 'docker run' command
    if (args.length > 0 && args[0] === 'run') {
      // Check if --rm flag is already present
      const hasRmFlag = args.includes('--rm');

      if (!hasRmFlag) {
        // Insert --rm flag after 'run'
        command.arguments.splice(1, 0, '--rm');
      }
    }
  });

  // Return transformed source
  return ast.toSource();
};