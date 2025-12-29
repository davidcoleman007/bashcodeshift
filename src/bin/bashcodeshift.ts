#!/usr/bin/env node

/**
 * BashCodeshift CLI
 */

import { Command } from 'commander';
import { Runner } from '../core/runner';
import chalk from 'chalk';

const program = new Command();

program
  .name('bashcodeshift')
  .description('A JavaScript codemod toolkit for bash scripts')
  .version('0.1.0');

program
  .argument('<path>', 'Files or directory to transform')
  .option('-t, --transform <path>', 'Path to transform file')
  .option('--parser <parser>', 'Parser to use (default: bash)', 'bash')
  .option('--dry', 'Dry run (no changes)')
  .option('--print', 'Print output for comparison')
  .option('--verbose', 'Show more information')
  .option('--ignore-pattern <pattern>', 'Ignore files matching pattern')
  .action(async (path: string, options: any) => {
    try {
      if (!options.transform) {
        console.error(chalk.red('Error: Transform file is required. Use -t or --transform.'));
        process.exit(1);
      }

      const runner = new Runner();
      const stats = await runner.run(options.transform, path, {
        dry: options.dry,
        print: options.print,
        verbose: options.verbose,
        ignorePattern: options.ignorePattern,
        parser: options.parser
      });

      if (stats.errors > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), (error as Error).message);
      process.exit(1);
    }
  });

// Add help information
program.addHelpText('after', `

Examples:
  $ bashcodeshift -t transform.js script.sh
  $ bashcodeshift -t transform.js "**/*.sh" --dry
  $ bashcodeshift -t transform.js "**/*.sh" --print
  $ bashcodeshift -t transform.js "**/*.sh" --ignore-pattern "node_modules"

For more information, visit: https://github.com/yourusername/bashcodeshift
`);

program.parse();