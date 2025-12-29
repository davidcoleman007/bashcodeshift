const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const Transformer = require('./transformer');

/**
 * CLI Runner for executing transforms
 */
class Runner {
  constructor() {
    this.transformer = new Transformer();
    this.stats = {
      processed: 0,
      changed: 0,
      errors: 0
    };
  }

  /**
   * Run transform on files
   * @param {string} transformPath - Path to transform file
   * @param {string|Array} filePaths - File paths to process
   * @param {Object} options - Options
   * @returns {Promise<Object>} Statistics
   */
  async run(transformPath, filePaths, options = {}) {
    try {
      // Load transform
      const transform = this.loadTransform(transformPath);

      // Resolve file paths
      const files = await this.resolveFiles(filePaths, options);

      // Process files
      for (const file of files) {
        await this.processFile(file, transform, options);
      }

      // Print summary
      this.printSummary();

      return this.stats;
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      this.stats.errors++;
      return this.stats;
    }
  }

  /**
   * Load transform function
   * @param {string} transformPath - Path to transform file
   * @returns {Function} Transform function
   */
  loadTransform(transformPath) {
    try {
      const transformModule = require(path.resolve(transformPath));

      if (typeof transformModule === 'function') {
        return transformModule;
      } else if (typeof transformModule.default === 'function') {
        return transformModule.default;
      } else {
        throw new Error('Transform must export a function');
      }
    } catch (error) {
      throw new Error(`Failed to load transform: ${error.message}`);
    }
  }

  /**
   * Resolve file paths using glob patterns
   * @param {string|Array} filePaths - File paths or glob patterns
   * @param {Object} options - Options
   * @returns {Promise<Array>} Resolved file paths
   */
  async resolveFiles(filePaths, options) {
    const files = [];
    const patterns = Array.isArray(filePaths) ? filePaths : [filePaths];

    for (const pattern of patterns) {
      const matches = await this.glob(pattern, options);
      files.push(...matches);
    }

    // Filter out ignored files
    const filteredFiles = files.filter(file => {
      if (options.ignorePattern) {
        const ignoreRegex = new RegExp(options.ignorePattern);
        return !ignoreRegex.test(file);
      }
      return true;
    });

    return [...new Set(filteredFiles)]; // Remove duplicates
  }

  /**
   * Glob pattern matching
   * @param {string} pattern - Glob pattern
   * @param {Object} options - Options
   * @returns {Promise<Array>} Matching files
   */
  glob(pattern, options) {
    return new Promise((resolve, reject) => {
      glob(pattern, {
        nodir: true,
        ignore: options.ignorePattern ? [options.ignorePattern] : [],
        ...options
      }, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  /**
   * Process a single file
   * @param {string} filePath - File path
   * @param {Function} transform - Transform function
   * @param {Object} options - Options
   */
  async processFile(filePath, transform, options) {
    try {
      // Read file
      const source = await fs.readFile(filePath, 'utf8');

      // Create file info
      const fileInfo = {
        source,
        path: filePath
      };

      // Create API
      const api = {
        j: (source) => this.transformer.j(source),
        stats: this.stats,
        report: (message) => console.log(chalk.yellow(message))
      };

      // Apply transform
      const result = transform(fileInfo, api, options);

      if (result && typeof result === 'string') {
        // Check if content changed
        if (result !== source) {
          this.stats.changed++;

          if (options.dry) {
            console.log(chalk.blue(`[DRY RUN] Would modify: ${filePath}`));
          } else if (options.print) {
            console.log(chalk.green(`\n=== ${filePath} ===`));
            console.log(result);
            console.log(chalk.green('=== END ===\n'));
          } else {
            // Write changes
            await fs.writeFile(filePath, result, 'utf8');
            console.log(chalk.green(`Modified: ${filePath}`));
          }
        } else {
          console.log(chalk.gray(`No changes: ${filePath}`));
        }
      }

      this.stats.processed++;
    } catch (error) {
      console.error(chalk.red(`Error processing ${filePath}:`), error.message);
      this.stats.errors++;
    }
  }

  /**
   * Print summary statistics
   */
  printSummary() {
    console.log('\n' + chalk.blue('=== Summary ==='));
    console.log(`Files processed: ${this.stats.processed}`);
    console.log(`Files changed: ${this.stats.changed}`);
    console.log(`Errors: ${this.stats.errors}`);

    if (this.stats.errors > 0) {
      console.log(chalk.red('Some files had errors during processing.'));
    } else if (this.stats.changed > 0) {
      console.log(chalk.green('Transform completed successfully!'));
    } else {
      console.log(chalk.yellow('No files were modified.'));
    }
  }
}

module.exports = Runner;