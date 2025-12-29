const Parser = require('tree-sitter');
const Bash = require('tree-sitter-bash');

/**
 * Bash AST Parser using tree-sitter
 */
class BashParser {
  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(Bash);
  }

  /**
   * Parse bash source code into AST
   * @param {string} source - Bash source code
   * @returns {Object} AST object
   */
  parse(source) {
    const tree = this.parser.parse(source);
    return this.convertToJSCodeshiftAST(tree.rootNode, source);
  }

  /**
   * Convert tree-sitter AST to jscodeshift-compatible AST
   * @param {Object} node - Tree-sitter node
   * @param {string} source - Original source code
   * @returns {Object} JSCodeshift AST
   */
  convertToJSCodeshiftAST(node, source) {
    const ast = {
      type: 'Program',
      body: [],
      sourceType: 'script',
      loc: this.getLocation(node)
    };

    // Convert tree-sitter nodes to jscodeshift nodes
    this.walkNode(node, ast.body, source);

    return ast;
  }

  /**
   * Walk through tree-sitter nodes and convert them
   * @param {Object} node - Tree-sitter node
   * @param {Array} body - AST body array
   * @param {string} source - Original source code
   */
  walkNode(node, body, source) {
    switch (node.type) {
      case 'command':
        body.push(this.convertCommand(node, source));
        break;
      case 'variable_assignment':
        body.push(this.convertVariableAssignment(node, source));
        break;
      case 'if_statement':
        body.push(this.convertIfStatement(node, source));
        break;
      case 'for_statement':
        body.push(this.convertForStatement(node, source));
        break;
      case 'while_statement':
        body.push(this.convertWhileStatement(node, source));
        break;
      case 'function_definition':
        body.push(this.convertFunctionDefinition(node, source));
        break;
      case 'pipeline':
        body.push(this.convertPipeline(node, source));
        break;
      default:
        // Handle other node types
        if (node.children) {
          node.children.forEach(child => this.walkNode(child, body, source));
        }
    }
  }

  /**
   * Convert command node
   * @param {Object} node - Command node
   * @param {string} source - Source code
   * @returns {Object} Command AST node
   */
  convertCommand(node, source) {
    const commandNode = {
      type: 'Command',
      name: '',
      arguments: [],
      loc: this.getLocation(node)
    };

    // Extract command name and arguments
    node.children.forEach(child => {
      if (child.type === 'command_name') {
        commandNode.name = this.getNodeText(child, source);
      } else if (child.type === 'argument') {
        commandNode.arguments.push(this.getNodeText(child, source));
      }
    });

    return commandNode;
  }

  /**
   * Convert variable assignment node
   * @param {Object} node - Variable assignment node
   * @param {string} source - Source code
   * @returns {Object} Variable AST node
   */
  convertVariableAssignment(node, source) {
    return {
      type: 'Variable',
      name: this.getNodeText(node.children[0], source),
      value: this.getNodeText(node.children[1], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert if statement node
   * @param {Object} node - If statement node
   * @param {string} source - Source code
   * @returns {Object} Conditional AST node
   */
  convertIfStatement(node, source) {
    return {
      type: 'Conditional',
      condition: this.getNodeText(node.children[1], source),
      consequent: this.extractBody(node.children[2], source),
      alternate: node.children[3] ? this.extractBody(node.children[3], source) : null,
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert for statement node
   * @param {Object} node - For statement node
   * @param {string} source - Source code
   * @returns {Object} Loop AST node
   */
  convertForStatement(node, source) {
    return {
      type: 'Loop',
      kind: 'for',
      variable: this.getNodeText(node.children[1], source),
      body: this.extractBody(node.children[2], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert while statement node
   * @param {Object} node - While statement node
   * @param {string} source - Source code
   * @returns {Object} Loop AST node
   */
  convertWhileStatement(node, source) {
    return {
      type: 'Loop',
      kind: 'while',
      condition: this.getNodeText(node.children[1], source),
      body: this.extractBody(node.children[2], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert function definition node
   * @param {Object} node - Function definition node
   * @param {string} source - Source code
   * @returns {Object} Function AST node
   */
  convertFunctionDefinition(node, source) {
    return {
      type: 'Function',
      name: this.getNodeText(node.children[1], source),
      body: this.extractBody(node.children[2], source),
      loc: this.getLocation(node)
    };
  }

  /**
   * Convert pipeline node
   * @param {Object} node - Pipeline node
   * @param {string} source - Source code
   * @returns {Object} Pipeline AST node
   */
  convertPipeline(node, source) {
    return {
      type: 'Pipeline',
      commands: node.children
        .filter(child => child.type === 'command')
        .map(child => this.convertCommand(child, source)),
      loc: this.getLocation(node)
    };
  }

  /**
   * Extract body from a node
   * @param {Object} node - Node containing body
   * @param {string} source - Source code
   * @returns {Array} Body AST nodes
   */
  extractBody(node, source) {
    const body = [];
    if (node.children) {
      node.children.forEach(child => this.walkNode(child, body, source));
    }
    return body;
  }

  /**
   * Get location information for a node
   * @param {Object} node - Tree-sitter node
   * @returns {Object} Location object
   */
  getLocation(node) {
    return {
      start: { line: node.startPosition.row, column: node.startPosition.column },
      end: { line: node.endPosition.row, column: node.endPosition.column }
    };
  }

  /**
   * Get text content of a node
   * @param {Object} node - Tree-sitter node
   * @param {string} source - Source code
   * @returns {string} Node text
   */
  getNodeText(node, source) {
    return source.substring(node.startIndex, node.endIndex);
  }
}

module.exports = BashParser;