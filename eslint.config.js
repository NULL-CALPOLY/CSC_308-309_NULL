import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/',
      'coverage/',
      'dist/',
      '.next/',
      'build/',
      'frontend/node_modules/',
    ],
  },
  // Backend & General JS files
  {
    files: ['backend/**/*.js', 'tests/**/*.js', 'tests/**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^React$',
        },
      ],
      'no-console': 'off' /*['warn', { allow: ['warn', 'error'] }]*/,
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },
  // Jest test files
  {
    files: ['tests/**/*.js', 'tests/**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^React$',
        },
      ],
    },
  },
  // Frontend React files
  {
    files: ['frontend/src/**/*.jsx', 'frontend/src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        React: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^React$',
        },
      ],
      'prefer-const': 'warn',
      'no-var': 'error',
    },
  },
  // Mock files
  {
    files: ['tests/__mocks__/**/*'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.node,
        jest: 'readonly',
        React: 'readonly',
      },
    },
  },
  // Prettier formatting rules for all files
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettier.rules,
      'prettier/prettier': 'warn',
    },
  },
];
