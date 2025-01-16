module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    '@electron-toolkit/eslint-config-ts/recommended',
    '@electron-toolkit/eslint-config-prettier',
    'triple-node',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.node.json', './tsconfig.web.json'],
    tsconfigRootDir: __dirname,
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'prettier/prettier': 'off',
    'unicorn/prefer-module': 'off',
    'unicorn/prefer-top-level-await': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    indent: 'off', // prettier handles this
    'unicorn/prefer-global-this': 'off', // it warns when we attempt to write windows.api

    /* It keeps complaining that @types/react and electron are devDependencies, but that is how the boilerplate is set up */
    'import/no-extraneous-dependencies': 'off',
    curly: 'error',
    'no-console': 'error',
  },
  overrides: [
    {
      files: 'src/renderer/src/env.d.ts',
      rules: {
        'unicorn/prevent-abbreviations': 'off',
      },
    },
  ],
};
