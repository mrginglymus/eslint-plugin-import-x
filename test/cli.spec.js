/**
 * tests that require fully booting up ESLint
 */
import path from 'path'

import { CLIEngine, ESLint } from 'eslint'
import eslintPkg from 'eslint/package.json'
import semver from 'semver'
import importPlugin from '../src/index'

describe('CLI regression tests', () => {
  describe('issue #210', () => {
    let eslint
    let cli
    beforeAll(() => {
      if (ESLint) {
        eslint = new ESLint({
          useEslintrc: false,
          overrideConfigFile: './test/fixtures/issue210.config.js',
          rulePaths: ['./src/rules'],
          overrideConfig: {
            rules: {
              named: 2,
            },
          },
          plugins: { 'eslint-plugin-import-x': importPlugin },
        })
      } else {
        cli = new CLIEngine({
          useEslintrc: false,
          configFile: './test/fixtures/issue210.config.js',
          rulePaths: ['./src/rules'],
          rules: {
            named: 2,
          },
        })
        cli.addPlugin('eslint-plugin-import-x', importPlugin)
      }
    })

    it("doesn't throw an error on gratuitous, erroneous self-reference", () => {
      if (eslint) {
        return eslint
          .lintFiles(['./test/fixtures/issue210.js'])
          .catch(() => expect.fail())
      } else {
        expect(() =>
          cli.executeOnFiles(['./test/fixtures/issue210.js']),
        ).not.toThrow()
      }
    })
  })

  describe('issue #1645', () => {
    let eslint
    let cli
    beforeEach(() => {
      if (semver.satisfies(eslintPkg.version, '< 6')) {
        this.skip()
      } else {
        if (ESLint) {
          eslint = new ESLint({
            useEslintrc: false,
            overrideConfigFile:
              './test/fixtures/just-json-files/.eslintrc.json',
            rulePaths: ['./src/rules'],
            ignore: false,
            plugins: {
              'eslint-plugin-import-x': importPlugin,
            },
          })
        } else {
          cli = new CLIEngine({
            useEslintrc: false,
            configFile: './test/fixtures/just-json-files/.eslintrc.json',
            rulePaths: ['./src/rules'],
            ignore: false,
          })
          cli.addPlugin('eslint-plugin-import-x', importPlugin)
        }
      }
    })

    it('throws an error on invalid JSON', () => {
      const invalidJSON = './test/fixtures/just-json-files/invalid.json'
      if (eslint) {
        return eslint.lintFiles([invalidJSON]).then(results => {
          expect(results).toEqual([
            {
              filePath: path.resolve(invalidJSON),
              messages: [
                {
                  column: 2,
                  endColumn: 3,
                  endLine: 1,
                  line: 1,
                  message: 'Expected a JSON object, array or literal.',
                  nodeType: results[0].messages[0].nodeType, // we don't care about this one
                  ruleId: 'json/*',
                  severity: 2,
                  source: results[0].messages[0].source, // NewLine-characters might differ depending on git-settings
                },
              ],
              errorCount: 1,
              ...(semver.satisfies(eslintPkg.version, '>= 7.32 || ^8.0.0') && {
                fatalErrorCount: 0,
              }),
              warningCount: 0,
              fixableErrorCount: 0,
              fixableWarningCount: 0,
              source: results[0].source, // NewLine-characters might differ depending on git-settings
              ...(semver.satisfies(eslintPkg.version, '>= 8.8') && {
                suppressedMessages: [],
              }),
              usedDeprecatedRules: results[0].usedDeprecatedRules, // we don't care about this one
            },
          ])
        })
      } else {
        const results = cli.executeOnFiles([invalidJSON])
        expect(results).toEqual({
          results: [
            {
              filePath: path.resolve(invalidJSON),
              messages: [
                {
                  column: 2,
                  endColumn: 3,
                  endLine: 1,
                  line: 1,
                  message: 'Expected a JSON object, array or literal.',
                  nodeType: results.results[0].messages[0].nodeType, // we don't care about this one
                  ruleId: 'json/*',
                  severity: 2,
                  source: results.results[0].messages[0].source, // NewLine-characters might differ depending on git-settings
                },
              ],
              errorCount: 1,
              warningCount: 0,
              fixableErrorCount: 0,
              fixableWarningCount: 0,
              source: results.results[0].source, // NewLine-characters might differ depending on git-settings
            },
          ],
          errorCount: 1,
          warningCount: 0,
          fixableErrorCount: 0,
          fixableWarningCount: 0,
          usedDeprecatedRules: results.usedDeprecatedRules, // we don't care about this one
        })
      }
    })
  })
})
