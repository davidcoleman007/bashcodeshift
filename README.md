# BashCodeshift

A jscodeshift-like toolkit for bash script transformations, built with TypeScript and powered by @isdk/bash-parser.

## Features

- **jscodeshift-like API**: Familiar API for writing transforms, similar to jscodeshift
- **Bash AST Parsing**: Uses @isdk/bash-parser for accurate parsing of bash scripts
- **TypeScript Support**: Full TypeScript support with type safety
- **Node Constructors**: Create AST nodes programmatically (like `j.ClassDeclaration`)
- **Collection Methods**: Find, filter, and transform nodes (like `ast.find()`)
- **Node Manipulation**: Replace, insert, and remove nodes
- **CLI Tool**: Command-line interface for running transforms
- **Dry Run Mode**: Preview changes without modifying files
- **File Pattern Support**: Use glob patterns to target multiple files

## Installation

```bash
npm install -g bashcodeshift
```

Or install locally:

```bash
npm install bashcodeshift
```

## Quick Start

### Basic Usage

```bash
bashcodeshift -t transform.js script.sh
```

### Transform Multiple Files

```bash
bashcodeshift -t transform.js "**/*.sh"
```

### Dry Run (Preview Changes)

```bash
bashcodeshift -t transform.js "**/*.sh" --dry
```

## Writing Transforms

Transforms are JavaScript/TypeScript functions that receive file information and return modified source code, just like jscodeshift transforms.

### Basic Transform Structure

```typescript
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = (fileInfo, api, options) => {
  const { source } = fileInfo;
  const { b } = api;

  // Parse source into AST (like jscodeshift's 'j' API)
  const ast = b(source);

  // Find and transform commands (like ast.find(j.ClassDeclaration))
  ast.find('Command', { name: 'npm' })
    .forEach(path => {
      path.value.name = 'yarn';
    });

  // Return transformed source
  return ast.toSource();
};

export default transform;
```

### API Reference

The `api` object provides the following methods:

#### `b(source: string)`
Parse bash source code into an AST and return a jscodeshift-like API, similar to jscodeshift's `j()` function.

#### AST Node Constructors (like jscodeshift node constructors)
- `ast.Command(props)` - Shell commands: `npm install`, `git checkout`
- `ast.Variable(props)` - Variable assignments: `VAR=value`
- `ast.Conditional(props)` - If/else statements
- `ast.Loop(props)` - For/while loops
- `ast.Function(props)` - Function definitions
- `ast.Pipeline(props)` - Command pipelines: `cmd1 | cmd2`
- `ast.Redirect(props)` - I/O redirection: `>`, `<`, `>>`
- `ast.Subshell(props)` - Subshells: `$(command)`
- `ast.Comment(props)` - Comments: `# comment`

#### Collection Methods (identical to jscodeshift)
- `ast.find(nodeType, filter)` - Find nodes matching criteria
- `ast.filter(collection, predicate)` - Filter a collection
- `ast.forEach(collection, callback)` - Iterate over a collection
- `ast.map(collection, callback)` - Transform a collection
- `ast.size(collection)` - Get collection size

#### Node Manipulation (identical to jscodeshift)
- `path.replace(newNode)` - Replace a node
- `path.insertBefore(newNode)` - Insert before a node
- `path.insertAfter(newNode)` - Insert after a node
- `path.remove()` - Remove a node
- `path.prune()` - Remove node and clean up

#### Source Generation
- `ast.toSource(options)` - Generate source code from AST

### Example Transforms

#### Convert npm to yarn (Simple)

```typescript
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = (fileInfo, api, options) => {
  const { source } = fileInfo;
  const { b } = api;

  const ast = b(source);

  // Find all npm commands and convert to yarn
  ast.find('Command', { name: 'npm' }).forEach(path => {
    const command = path.value as any;
    command.name = 'yarn';

    if (command.arguments[0] === 'install') {
      command.arguments = command.arguments.slice(1);
    } else if (command.arguments[0] === 'uninstall') {
      command.arguments = ['remove', ...command.arguments.slice(1)];
    }
  });

  return ast.toSource();
};

export default transform;
```

#### Complex Transform (Multiple Operations)

```typescript
import { TransformFunction } from 'bashcodeshift';

const transform: TransformFunction = (fileInfo, api, options) => {
  const { source } = fileInfo;
  const { b } = api;

  const ast = b(source);

  // 1. Convert npm to yarn
  ast.find('Command', { name: 'npm' }).forEach(path => {
    const command = path.value as any;
    command.name = 'yarn';
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
      // Add set -e at the beginning using node constructor
      const setE = ast.Command({ name: 'set', arguments: ['-e'] });
      body.unshift(setE);
    }
  });

  // 3. Update git commands to modern syntax
  ast.find('Command', { name: 'git' }).forEach(path => {
    const command = path.value as any;
    const args = command.arguments;

    if (args[0] === 'checkout' && args[1] === '-b') {
      // git checkout -b <branch> -> git switch -c <branch>
      command.arguments = ['switch', '-c', ...args.slice(2)];
    }
  });

  // 4. Add logging to important commands
  const importantCommands = ['docker', 'kubectl', 'terraform'];
  importantCommands.forEach(cmdName => {
    ast.find('Command', { name: cmdName }).forEach(path => {
      const command = path.value as any;

      // Create a logging command using node constructor
      const logCmd = ast.Command({
        name: 'echo',
        arguments: [`[INFO] Running: ${cmdName} ${command.arguments.join(' ')}`]
      });

      // Insert logging before the command
      path.insertBefore(logCmd);
    });
  });

  return ast.toSource();
};

export default transform;
```

#### Advanced Transform (Your Style)

```typescript
/**
 * Transforms bash scripts for modern best practices.
 *
 * - Converts npm commands to yarn
 * - Adds error handling to functions and loops
 * - Updates git commands to modern syntax
 * - Adds logging to important commands
 *
 * @param {any} fileInfo - File information
 * @param {any} api - bashcodeshift API
 */
function transformBashScript(fileInfo, api) {
  const { source } = fileInfo;
  const { b } = api;

  const ast = b(source);

  // Convert npm to yarn (like your jscodeshift example)
  ast.find('Command', { name: 'npm' }).forEach(path => {
    const command = path.value;
    command.name = 'yarn';

    // Handle specific npm commands
    if (command.arguments[0] === 'install') {
      command.arguments = command.arguments.slice(1);
    } else if (command.arguments[0] === 'uninstall') {
      command.arguments = ['remove', ...command.arguments.slice(1)];
    }
  });

  // Add error handling to functions (like your constructor example)
  ast.find('Function').forEach(path => {
    const func = path.value;
    const body = func.body;

    // Check if error handling is present
    const hasErrorHandling = body.some(stmt =>
      stmt.type === 'Command' && stmt.name === 'set' && stmt.arguments.includes('-e')
    );

    if (!hasErrorHandling) {
      // Add error handling as the first statement
      const setE = ast.Command({ name: 'set', arguments: ['-e'] });
      body.unshift(setE);
    }
  });

  // Update git commands (like your method modification example)
  ast.find('Command', { name: 'git' }).forEach(path => {
    const command = path.value;
    const args = command.arguments;

    if (args[0] === 'checkout') {
      if (args[1] === '-b') {
        // git checkout -b <branch> -> git switch -c <branch>
        command.arguments = ['switch', '-c', ...args.slice(2)];
      } else if (args.length > 1 && !args[1].startsWith('-')) {
        // git checkout <branch> -> git switch <branch>
        command.arguments = ['switch', ...args.slice(1)];
      }
    }
  });

  return ast.toSource();
}

export default transformBashScript;
```

## CLI Options

```bash
bashcodeshift [options] <path>

Options:
  -t, --transform <path>      Path to transform file
  --parser <parser>           Parser to use (default: bash)
  --dry                       Dry run (no changes)
  --print                     Print output for comparison
  --verbose                   Show more information
  --ignore-pattern <pattern>  Ignore files matching pattern
  -h, --help                  Display help
```

## Testing Transforms

Use the provided test utilities to write tests for your transforms:

```typescript
import { defineTest } from 'bashcodeshift/dist/test-utils';

defineTest(__dirname, 'update-package-manager', null, 'update-package-manager', { parser: 'bash' });
```

## Development

### Prerequisites

- Node.js >= 16.0.0
- TypeScript >= 5.0.0

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run tests: `npm test`

### Available Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm run dev`: Watch mode for development
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run docs`: Generate documentation

## TypeScript Benefits

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: IntelliSense and autocomplete
- **Refactoring**: Safe refactoring with confidence
- **Documentation**: Self-documenting code with types
- **Maintainability**: Easier to maintain and extend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT