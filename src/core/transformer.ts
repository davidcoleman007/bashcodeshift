import { BashParser } from './parser';
import {
  BashCodeshiftAPI,
  NodePath,
  PathItem,
  SourceOptions,
  ASTNode,
  ProgramNode,
  TransformFunction,
  CommandNode,
  VariableNode,
  ConditionalNode,
  LoopNode,
  FunctionNode,
  PipelineNode,
  RedirectNode,
  SubshellNode,
  CommentNode
} from '../types';

/**
 * AST Transformer with jscodeshift-like API
 */
export class Transformer {
  private parser: BashParser;
  private rootAST: ProgramNode | null = null;

  constructor() {
    this.parser = new BashParser();
  }

  /**
   * Transform AST using a transform function
   * @param ast - AST object
   * @param _transformFn - Transform function (unused in current implementation)
   * @returns Transformed AST
   */
  transform(ast: ProgramNode, _transformFn: TransformFunction): ProgramNode {
    // For now, just return the AST as-is
    // In a full implementation, this would apply the transform function
    return ast;
  }

  /**
   * Create jscodeshift-like API
   * @param source - Source code
   * @returns jscodeshift-like API
   */
  b(source: string): BashCodeshiftAPI {
    const ast = this.parser.parse(source);
    this.rootAST = ast;
    return this.createBashCodeshiftAPI(ast, source);
  }

  /**
   * Create jscodeshift-compatible API
   * @param ast - AST object
   * @param _source - Original source code (unused in current implementation)
   * @returns jscodeshift-like API
   */
  private createBashCodeshiftAPI(ast: ProgramNode, _source: string): BashCodeshiftAPI {
    const api: BashCodeshiftAPI = {
      // AST node constructors (like j.ClassDeclaration, j.MethodDefinition)
      Command: (props) => ({ type: 'Command', name: '', arguments: [], ...props } as CommandNode),
      Variable: (props) => ({ type: 'Variable', name: '', value: '', ...props } as VariableNode),
      Conditional: (props) => ({ type: 'Conditional', condition: '', consequent: [], ...props } as ConditionalNode),
      Loop: (props) => ({ type: 'Loop', kind: 'for', body: [], ...props } as LoopNode),
      Function: (props) => ({ type: 'Function', name: '', body: [], ...props } as FunctionNode),
      Pipeline: (props) => ({ type: 'Pipeline', commands: [], ...props } as PipelineNode),
      Redirect: (props) => ({ type: 'Redirect', operator: '', target: '', ...props } as RedirectNode),
      Subshell: (props) => ({ type: 'Subshell', body: [], ...props } as SubshellNode),
      Comment: (props) => ({ type: 'Comment', value: '', kind: 'line', ...props } as CommentNode),

      // Collection methods (identical to jscodeshift)
      find: (nodeType: string | any, filter: Record<string, any> = {}) => this.findNodes(ast, nodeType, filter),
      filter: (collection: NodePath[], predicate: (path: NodePath) => boolean) => this.filterCollection(collection, predicate),
      forEach: (collection: NodePath[], callback: (path: NodePath) => void) => this.forEachCollection(collection, callback),
      map: <T>(collection: NodePath[], callback: (path: NodePath) => T) => this.mapCollection(collection, callback),
      size: (collection: NodePath[]) => this.sizeCollection(collection),

      // Source generation
      toSource: (options: SourceOptions = {}) => this.generateSource(ast, options)
    };

    return api;
  }

  /**
   * Find nodes in AST
   * @param ast - AST object
   * @param nodeType - Type of node to find
   * @param filter - Filter criteria
   * @returns Collection of matching nodes
   */
  private findNodes(ast: ProgramNode, nodeType: string | any, filter: Record<string, any> = {}): NodePath[] {
    const collection: NodePath[] = [];
    this.walkAST(ast, (node: any, path: PathItem[]) => {
      if (node.type === nodeType && this.matchesFilter(node, filter)) {
        collection.push({
          value: node,
          path: path,
          replace: (newNode: ASTNode) => this.replaceNode({ value: node, path: path } as NodePath, newNode),
          insertBefore: (newNode: ASTNode) => this.insertBeforeNode({ value: node, path: path } as NodePath, newNode),
          insertAfter: (newNode: ASTNode) => this.insertAfterNode({ value: node, path: path } as NodePath, newNode),
          remove: () => this.removeNode({ value: node, path: path } as NodePath),
          prune: () => this.pruneNode({ value: node, path: path } as NodePath)
        });
      }
    });
    return collection;
  }

  /**
   * Walk AST and call callback for each node
   * @param node - AST node
   * @param callback - Callback function
   * @param path - Current path
   */
  private walkAST(node: any, callback: (node: any, path: PathItem[]) => void, path: PathItem[] = []): void {
    callback(node, path);

    if (node.body && Array.isArray(node.body)) {
      node.body.forEach((child: any, index: number) => {
        this.walkAST(child, callback, [...path, { node: child, index }]);
      });
    }
  }

  /**
   * Check if node matches filter criteria
   * @param node - AST node
   * @param filter - Filter criteria
   * @returns True if matches
   */
  private matchesFilter(node: any, filter: Record<string, any>): boolean {
    return Object.keys(filter).every(key => {
      if (key === 'arguments' && Array.isArray(filter[key])) {
        return this.arraysEqual(node.arguments, filter[key]);
      }
      return node[key] === filter[key];
    });
  }

  /**
   * Compare arrays for equality
   * @param arr1 - First array
   * @param arr2 - Second array
   * @returns True if equal
   */
  private arraysEqual(arr1: any[], arr2: any[]): boolean {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, index) => item === arr2[index]);
  }

  /**
   * Filter collection
   * @param collection - Node collection
   * @param predicate - Filter function
   * @returns Filtered collection
   */
  private filterCollection(collection: NodePath[], predicate: (path: NodePath) => boolean): NodePath[] {
    return collection.filter(predicate);
  }

  /**
   * For each collection
   * @param collection - Node collection
   * @param callback - Callback function
   */
  private forEachCollection(collection: NodePath[], callback: (path: NodePath) => void): void {
    collection.forEach(callback);
  }

  /**
   * Map collection
   * @param collection - Node collection
   * @param callback - Callback function
   * @returns Mapped collection
   */
  private mapCollection<T>(collection: NodePath[], callback: (path: NodePath) => T): T[] {
    return collection.map(callback);
  }

  /**
   * Get collection size
   * @param collection - Node collection
   * @returns Collection size
   */
  private sizeCollection(collection: NodePath[]): number {
    return collection.length;
  }

  /**
   * Replace node
   * @param path - Node path
   * @param newNode - New node
   */
  private replaceNode(path: NodePath, newNode: ASTNode): void {
    if (path.path.length === 0) return;

    const lastPath = path.path[path.path.length - 1];
    if (!lastPath) return;

    const parent = this.getNodeAtPath(path.path.slice(0, -1));

    if (parent && parent.body && Array.isArray(parent.body)) {
      parent.body[lastPath.index] = newNode;
    }
  }

  /**
   * Insert before node
   * @param path - Node path
   * @param newNode - New node
   */
  private insertBeforeNode(path: NodePath, newNode: ASTNode): void {
    if (path.path.length === 0) return;

    const lastPath = path.path[path.path.length - 1];
    if (!lastPath) return;

    const parent = this.getNodeAtPath(path.path.slice(0, -1));

    if (parent && parent.body && Array.isArray(parent.body)) {
      parent.body.splice(lastPath.index, 0, newNode);
    }
  }

  /**
   * Insert after node
   * @param path - Node path
   * @param newNode - New node
   */
  private insertAfterNode(path: NodePath, newNode: ASTNode): void {
    if (path.path.length === 0) return;

    const lastPath = path.path[path.path.length - 1];
    if (!lastPath) return;

    const parent = this.getNodeAtPath(path.path.slice(0, -1));

    if (parent && parent.body && Array.isArray(parent.body)) {
      parent.body.splice(lastPath.index + 1, 0, newNode);
    }
  }

  /**
   * Remove node
   * @param path - Node path
   */
  private removeNode(path: NodePath): void {
    if (path.path.length === 0) return;

    const lastPath = path.path[path.path.length - 1];
    if (!lastPath) return;

    const parent = this.getNodeAtPath(path.path.slice(0, -1));

    if (parent && parent.body && Array.isArray(parent.body)) {
      parent.body.splice(lastPath.index, 1);
    }
  }

  /**
   * Prune node (remove and clean up)
   * @param path - Node path
   */
  private pruneNode(path: NodePath): void {
    this.removeNode(path);
    // Additional cleanup logic could be added here
  }

  /**
   * Get node at path
   * @param path - Node path
   * @returns Node at path
   */
  private getNodeAtPath(path: PathItem[]): any {
    let current: any = this.rootAST;
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
   * @param ast - AST object
   * @param options - Generation options
   * @returns Generated source code
   */
  private generateSource(ast: ProgramNode, options: SourceOptions = {}): string {
    // For now, use a simple approach to reconstruct source
    // In a full implementation, you'd want to use a proper code generator
    return this.astToSource(ast, options);
  }

  /**
   * Convert AST back to source code
   * @param node - AST node
   * @param options - Options
   * @returns Source code
   */
  private astToSource(node: any, options: SourceOptions = {}): string {
    const indent = options.indent || 0;
    const lineEnding = options.lineEnding || '\n';

    switch (node.type) {
      case 'Program':
        return node.body.map((child: any) => this.astToSource(child, options)).join(lineEnding);

      case 'Command':
        let cmd = node.name;
        if (node.arguments && node.arguments.length > 0) {
          cmd += ' ' + node.arguments.join(' ');
        }
        if (node.redirects && node.redirects.length > 0) {
          cmd += ' ' + node.redirects.map((r: any) => this.astToSource(r, options)).join(' ');
        }
        return cmd;

      case 'Variable':
        let varStr = node.name;
        if (node.export) varStr = 'export ' + varStr;
        if (node.readonly) varStr = 'readonly ' + varStr;
        return `${varStr}=${node.value}`;

      case 'Conditional':
        let result = `if ${node.condition}; then${lineEnding}`;
        result += node.consequent.map((child: any) => '  ' + this.astToSource(child, options)).join(lineEnding);
        if (node.alternate) {
          result += `${lineEnding}else${lineEnding}`;
          result += node.alternate.map((child: any) => '  ' + this.astToSource(child, options)).join(lineEnding);
        }
        result += `${lineEnding}fi`;
        return result;

      case 'Loop':
        if (node.kind === 'for') {
          return `for ${node.variable}; do${lineEnding}  ${node.body.map((child: any) => this.astToSource(child, options)).join(lineEnding + '  ')}${lineEnding}done`;
        } else if (node.kind === 'while') {
          return `while ${node.condition}; do${lineEnding}  ${node.body.map((child: any) => this.astToSource(child, options)).join(lineEnding + '  ')}${lineEnding}done`;
        }
        break;

      case 'Function':
        return `function ${node.name}() {${lineEnding}  ${node.body.map((child: any) => this.astToSource(child, options)).join(lineEnding + '  ')}${lineEnding}}`;

      case 'Pipeline':
        let pipeline = node.commands.map((cmd: any) => this.astToSource(cmd, options)).join(' | ');
        if (node.negated) pipeline = '!' + pipeline;
        return pipeline;

      case 'Redirect':
        let redirect = '';
        if (node.fd !== undefined) redirect += node.fd;
        redirect += node.operator + node.target;
        return redirect;

      case 'Subshell':
        return `(${node.body.map((child: any) => this.astToSource(child, options)).join('; ')})`;

      case 'Comment':
        return node.kind === 'line' ? `# ${node.value}` : `# ${node.value}`;

      default:
        return '';
    }
    return '';
  }
}