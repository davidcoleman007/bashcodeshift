declare module 'tree-sitter' {
  export default class Parser {
    setLanguage(language: any): void;
    parse(source: string): { rootNode: any };
  }
}

declare module 'tree-sitter-bash' {
  const Bash: any;
  export default Bash;
}