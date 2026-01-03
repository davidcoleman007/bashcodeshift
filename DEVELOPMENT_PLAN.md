# BashCodeshift Development Plan

## Overview

This document outlines the development plan for creating a bash codemod tool similar to jscodeshift. The tool will allow you to write JavaScript-based transforms to automatically update bash scripts across multiple repositories.

**Architecture**: BashCodeshift follows the same pattern as jscodeshift, which delegates AST traversal to babel/traverse. Similarly, bashcodeshift delegates parsing and traversal to the `bash-traverse` library, which provides comprehensive bash parsing, AST generation, and traversal capabilities. This separation of concerns allows bashcodeshift to focus on providing the jscodeshift-like API and transformation utilities.

## Current Status

✅ **Phase 1 Complete**: Core Infrastructure
- Basic project structure created
- Package.json with dependencies
- Core parser integration with @isdk/bash-parser
- Transformer with jscodeshift-like API (`b()` function)
- CLI runner with file processing
- Utility functions for common operations
- Example transforms created
- Test framework implemented
- Basic AST node constructors (Command, Variable, Conditional, Loop, Function, Pipeline, Redirect, Subshell, Comment)
- Collection methods (find, filter, forEach, map, size)
- Node manipulation methods (replace, insertBefore, insertAfter, remove, prune)
- Basic source code generation (toSource)

## Implementation Phases

### Phase 1: Core Infrastructure ✅
**Status**: Complete

- [x] Set up project structure
- [x] Integrate with @isdk/bash-parser for parsing
- [x] Create jscodeshift-like API (`b()` function)
- [x] Build CLI interface
- [x] Add basic error handling
- [x] Create example transforms
- [x] Implement testing framework
- [x] Basic AST node constructors
- [x] Collection methods (find, filter, forEach, map, size)
- [x] Node manipulation methods (replace, insertBefore, insertAfter, remove, prune)
- [x] Basic source code generation

### Phase 2: Integration with bash-traverse (In Progress)
**Priority**: High
**Status**: Architecture Decision Made

**Note**: Traversal is delegated to `bash-traverse`, following the pattern of `babel/traverse` vs `jscodeshift`. This separation allows bashcodeshift to focus on the transformation API while bash-traverse handles the heavy lifting of parsing, AST generation, and traversal.

- [ ] Integrate bash-traverse for parsing (replacing @isdk/bash-parser)
- [ ] Integrate bash-traverse for AST traversal (replacing custom walkAST implementation)
- [ ] Use bash-traverse's generate() for source code generation
- [ ] Update transformer to use bash-traverse's NodePath API
- [ ] Leverage bash-traverse's comprehensive bash syntax support:
  - [x] Basic commands and pipelines (via bash-traverse)
  - [x] Control structures: if/then/else, for, while, until, case (via bash-traverse)
  - [x] Variable assignment and expansion (via bash-traverse)
  - [x] Line continuations (via bash-traverse)
  - [x] Heredocs and here-strings (via bash-traverse)
  - [x] Command substitution `$(command)` and backticks (via bash-traverse)
  - [x] Test expressions `[ ... ]` and `[[ ... ]]` (via bash-traverse)
  - [x] Function definitions (via bash-traverse)
  - [x] Comments and shebangs (via bash-traverse)
  - [x] Round-trip fidelity (via bash-traverse)
- [ ] Preserve comments and formatting through bash-traverse
- [ ] Leverage source location tracking from bash-traverse

### Phase 3: Enhanced Transformation API
**Priority**: High

- [x] Node transformation capabilities (via bash-traverse NodePath):
  - [x] Node replacement (replaceWith)
  - [x] Node insertion (insertBefore, insertAfter)
  - [x] Node removal (remove)
- [ ] Enhanced node wrapping utilities
- [x] Source code generation from AST (via bash-traverse generate)
- [ ] Improve source code generation options and formatting control
- [ ] Add transformation validation
- [ ] Add transformation statistics and reporting

### Phase 4: Enhanced API & Utilities
**Priority**: Medium

- [x] Core jscodeshift-like API:
  - [x] Collection methods (filter, map, forEach, size)
  - [x] Basic node constructors (Command, Variable, Conditional, Loop, Function, Pipeline, Redirect, Subshell, Comment)
- [ ] Expand node constructors to match all bash-traverse node types
- [ ] Enhanced path manipulation utilities
- [ ] Add utility functions:
  - [ ] Command validation
  - [ ] Argument parsing
  - [ ] Variable analysis
  - [ ] Dependency detection
- [ ] Create helper functions for common patterns
- [ ] Add transformation templates
- [ ] Integrate with bash-traverse plugin system

### Phase 5: CLI & User Experience
**Priority**: Medium

- [ ] Enhance CLI features:
  - [ ] Interactive mode
  - [ ] Progress indicators
  - [ ] Better error reporting
  - [ ] Configuration files
- [ ] Add support for:
  - [ ] Multiple file formats (.sh, .bash, etc.)
  - [ ] Directory recursion
  - [ ] File filtering
  - [ ] Backup creation
- [ ] Improve output formatting
- [ ] Add verbose/debug modes

### Phase 6: Testing & Documentation
**Priority**: Medium

- [ ] Comprehensive test suite:
  - [ ] Unit tests for all components
  - [ ] Integration tests
  - [ ] Performance tests
  - [ ] Edge case testing
- [ ] Documentation:
  - [ ] API documentation
  - [ ] Transform writing guide
  - [ ] Best practices
  - [ ] Examples and tutorials
- [ ] Create transformation library
- [ ] Add documentation website

### Phase 7: Advanced Features
**Duration**: 2-3 weeks
**Priority**: Low

- [ ] Multi-file transformations
- [ ] Context-aware transformations
- [ ] Dependency analysis
- [ ] Transformation chaining
- [ ] Plugin system
- [ ] IDE integration
- [ ] Performance optimizations

## Technical Challenges & Solutions

### 1. Bash Parsing Complexity
**Challenge**: Bash has complex syntax that's difficult to parse correctly.
**Solution**: Delegate parsing to `bash-traverse`, which provides comprehensive bash parsing with full syntax coverage including control structures, expansions, heredocs, and more.

### 2. AST Traversal
**Challenge**: Implementing robust AST traversal that handles all bash constructs correctly.
**Solution**: Delegate traversal to `bash-traverse`, which provides a babel/traverse-like API with NodePath objects for safe AST manipulation. This follows the same pattern as jscodeshift delegating to babel/traverse.

### 3. AST to Source Code Generation
**Challenge**: Reconstructing bash code from AST while preserving formatting and round-trip fidelity.
**Solution**: Use `bash-traverse`'s `generate()` function, which provides sophisticated code generation with full structural fidelity and formatting preservation.

### 4. Command Context Understanding
**Challenge**: Understanding the context of commands (e.g., whether a git command is in a CI environment).
**Solution**: Add context analysis capabilities and multi-file awareness in bashcodeshift layer.

### 5. Transformation Safety
**Challenge**: Ensuring transformations don't break existing scripts.
**Solution**: Add validation, dry-run mode, and comprehensive testing. Leverage bash-traverse's round-trip testing capabilities.

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
git clone <repository>
cd bashcodeshift
npm install
```

### Development Setup
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Build project
npm run build
```

### Running Transforms
```bash
# Run a transform
node bin/bashcodeshift -t examples/transforms/update-package-manager.js script.sh

# Dry run
node bin/bashcodeshift -t examples/transforms/update-package-manager.js script.sh --dry

# Print output
node bin/bashcodeshift -t examples/transforms/update-package-manager.js script.sh --print
```

## Example Use Cases

### 1. Package Manager Migration
```bash
# Transform npm commands to yarn
bashcodeshift -t transforms/npm-to-yarn.js "**/*.sh"
```

### 2. Docker Best Practices
```bash
# Add --rm flag to docker run commands
bashcodeshift -t transforms/add-docker-rm.js "**/*.sh"
```

### 3. Git Command Updates
```bash
# Update git commands to modern syntax
bashcodeshift -t transforms/update-git-commands.js "**/*.sh"
```

### 4. CI/CD Script Updates
```bash
# Update CI/CD scripts for new platforms
bashcodeshift -t transforms/update-ci-scripts.js "**/*.sh"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Next Steps

1. **Immediate**: Integrate bash-traverse for parsing and traversal
2. **Short-term**: Replace custom walkAST implementation with bash-traverse's traverse API
3. **Short-term**: Replace custom source generation with bash-traverse's generate function
4. **Medium-term**: Expand node constructors to match all bash-traverse node types
5. **Medium-term**: Add more example transforms and documentation
6. **Long-term**: Build a community around the tool

## Architecture

### Component Separation

BashCodeshift follows a layered architecture similar to jscodeshift:

1. **bash-traverse** (lower layer): Provides parsing, AST generation, traversal, and code generation
   - Similar to `@babel/parser` and `@babel/traverse` in the JavaScript ecosystem
   - Handles all bash syntax complexity
   - Provides NodePath API for AST manipulation
   - Ensures round-trip fidelity

2. **bashcodeshift** (upper layer): Provides jscodeshift-like transformation API
   - Similar to `jscodeshift` in the JavaScript ecosystem
   - Focuses on developer-friendly transformation utilities
   - Provides collection methods and node constructors
   - Handles file processing and CLI interface

This separation allows:
- bash-traverse to evolve independently with better parsing/traversal
- bashcodeshift to focus on transformation ergonomics
- Both projects to be used independently if needed

## Resources

- [jscodeshift Documentation](https://github.com/facebook/jscodeshift)
- [bash-traverse](https://github.com/your-org/bash-traverse) - Parser and traversal library
- [@isdk/bash-parser](https://github.com/isdk/bash-parser) - Current parser (to be replaced by bash-traverse)
- [Bash Reference Manual](https://www.gnu.org/software/bash/manual/)
- [Shell Scripting Best Practices](https://google.github.io/styleguide/shellguide.html)