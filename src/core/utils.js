/**
 * Utility functions for bash transforms
 */

/**
 * Check if a string is a valid bash identifier
 * @param {string} str - String to check
 * @returns {boolean} True if valid identifier
 */
function isValidIdentifier(str) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str);
}

/**
 * Escape a string for use in bash
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeBashString(str) {
  return str.replace(/(["'$`\\])/g, '\\$1');
}

/**
 * Unescape a bash string
 * @param {string} str - String to unescape
 * @returns {string} Unescaped string
 */
function unescapeBashString(str) {
  return str.replace(/\\(["'$`\\])/g, '$1');
}

/**
 * Check if a command is a builtin bash command
 * @param {string} command - Command name
 * @returns {boolean} True if builtin
 */
function isBuiltinCommand(command) {
  const builtins = [
    'cd', 'echo', 'exit', 'export', 'read', 'set', 'shift', 'unset',
    'alias', 'unalias', 'bg', 'fg', 'jobs', 'kill', 'wait',
    'break', 'continue', 'for', 'function', 'if', 'select', 'until', 'while',
    'case', 'esac', 'do', 'done', 'elif', 'else', 'fi', 'in', 'then'
  ];
  return builtins.includes(command);
}

/**
 * Check if a command is a common external command
 * @param {string} command - Command name
 * @returns {boolean} True if common external command
 */
function isCommonCommand(command) {
  const commonCommands = [
    'ls', 'cat', 'grep', 'sed', 'awk', 'find', 'xargs',
    'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'touch',
    'chmod', 'chown', 'ln', 'tar', 'gzip', 'gunzip',
    'curl', 'wget', 'ssh', 'scp', 'rsync',
    'git', 'docker', 'kubectl', 'npm', 'yarn', 'node'
  ];
  return commonCommands.includes(command);
}

/**
 * Get command type (builtin, common, or custom)
 * @param {string} command - Command name
 * @returns {string} Command type
 */
function getCommandType(command) {
  if (isBuiltinCommand(command)) {
    return 'builtin';
  } else if (isCommonCommand(command)) {
    return 'common';
  } else {
    return 'custom';
  }
}

/**
 * Parse command arguments into options and positional args
 * @param {Array} args - Command arguments
 * @returns {Object} Parsed arguments
 */
function parseArguments(args) {
  const options = {};
  const positional = [];

  for (const arg of args) {
    if (arg.startsWith('-')) {
      if (arg.startsWith('--')) {
        // Long option
        const [key, value] = arg.slice(2).split('=');
        options[key] = value || true;
      } else {
        // Short option
        const key = arg.slice(1);
        options[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { options, positional };
}

/**
 * Build command string from name and arguments
 * @param {string} name - Command name
 * @param {Array} args - Command arguments
 * @returns {string} Command string
 */
function buildCommand(name, args) {
  return `${name} ${args.join(' ')}`.trim();
}

/**
 * Check if a string contains shell variables
 * @param {string} str - String to check
 * @returns {boolean} True if contains variables
 */
function containsVariables(str) {
  return /\$[a-zA-Z_][a-zA-Z0-9_]*/.test(str);
}

/**
 * Extract variable names from a string
 * @param {string} str - String to extract from
 * @returns {Array} Variable names
 */
function extractVariables(str) {
  const matches = str.match(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g);
  return matches ? matches.map(match => match.slice(1)) : [];
}

/**
 * Check if a string is a valid bash condition
 * @param {string} str - String to check
 * @returns {boolean} True if valid condition
 */
function isValidCondition(str) {
  // Basic check for common bash test operators
  const testOperators = [
    '-eq', '-ne', '-lt', '-le', '-gt', '-ge',
    '-f', '-d', '-e', '-r', '-w', '-x',
    '=', '!=', '-z', '-n'
  ];

  return testOperators.some(op => str.includes(op)) ||
         /^[a-zA-Z0-9_]+$/.test(str.trim());
}

/**
 * Format bash code with proper indentation
 * @param {string} code - Code to format
 * @param {number} indent - Indentation level
 * @returns {string} Formatted code
 */
function formatBashCode(code, indent = 0) {
  const lines = code.split('\n');
  const indentStr = '  '.repeat(indent);

  return lines
    .map(line => line.trim() ? indentStr + line : line)
    .join('\n');
}

/**
 * Create a comment node
 * @param {string} comment - Comment text
 * @returns {Object} Comment AST node
 */
function createComment(comment) {
  return {
    type: 'Comment',
    value: comment,
    loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
  };
}

/**
 * Create a command node
 * @param {string} name - Command name
 * @param {Array} args - Command arguments
 * @returns {Object} Command AST node
 */
function createCommand(name, args = []) {
  return {
    type: 'Command',
    name,
    arguments: args,
    loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
  };
}

/**
 * Create a variable assignment node
 * @param {string} name - Variable name
 * @param {string} value - Variable value
 * @returns {Object} Variable AST node
 */
function createVariable(name, value) {
  return {
    type: 'Variable',
    name,
    value,
    loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
  };
}

module.exports = {
  isValidIdentifier,
  escapeBashString,
  unescapeBashString,
  isBuiltinCommand,
  isCommonCommand,
  getCommandType,
  parseArguments,
  buildCommand,
  containsVariables,
  extractVariables,
  isValidCondition,
  formatBashCode,
  createComment,
  createCommand,
  createVariable
};