import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import { Transformer } from './transformer';
import { RunnerOptions, RunnerStats, TransformFunction } from '../types';

/**
 * CLI Runner for bashcodeshift
 */
export class Runner {
  private transformer: Transformer;
  private stats: RunnerStats;

  constructor() {
    this.transformer = new Transformer();
    this.stats = { processed: 0, changed: 0, errors: 0 };
  }

  /**
   * Run transform on files
   * @param transformPath - Path to transform file
   * @param filePaths - Files or patterns to transform
   * @param options - Runner options
   * @returns Statistics
   */
  async run(transformPath: string, filePaths: string | string[], options: RunnerOptions = {}): Promise<RunnerStats> {
    try {
      // Load transform function
      const transformFn = this.loadTransform(transformPath);

      // Resolve file paths
      const resolvedPaths = await this.resolvePaths(filePaths, options);

      if (resolvedPaths.length === 0) {
        console.log(chalk.yellow('No files found matching the specified patterns.'));
        return this.stats;
      }

      // Process each file
      for (const filePath of resolvedPaths) {
        await this.processFile(filePath, transformFn, options);
      }

      // Print summary
      this.printSummary();

      return this.stats;
    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      this.stats.errors++;
      return this.stats;
    }
  }

  /**
   * Load transform function from file
   * @param transformPath - Path to transform file
   * @returns Transform function
   */
  private loadTransform(transformPath: string): TransformFunction {
    try {
      const transformModule = require(path.resolve(transformPath));

      // Handle different export formats
      if (typeof transformModule === 'function') {
        return transformModule;
      } else if (transformModule.default && typeof transformModule.default === 'function') {
        return transformModule.default;
      } else if (transformModule.transform && typeof transformModule.transform === 'function') {
        return transformModule.transform;
      } else {
        throw new Error('Transform file must export a function as default or named export');
      }
    } catch (error) {
      throw new Error(`Failed to load transform: ${(error as Error).message}`);
    }
  }

  /**
   * Resolve file paths using glob patterns
   * @param filePaths - File paths or patterns
   * @param options - Runner options
   * @returns Resolved file paths
   */
  private async resolvePaths(filePaths: string | string[], options: RunnerOptions): Promise<string[]> {
    const patterns = Array.isArray(filePaths) ? filePaths : [filePaths];
    const resolvedPaths: string[] = [];

    for (const pattern of patterns) {
      try {
        const files = await this.glob(pattern, options);
        resolvedPaths.push(...files);
      } catch (error) {
        console.warn(chalk.yellow(`Warning: Failed to resolve pattern "${pattern}": ${(error as Error).message}`));
      }
    }

    return [...new Set(resolvedPaths)]; // Remove duplicates
  }

  /**
   * Use glob to find files
   * @param pattern - Glob pattern
   * @param options - Runner options
   * @returns Promise of file paths
   */
  private async glob(pattern: string, options: RunnerOptions): Promise<string[]> {
    const globOptions = {
      nodir: true,
      ignore: options.ignorePattern ? [options.ignorePattern] : [],
      ...options
    };

    try {
      return await glob(pattern, globOptions);
    } catch (error) {
      throw new Error(`Glob pattern error: ${(error as Error).message}`);
    }
  }

  /**
   * Process a single file
   * @param filePath - File path
   * @param transformFn - Transform function
   * @param options - Runner options
   */
  private async processFile(filePath: string, transformFn: TransformFunction, options: RunnerOptions): Promise<void> {
    try {
      this.stats.processed++;

      // Read file
      const source = await fs.readFile(filePath, 'utf8');
      const fileInfo = {
        path: filePath,
        source,
        name: path.basename(filePath)
      };

      // Create API
      const api = {
        b: (source: string) => this.transformer.b(source),
        stats: this.stats,
        report: (msg: string) => console.log(chalk.blue(msg))
      };

      // Apply transform
      const result = await transformFn(fileInfo, api, options);

      // Check if file was changed
      if (result !== source) {
        this.stats.changed++;

        if (options.dry) {
          console.log(chalk.yellow(`[DRY RUN] Would modify: ${filePath}`));
        } else {
          // Write changes
          await fs.writeFile(filePath, result, 'utf8');
          console.log(chalk.green(`Modified: ${filePath}`));
        }

        if (options.print) {
          console.log(chalk.cyan('--- Original ---'));
          console.log(source);
          console.log(chalk.cyan('--- Modified ---'));
          console.log(result);
          console.log(chalk.cyan('--- End ---'));
        }
      } else if (options.verbose) {
        console.log(chalk.gray(`No changes: ${filePath}`));
      }
    } catch (error) {
      console.error(chalk.red(`Error processing ${filePath}:`), (error as Error).message);
      this.stats.errors++;
    }
  }

  /**
   * Print summary statistics
   */
  private printSummary(): void {
    console.log('\n' + chalk.bold('Summary:'));
    console.log(`  Processed: ${this.stats.processed} files`);
    console.log(`  Changed: ${this.stats.changed} files`);
    console.log(`  Errors: ${this.stats.errors} files`);
  }
}