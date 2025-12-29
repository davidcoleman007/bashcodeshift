import { parse as parseBash } from '@isdk/bash-parser';
import {
  ProgramNode,
  CommandNode,
  VariableNode,
  ConditionalNode,
  LoopNode,
  FunctionNode,
  PipelineNode,
  RedirectNode,
  SubshellNode,
  CommentNode,
  Location,
  BashParserAST,
  ParserOptions
} from '../types';

/**
 * Bash AST Parser using @isdk/bash-parser
 * Converts bash-parser AST to jscodeshift-like structure
 */
export class BashParser {
  private options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = {
      locations: true,
      comments: true,
      ranges: true,
      ...options
    };
  }

  /**
   * Parse bash source code into jscodeshift-like AST
   * @param source - Bash source code
   * @returns jscodeshift-like AST
   */
  parse(source: string): ProgramNode {
    try {
      const bashAST = parseBash(source, this.options);
      return this.convertToJSCodeshiftAST(bashAST, source);
    } catch (error) {
      throw new Error(`Failed to parse bash source: ${(error as Error).message}`);
    }
  }

  /**
   * Convert @isdk/bash-parser AST to jscodeshift-like AST
   * @param node - bash-parser AST node
   * @param source - Original source code
   * @returns jscodeshift-like AST
   */
  private convertToJSCodeshiftAST(node: BashParserAST, source: string): ProgramNode {
    const ast: ProgramNode = {
      type: 'Program',
      body: [],
      sourceType: 'script',
      loc: this.getLocation(node)
    };

    // Convert bash-parser nodes to jscodeshift nodes
    this.walkNode(node, ast.body, source);

    return ast;
  }

  /**
   * Walk through bash-parser nodes and convert them
   * @param node - bash-parser node
   * @param body - AST body array
   * @param source - Original source code
   */
  private walkNode(node: BashParserAST, body: any[], source: string): void {
    switch (node.type) {
      case 'Script':
        // Script is the root node, process its body
        if (node['body']) {
          node['body'].forEach((child: BashParserAST) => {
            this.walkNode(child, body, source);
          });
        }
        break;

      case 'Command':
        body.push(this.convertCommand(node, source));
        break;

      case 'Assignment':
        body.push(this.convertVariableAssignment(node, source));
        break;

      case 'If':
        body.push(this.convertIfStatement(node, source));
        break;

      case 'For':
        body.push(this.convertForStatement(node, source));
        break;

      case 'While':
        body.push(this.convertWhileStatement(node, source));
        break;

      case 'Function':
        body.push(this.convertFunctionDefinition(node, source));
        break;

      case 'Pipeline':
        body.push(this.convertPipeline(node, source));
        break;

      case 'Subshell':
        body.push(this.convertSubshell(node, source));
        break;

      case 'Comment':
        body.push(this.convertComment(node, source));
        break;

      default:
        // Handle other node types or unknown nodes
        if (node['body'] && Array.isArray(node['body'])) {
          node['body'].forEach((child: BashParserAST) => {
            this.walkNode(child, body, source);
          });
        }
    }
  }

  /**
   * Convert command node
   * @param node - Command node from bash-parser
   * @param source - Source code
   * @returns Command AST node
   */
  private convertCommand(node: BashParserAST, source: string): CommandNode {
    const commandNode: CommandNode = {
      type: 'Command',
      name: node['name'] || '',
      arguments: node['args'] || [],
      loc: this.getLocation(node)
    };

    // Handle redirects if present
    if (node['redirects'] && Array.isArray(node['redirects'])) {
      commandNode.redirects = node['redirects'].map((redirect: BashParserAST) =>
        this.convertRedirect(redirect, source)
      );
    }

    return commandNode;
  }

  /**
   * Convert variable assignment node
   * @param node - Variable assignment node from bash-parser
   * @param source - Source code
   * @returns Variable AST node
   */
  private convertVariableAssignment(node: BashParserAST, source: string): VariableNode {
    return {
      type: 'Variable',
      name: node['name'] || '',
      value: node['value'] || '',
      export: node['export'] || false,
      readonly: node['readonly'] || false,
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert if statement node
   * @param node - If statement node from bash-parser
   * @param source - Source code
   * @returns Conditional AST node
   */
  private convertIfStatement(node: BashParserAST, source: string): ConditionalNode {
    return {
      type: 'Conditional',
      condition: this.getNodeText(node['condition'], source),
      consequent: this.extractBody(node['then'], source),
      alternate: node['else'] ? this.extractBody(node['else'], source) : null,
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert for statement node
   * @param node - For statement node from bash-parser
   * @param source - Source code
   * @returns Loop AST node
   */
  private convertForStatement(node: BashParserAST, source: string): LoopNode {
    return {
      type: 'Loop',
      kind: 'for',
      variable: node['variable'] || '',
      body: this.extractBody(node['body'], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert while statement node
   * @param node - While statement node from bash-parser
   * @param source - Source code
   * @returns Loop AST node
   */
  private convertWhileStatement(node: BashParserAST, source: string): LoopNode {
    return {
      type: 'Loop',
      kind: 'while',
      condition: this.getNodeText(node['condition'], source),
      body: this.extractBody(node['body'], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert function definition node
   * @param node - Function definition node from bash-parser
   * @param source - Source code
   * @returns Function AST node
   */
  private convertFunctionDefinition(node: BashParserAST, source: string): FunctionNode {
    return {
      type: 'Function',
      name: node['name'] || '',
      parameters: node['parameters'] || [],
      body: this.extractBody(node['body'], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert pipeline node
   * @param node - Pipeline node from bash-parser
   * @param source - Source code
   * @returns Pipeline AST node
   */
  private convertPipeline(node: BashParserAST, source: string): PipelineNode {
    return {
      type: 'Pipeline',
      commands: (node['commands'] || []).map((cmd: BashParserAST) =>
        this.convertCommand(cmd, source)
      ),
      negated: node['negated'] || false,
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert redirect node
   * @param node - Redirect node from bash-parser
   * @param source - Source code
   * @returns Redirect AST node
   */
  private convertRedirect(node: BashParserAST, source: string): RedirectNode {
    return {
      type: 'Redirect',
      operator: node['operator'] || '',
      target: node['target'] || '',
      fd: node['fd'],
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert subshell node
   * @param node - Subshell node from bash-parser
   * @param source - Source code
   * @returns Subshell AST node
   */
  private convertSubshell(node: BashParserAST, source: string): SubshellNode {
    return {
      type: 'Subshell',
      body: this.extractBody(node['body'], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert comment node
   * @param node - Comment node from bash-parser
   * @param source - Source code
   * @returns Comment AST node
   */
  private convertComment(node: BashParserAST, source: string): CommentNode {
    return {
      type: 'Comment',
      value: node['value'] || '',
      kind: node['kind'] || 'line',
      loc: this.getLocation(node)
    };
  }

  /**
   * Extract body from a node
   * @param node - Node containing body
   * @param source - Source code
   * @returns Body AST nodes
   */
  private extractBody(node: BashParserAST | BashParserAST[], source: string): any[] {
    const body: any[] = [];

    if (Array.isArray(node)) {
      node.forEach((child: BashParserAST) => {
        this.walkNode(child, body, source);
      });
    } else if (node && typeof node === 'object') {
      this.walkNode(node, body, source);
    }

    return body;
  }

  /**
   * Get location information for a node
   * @param node - bash-parser node
   * @returns Location object
   */
  private getLocation(node: BashParserAST): Location | undefined {
    if (node['loc']) {
      return {
        start: { line: node['loc'].start.line, column: node['loc'].start.column },
        end: { line: node['loc'].end.line, column: node['loc'].end.column }
      };
    }
    return undefined;
  }

  /**
   * Get text content of a node
   * @param node - bash-parser node
   * @param source - Source code
   * @returns Node text
   */
  private getNodeText(node: BashParserAST | string, source: string): string {
    if (typeof node === 'string') {
      return node;
    }

    if (node && node['loc']) {
      // Extract text from source based on location
      const lines = source.split('\n');
      const startLine = node['loc'].start.line - 1;
      const endLine = node['loc'].end.line - 1;

      if (startLine === endLine) {
        return lines[startLine].substring(
          node['loc'].start.column,
          node['loc'].end.column
        );
      } else {
        const parts = [];
        parts.push(lines[startLine].substring(node['loc'].start.column));
        for (let i = startLine + 1; i < endLine; i++) {
          parts.push(lines[i]);
        }
        parts.push(lines[endLine].substring(0, node['loc'].end.column));
        return parts.join('\n');
      }
    }

    return '';
  }
}