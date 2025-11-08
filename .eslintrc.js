module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential', // Vue 3 essential rules
    'eslint:recommended', // ESLint recommended rules
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier
    'plugin:vuetify/base', // Vuetify linting rules (adjust for your version)
  ],
  plugins: ['vue', 'prettier', 'vuetify'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'no-trailing-spaces': ['error'],
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: false,
        trailingComma: 'none',
        endOfLine: 'lf',
        arrowParens: 'avoid',
      },
    ],
  },
  settings: {
    'vue/setup-compiler-macros': true,
  },
}
