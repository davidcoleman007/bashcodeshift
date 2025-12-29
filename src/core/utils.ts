import { ParsedArguments, CommandType, CommentNode, CommandNode, VariableNode } from '../types';

/**
 * Utility functions for bash transforms
 */

/**
 * Check if a string is a valid bash identifier
 * @param str - String to check
 * @returns True if valid identifier
 */
export function isValidIdentifier(str: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(str);
}

/**
 * Escape a string for use in bash
 * @param str - String to escape
 * @returns Escaped string
 */
export function escapeBashString(str: string): string {
  return str.replace(/(["'$`\\])/g, '\\$1');
}

/**
 * Unescape a bash string
 * @param str - String to unescape
 * @returns Unescaped string
 */
export function unescapeBashString(str: string): string {
  return str.replace(/\\(["'$`\\])/g, '$1');
}

/**
 * Check if a command is a builtin bash command
 * @param command - Command name
 * @returns True if builtin
 */
export function isBuiltinCommand(command: string): boolean {
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
 * @param command - Command name
 * @returns True if common external command
 */
export function isCommonCommand(command: string): boolean {
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
 * @param command - Command name
 * @returns Command type
 */
export function getCommandType(command: string): CommandType {
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
 * @param args - Command arguments
 * @returns Parsed arguments
 */
export function parseArguments(args: string[]): ParsedArguments {
  const options: Record<string, any> = {};
  const positional: string[] = [];

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
 * @param name - Command name
 * @param args - Command arguments
 * @returns Command string
 */
export function buildCommand(name: string, args: string[]): string {
  return `${name} ${args.join(' ')}`.trim();
}

/**
 * Check if a string contains shell variables
 * @param str - String to check
 * @returns True if contains variables
 */
export function containsVariables(str: string): boolean {
  return /\$[a-zA-Z_][a-zA-Z0-9_]*/.test(str);
}

/**
 * Extract variable names from a string
 * @param str - String to extract from
 * @returns Variable names
 */
export function extractVariables(str: string): string[] {
  const matches = str.match(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g);
  return matches ? matches.map(match => match.slice(1)) : [];
}

/**
 * Check if a string is a valid bash condition
 * @param str - String to check
 * @returns True if valid condition
 */
export function isValidCondition(str: string): boolean {
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
 * @param code - Code to format
 * @param indent - Indentation level
 * @returns Formatted code
 */
export function formatBashCode(code: string, indent = 0): string {
  const lines = code.split('\n');
  const indentStr = '  '.repeat(indent);

  return lines
    .map(line => line.trim() ? indentStr + line : line)
    .join('\n');
}

/**
 * Create a comment node
 * @param comment - Comment text
 * @returns Comment AST node
 */
export function createComment(comment: string): CommentNode {
  return {
    type: 'Comment',
    value: comment,
    loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
  };
}

/**
 * Create a command node
 * @param name - Command name
 * @param args - Command arguments
 * @returns Command AST node
 */
export function createCommand(name: string, args: string[] = []): CommandNode {
  return {
    type: 'Command',
    name,
    arguments: args,
    loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
  };
}

/**
 * Create a variable assignment node
 * @param name - Variable name
 * @param value - Variable value
 * @returns Variable AST node
 */
export function createVariable(name: string, value: string): VariableNode {
  return {
    type: 'Variable',
    name,
    value,
    loc: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } }
  };
}