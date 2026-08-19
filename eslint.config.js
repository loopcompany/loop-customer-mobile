const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

/**
 * Flat ESLint config.
 *
 * Rules are deliberately split into two tiers:
 *   - errors  — things that are bugs or that break a convention this repo
 *               already relies on (see CLAUDE.md).
 *   - warnings — quality signals that are widespread in the existing code and
 *               would drown the error output if promoted today. They are meant
 *               to trend to zero, not to be silenced.
 *
 * Run `npm run lint` to check, `npm run lint:fix` to auto-fix.
 */
module.exports = defineConfig([
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'web-build/**',
      '.expo/**',
      'graphify-out/**',
      'public/**',
      'web/**',
      'assets/**',
    ],
  },

  expo,
  prettier,

  {
    files: ['**/*.{js,jsx}'],

    // Teach eslint-plugin-import about the `@alias` table in babel.config.js,
    // so `import/no-unresolved` verifies aliased paths instead of failing on
    // all of them.
    settings: {
      'import/resolver': {
        'babel-module': {},
      },
    },

    rules: {
      /* --- correctness --- */
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      eqeqeq: ['warn', 'smart'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      /* --- repo conventions (CLAUDE.md) --- */
      // `Alert.alert` does not work on web. Use showAlert/showToastOrAlert
      // from helpers/Common.js instead.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '../styles/Styles',
              message: 'styles/Styles.js is removed. Use @styles/NewStyles or theme/* tokens.',
            },
          ],
          patterns: [
            {
              group: ['**/../components/*', '**/../screens/*', '**/../theme/*', '**/../services/*'],
              message:
                'Use the @alias import (e.g. @components/Button) instead of a relative path.',
            },
          ],
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Alert',
          property: 'alert',
          message:
            'Alert.alert() is a no-op on web. Use showAlert()/showToastOrAlert() from @helpers/Common.',
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'history',
          message:
            "React Navigation's linking config owns browser history. Use navigation.goBack()/navigate().",
        },
      ],

      /* --- real defects, always errors --- */
      'no-dupe-keys': 'error',
      'no-undef': 'error',
      'no-var': 'error',

      /* --- quality (legacy debt; warnings so the error gate stays meaningful) --- */
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'import/no-duplicates': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/use-memo': 'warn',
      'react/display-name': 'warn',
    },
  },

  {
    // Config and build files run in Node and legitimately log.
    files: ['*.config.js', 'scripts/**/*.js'],
    rules: { 'no-console': 'off', 'no-restricted-imports': 'off' },
  },
]);
