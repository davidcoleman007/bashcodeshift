/**
 * Type definitions for bashcodeshift
 * A jscodeshift-like toolkit for bash script transformations
 */

// Basic AST node interface
export interface ASTNode {
  type: string;
  loc?: Location;
  [key: string]: any;
}

// Location information
export interface Location {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
}

// AST Node Types (similar to jscodeshift node constructors)
export interface CommandNode extends ASTNode {
  type: 'Command';
  name: string;
  arguments: string[];
  redirects?: RedirectNode[];
}

export interface VariableNode extends ASTNode {
  type: 'Variable';
  name: string;
  value: string;
  export?: boolean;
  readonly?: boolean;
}

export interface ConditionalNode extends ASTNode {
  type: 'Conditional';
  condition: string;
  consequent: ASTNode[];
  alternate?: ASTNode[] | null;
}

export interface LoopNode extends ASTNode {
  type: 'Loop';
  kind: 'for' | 'while' | 'until';
  variable?: string;
  condition?: string;
  body: ASTNode[];
}

export interface FunctionNode extends ASTNode {
  type: 'Function';
  name: string;
  body: ASTNode[];
  parameters?: string[];
}

export interface PipelineNode extends ASTNode {
  type: 'Pipeline';
  commands: CommandNode[];
  negated?: boolean;
}

export interface RedirectNode extends ASTNode {
  type: 'Redirect';
  operator: string;
  target: string;
  fd?: number;
}

export interface SubshellNode extends ASTNode {
  type: 'Subshell';
  body: ASTNode[];
}

export interface CommentNode extends ASTNode {
  type: 'Comment';
  value: string;
  kind: 'line' | 'block';
}

export interface ProgramNode extends ASTNode {
  type: 'Program';
  body: ASTNode[];
  sourceType: 'script';
}

// File information passed to transforms
export interface FileInfo {
  path: string;
  source: string;
  name: string;
}

// Transform API (similar to jscodeshift API)
export interface TransformAPI {
  b: (source: string) => BashCodeshiftAPI;
  stats: TransformStats;
  report: (message: string) => void;
}

// Transform statistics
export interface TransformStats {
  processed: number;
  changed: number;
  errors: number;
}

// bashcodeshift API interface (similar to jscodeshift API)
export interface BashCodeshiftAPI {
  // AST node constructors (like j.ClassDeclaration, j.MethodDefinition)
  Command: (props: Partial<CommandNode>) => CommandNode;
  Variable: (props: Partial<VariableNode>) => VariableNode;
  Conditional: (props: Partial<ConditionalNode>) => ConditionalNode;
  Loop: (props: Partial<LoopNode>) => LoopNode;
  Function: (props: Partial<FunctionNode>) => FunctionNode;
  Pipeline: (props: Partial<PipelineNode>) => PipelineNode;
  Redirect: (props: Partial<RedirectNode>) => RedirectNode;
  Subshell: (props: Partial<SubshellNode>) => SubshellNode;
  Comment: (props: Partial<CommentNode>) => CommentNode;

  // Collection methods (identical to jscodeshift)
  find: (nodeType: string | any, filter?: Record<string, any>) => NodePath[];
  filter: (collection: NodePath[], predicate: (path: NodePath) => boolean) => NodePath[];
  forEach: (collection: NodePath[], callback: (path: NodePath) => void) => void;
  map: <T>(collection: NodePath[], callback: (path: NodePath) => T) => T[];
  size: (collection: NodePath[]) => number;

  // Source generation
  toSource: (options?: SourceOptions) => string;
}

// Node path (similar to jscodeshift NodePath)
export interface NodePath {
  value: ASTNode;
  path: PathItem[];
  replace: (newNode: ASTNode) => void;
  insertBefore: (newNode: ASTNode) => void;
  insertAfter: (newNode: ASTNode) => void;
  remove: () => void;
  prune: () => void;
}

// Path item for AST traversal
export interface PathItem {
  node: ASTNode;
  index: number;
}

// Source generation options
export interface SourceOptions {
  quote?: 'single' | 'double';
  indent?: number;
  lineEnding?: '\n' | '\r\n';
}

// Transform function signature
export interface TransformFunction {
  (fileInfo: FileInfo, api: TransformAPI, options: Record<string, any>): string | Promise<string>;
}

// Runner options
export interface RunnerOptions {
  dry?: boolean;
  print?: boolean;
  verbose?: boolean;
  ignorePattern?: string;
  parser?: string;
  [key: string]: any;
}

// Runner statistics
export interface RunnerStats {
  processed: number;
  changed: number;
  errors: number;
}

// Utility types
export interface ParsedArguments {
  options: Record<string, any>;
  positional: string[];
}

export type CommandType = 'builtin' | 'common' | 'custom';

// @isdk/bash-parser integration types
export interface BashParserAST {
  type: string;
  [key: string]: any;
}

export interface ParserOptions {
  locations?: boolean;
  comments?: boolean;
  ranges?: boolean;
}