const Parser = require('./parser');

/**
 * AST Transformer with jscodeshift-like API
 */
class Transformer {
  constructor() {
    this.parser = new Parser();
  }

  /**
   * Create jscodeshift-like API
   * @param {string} source - Source code
   * @returns {Object} jscodeshift API
   */
  j(source) {
    const ast = this.parser.parse(source);
    return this.createJSCodeshiftAPI(ast, source);
  }

  /**
   * Create jscodeshift-compatible API
   * @param {Object} ast - AST object
   * @param {string} source - Original source code
   * @returns {Object} jscodeshift API
   */
  createJSCodeshiftAPI(ast, source) {
    const api = {
      // AST node constructors
      Command: (props) => ({ type: 'Command', ...props }),
      Variable: (props) => ({ type: 'Variable', ...props }),
      Conditional: (props) => ({ type: 'Conditional', ...props }),
      Loop: (props) => ({ type: 'Loop', ...props }),
      Function: (props) => ({ type: 'Function', ...props }),
      Pipeline: (props) => ({ type: 'Pipeline', ...props }),
      Argument: (props) => ({ type: 'Argument', ...props }),

      // Collection methods
      find: (nodeType, filter) => this.findNodes(ast, nodeType, filter),
      filter: (collection, predicate) => this.filterCollection(collection, predicate),
      forEach: (collection, callback) => this.forEachCollection(collection, callback),
      map: (collection, callback) => this.mapCollection(collection, callback),

      // Node manipulation
      replace: (path, newNode) => this.replaceNode(path, newNode),
      insertBefore: (path, newNode) => this.insertBeforeNode(path, newNode),
      insertAfter: (path, newNode) => this.insertAfterNode(path, newNode),
      remove: (path) => this.removeNode(path),

      // Source generation
      toSource: (options = {}) => this.generateSource(ast, source, options)
    };

    return api;
  }

  /**
   * Find nodes in AST
   * @param {Object} ast - AST object
   * @param {string} nodeType - Type of node to find
   * @param {Object} filter - Filter criteria
   * @returns {Array} Collection of matching nodes
   */
  findNodes(ast, nodeType, filter = {}) {
    const collection = [];
    this.walkAST(ast, (node, path) => {
      if (node.type === nodeType && this.matchesFilter(node, filter)) {
        collection.push({
          value: node,
          path: path,
          replace: (newNode) => this.replaceNode(path, newNode),
          insertBefore: (newNode) => this.insertBeforeNode(path, newNode),
          insertAfter: (newNode) => this.insertAfterNode(path, newNode),
          remove: () => this.removeNode(path)
        });
      }
    });
    return collection;
  }

  /**
   * Walk AST and call callback for each node
   * @param {Object} node - AST node
   * @param {Function} callback - Callback function
   * @param {Array} path - Current path
   */
  walkAST(node, callback, path = []) {
    callback(node, path);

    if (node.body && Array.isArray(node.body)) {
      node.body.forEach((child, index) => {
        this.walkAST(child, callback, [...path, { node: child, index }]);
      });
    }
  }

  /**
   * Check if node matches filter criteria
   * @param {Object} node - AST node
   * @param {Object} filter - Filter criteria
   * @returns {boolean} True if matches
   */
  matchesFilter(node, filter) {
    return Object.keys(filter).every(key => {
      if (key === 'arguments' && Array.isArray(filter[key])) {
        return this.arraysEqual(node.arguments, filter[key]);
      }
      return node[key] === filter[key];
    });
  }

  /**
   * Compare arrays for equality
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {boolean} True if equal
   */
  arraysEqual(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => item === arr2[index]);
  }

  /**
   * Filter collection
   * @param {Array} collection - Node collection
   * @param {Function} predicate - Filter function
   * @returns {Array} Filtered collection
   */
  filterCollection(collection, predicate) {
    return collection.filter(predicate);
  }

  /**
   * For each collection
   * @param {Array} collection - Node collection
   * @param {Function} callback - Callback function
   */
  forEachCollection(collection, callback) {
    collection.forEach(callback);
  }

  /**
   * Map collection
   * @param {Array} collection - Node collection
   * @param {Function} callback - Callback function
   * @returns {Array} Mapped collection
   */
  mapCollection(collection, callback) {
    return collection.map(callback);
  }

  /**
   * Replace node
   * @param {Array} path - Node path
   * @param {Object} newNode - New node
   */
  replaceNode(path, newNode) {
    if (path.length === 0) return;

    const lastPath = path[path.length - 1];
    const parent = this.getNodeAtPath(path.slice(0, -1));

    if (parent && parent.body && Array.isArray(parent.body)) {
      parent.body[lastPath.index] = newNode;
    }
  }

  /**
   * Insert before node
   * @param {Array} path - Node path
   * @param {Object} newNode - New node
   */
  insertBeforeNode(path, newNode) {
    if (path.length === 0) return;

    const lastPath = path[path.length - 1];
    const parent = this.getNodeAtPath(path.slice(0, -1));

    if (parent && parent.body && Array.isArray(parent.body)) {
      parent.body.splice(lastPath.index, 0, newNode);
    }
  }

  /**
   * Insert after node
   * @param {Array} path - Node path
   * @param {Object} newNode - New node
   */
  insertAfterNode(path, newNode) {
    if (path.length === 0) return;

    const lastPath = path[path.length - 1];
    const parent = this.getNodeAtPath(path.slice(0, -1));

    if (parent && parent.body && Array.isArray(parent.body)) {
      parent.body.splice(lastPath.index + 1, 0, newNode);
    }
  }

  /**
   * Remove node
   * @param {Array} path - Node path
   */
  removeNode(path) {
    if (path.length === 0) return;

    const lastPath = path[path.length - 1];
    const parent = this.getNodeAtPath(path.slice(0, -1));

    if (parent && parent.body && Array.isArray(parent.body)) {
      parent.body.splice(lastPath.index, 1);
    }
  }

  /**
   * Get node at path
   * @param {Array} path - Node path
   * @returns {Object} Node at path
   */
  getNodeAtPath(path) {
    let current = this.rootAST;
    for (const pathItem of path) {
      if (current && current.body && Array.isArray(current.body)) {
        current = current.body[pathItem.index];
      } else {
        return null;
      }
    }
    return current;
  }

  /**
   * Generate source code from AST
   * @param {Object} ast - AST object
   * @param {string} originalSource - Original source code
   * @param {Object} options - Generation options
   * @returns {string} Generated source code
   */
  generateSource(ast, originalSource, options = {}) {
    // For now, use a simple approach to reconstruct source
    // In a full implementation, you'd want to use a proper code generator
    return this.astToSource(ast, options);
  }

  /**
   * Convert AST back to source code
   * @param {Object} node - AST node
   * @param {Object} options - Options
   * @returns {string} Source code
   */
  astToSource(node, options = {}) {
    switch (node.type) {
      case 'Program':
        return node.body.map(child => this.astToSource(child, options)).join('\n');

      case 'Command':
        return `${node.name} ${node.arguments.join(' ')}`;

      case 'Variable':
        return `${node.name}=${node.value}`;

      case 'Conditional':
        let result = `if ${node.condition}; then\n`;
        result += node.consequent.map(child => `  ${this.astToSource(child, options)}`).join('\n');
        if (node.alternate) {
          result += '\nelse\n';
          result += node.alternate.map(child => `  ${this.astToSource(child, options)}`).join('\n');
        }
        result += '\nfi';
        return result;

      case 'Loop':
        if (node.kind === 'for') {
          return `for ${node.variable}; do\n  ${node.body.map(child => this.astToSource(child, options)).join('\n  ')}\ndone`;
        } else if (node.kind === 'while') {
          return `while ${node.condition}; do\n  ${node.body.map(child => this.astToSource(child, options)).join('\n  ')}\ndone`;
        }
        break;

      case 'Function':
        return `function ${node.name}() {\n  ${node.body.map(child => this.astToSource(child, options)).join('\n  ')}\n}`;

      case 'Pipeline':
        return node.commands.map(cmd => this.astToSource(cmd, options)).join(' | ');

      default:
        return '';
    }
  }
}

module.exports = Transformer;