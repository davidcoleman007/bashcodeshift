# BashCodeshift Development Plan

## Overview

This document outlines the development plan for creating a bash codemod tool similar to jscodeshift. The tool will allow you to write JavaScript-based transforms to automatically update bash scripts across multiple repositories.

## Current Status

✅ **Phase 1 Complete**: Core Infrastructure
- Basic project structure created
- Package.json with dependencies
- Core parser using tree-sitter-bash
- Transformer with jscodeshift-like API
- CLI runner with file processing
- Utility functions for common operations
- Example transforms created
- Test framework implemented

## Implementation Phases

### Phase 1: Core Infrastructure ✅
**Duration**: 1-2 weeks
**Status**: Complete

- [x] Set up project structure
- [x] Implement basic bash parser using tree-sitter-bash
- [x] Create AST manipulation utilities
- [x] Build CLI interface
- [x] Add basic error handling
- [x] Create example transforms
- [x] Implement testing framework

### Phase 2: Enhanced Parser & AST (Next)
**Duration**: 1-2 weeks
**Priority**: High

- [ ] Improve tree-sitter AST to jscodeshift AST conversion
- [ ] Add support for more bash constructs:
  - [ ] Subshells `$(command)`
  - [ ] Command substitution `` `command` ``
  - [ ] Here documents `<<EOF`
  - [ ] Process substitution `<()`
  - [ ] Arithmetic expansion `$((expression))`
  - [ ] Parameter expansion `${var}`
- [ ] Handle complex bash syntax:
  - [ ] Arrays
  - [ ] Associative arrays
  - [ ] Functions with parameters
  - [ ] Case statements
  - [ ] Select statements
- [ ] Preserve comments and formatting
- [ ] Add source location tracking

### Phase 3: Advanced Transformation Engine
**Duration**: 2-3 weeks
**Priority**: High

- [ ] Implement proper AST traversal
- [ ] Add node transformation capabilities:
  - [ ] Node replacement
  - [ ] Node insertion (before/after)
  - [ ] Node removal
  - [ ] Node wrapping
- [ ] Create source code generation from AST
- [ ] Add support for:
  - [ ] Multi-line commands
  - [ ] Heredocs
  - [ ] Complex conditionals
  - [ ] Nested structures
- [ ] Implement source map support
- [ ] Add transformation validation

### Phase 4: Enhanced API & Utilities
**Duration**: 1-2 weeks
**Priority**: Medium

- [ ] Expand jscodeshift-like API:
  - [ ] Collection methods (filter, map, forEach)
  - [ ] Node constructors for all bash types
  - [ ] Path manipulation utilities
- [ ] Add utility functions:
  - [ ] Command validation
  - [ ] Argument parsing
  - [ ] Variable analysis
  - [ ] Dependency detection
- [ ] Create helper functions for common patterns
- [ ] Add transformation templates

### Phase 5: CLI & User Experience
**Duration**: 1 week
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
**Duration**: 1-2 weeks
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
**Solution**: Use tree-sitter-bash for robust parsing, with fallback to regex for edge cases.

### 2. AST to Source Code Generation
**Challenge**: Reconstructing bash code from AST while preserving formatting.
**Solution**: Implement a sophisticated code generator that maintains original formatting where possible.

### 3. Command Context Understanding
**Challenge**: Understanding the context of commands (e.g., whether a git command is in a CI environment).
**Solution**: Add context analysis capabilities and multi-file awareness.

### 4. Transformation Safety
**Challenge**: Ensuring transformations don't break existing scripts.
**Solution**: Add validation, dry-run mode, and comprehensive testing.

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

1. **Immediate**: Test the current implementation with real bash scripts
2. **Short-term**: Improve the parser to handle more bash constructs
3. **Medium-term**: Add more example transforms and documentation
4. **Long-term**: Build a community around the tool

## Resources

- [jscodeshift Documentation](https://github.com/facebook/jscodeshift)
- [tree-sitter-bash](https://github.com/tree-sitter/tree-sitter-bash)
- [Bash Reference Manual](https://www.gnu.org/software/bash/manual/)
- [Shell Scripting Best Practices](https://google.github.io/styleguide/shellguide.html)