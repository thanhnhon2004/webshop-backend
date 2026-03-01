module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'script'
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:n/recommended',
    'plugin:promise/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['import', 'n', 'promise', 'prettier'],
  rules: {
    'prettier/prettier': 'warn',
    'no-console': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always'
      }
    ],
    'n/no-missing-import': 'off',
    'n/no-unsupported-features/es-syntax': 'off'
  },
  overrides: [
    {
      files: ['**/tests/**/*.js', '**/*.test.js'],
      env: { jest: true }
    }
  ]
};
