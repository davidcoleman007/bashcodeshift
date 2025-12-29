const fs = require('fs-extra');
const path = require('path');
const Runner = require('./core/runner');

/**
 * Test utilities for bashcodeshift transforms
 */

/**
 * Define a test for a transform using fixtures
 * @param {string} dirname - __dirname from test file
 * @param {string} transformName - Name of transform
 * @param {Object} options - Transform options
 * @param {string} fixtureName - Name of fixture (optional)
 */
function defineTest(dirname, transformName, options = {}, fixtureName = null) {
  const transformPath = path.join(dirname, '..', `${transformName}.js`);
  const fixturesDir = path.join(dirname, '..', '__testfixtures__');

  if (fixtureName) {
    // Test specific fixture
    const inputPath = path.join(fixturesDir, `${fixtureName}.input.sh`);
    const outputPath = path.join(fixturesDir, `${fixtureName}.output.sh`);

    test(`${transformName} - ${fixtureName}`, async () => {
      await runFixtureTest(transformPath, inputPath, outputPath, options);
    });
  } else {
    // Test all fixtures
    const fixtures = getFixtures(fixturesDir, transformName);

    fixtures.forEach(fixture => {
      test(`${transformName} - ${fixture}`, async () => {
        const inputPath = path.join(fixturesDir, `${fixture}.input.sh`);
        const outputPath = path.join(fixturesDir, `${fixture}.output.sh`);
        await runFixtureTest(transformPath, inputPath, outputPath, options);
      });
    });
  }
}

/**
 * Define an inline test for a transform
 * @param {Function} transform - Transform function
 * @param {Object} options - Transform options
 * @param {string} input - Input bash code
 * @param {string} expectedOutput - Expected output
 * @param {string} testName - Test name (optional)
 */
function defineInlineTest(transform, options, input, expectedOutput, testName = 'inline test') {
  test(testName, async () => {
    const result = await runInlineTest(transform, options, input);
    expect(result.trim()).toBe(expectedOutput.trim());
  });
}

/**
 * Define a snapshot test for a transform
 * @param {Function} transform - Transform function
 * @param {Object} options - Transform options
 * @param {string} input - Input bash code
 * @param {string} testName - Test name (optional)
 */
function defineSnapshotTest(transform, options, input, testName = 'snapshot test') {
  test(testName, async () => {
    const result = await runInlineTest(transform, options, input);
    expect(result.trim()).toMatchSnapshot();
  });
}

/**
 * Apply transform to input and return result
 * @param {Function} transform - Transform function
 * @param {Object} options - Transform options
 * @param {string} input - Input bash code
 * @returns {Promise<string>} Transformed code
 */
async function applyTransform(transform, options, input) {
  const fileInfo = {
    source: input,
    path: 'test.sh'
  };

  const api = {
    j: (source) => {
      const Transformer = require('./core/transformer');
      return new Transformer().j(source);
    },
    stats: { processed: 0, changed: 0, errors: 0 },
    report: (message) => console.log(message)
  };

  const result = transform(fileInfo, api, options);

  if (typeof result === 'string') {
    return result;
  } else if (result && typeof result.then === 'function') {
    return await result;
  } else {
    throw new Error('Transform must return a string or Promise<string>');
  }
}

/**
 * Run a fixture test
 * @param {string} transformPath - Path to transform
 * @param {string} inputPath - Path to input file
 * @param {string} outputPath - Path to expected output file
 * @param {Object} options - Transform options
 */
async function runFixtureTest(transformPath, inputPath, outputPath, options) {
  // Check if files exist
  if (!await fs.pathExists(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`);
  }

  if (!await fs.pathExists(outputPath)) {
    throw new Error(`Output file not found: ${outputPath}`);
  }

  // Read files
  const input = await fs.readFile(inputPath, 'utf8');
  const expectedOutput = await fs.readFile(outputPath, 'utf8');

  // Run transform
  const result = await runInlineTest(require(transformPath), options, input);

  // Compare results
  expect(result.trim()).toBe(expectedOutput.trim());
}

/**
 * Run an inline test
 * @param {Function} transform - Transform function
 * @param {Object} options - Transform options
 * @param {string} input - Input bash code
 * @returns {Promise<string>} Transformed code
 */
async function runInlineTest(transform, options, input) {
  return await applyTransform(transform, options, input);
}

/**
 * Get fixture names for a transform
 * @param {string} fixturesDir - Fixtures directory
 * @param {string} transformName - Transform name
 * @returns {Array} Fixture names
 */
function getFixtures(fixturesDir, transformName) {
  if (!fs.existsSync(fixturesDir)) {
    return [];
  }

  const files = fs.readdirSync(fixturesDir);
  const fixtures = new Set();

  files.forEach(file => {
    if (file.endsWith('.input.sh')) {
      const fixtureName = file.replace('.input.sh', '');
      fixtures.add(fixtureName);
    }
  });

  return Array.from(fixtures);
}

module.exports = {
  defineTest,
  defineInlineTest,
  defineSnapshotTest,
  applyTransform
};