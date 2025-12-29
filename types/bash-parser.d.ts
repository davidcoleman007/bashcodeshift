declare module '@isdk/bash-parser' {
  export interface BashParserAST {
    type: string;
    loc?: {
      start: { line: number; column: number };
      end: { line: number; column: number };
    };
    [key: string]: any;
  }

  export interface ParserOptions {
    locations?: boolean;
    comments?: boolean;
    ranges?: boolean;
  }

  export function parse(source: string, options?: ParserOptions): BashParserAST;
}