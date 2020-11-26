module.exports = {
  parser: 'babel-eslint',
  extends: ['standard', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': ['error'],
    'space-before-function-paren': 0,
  },
  globals: {
    // for Jest
    test: false,
    jest: false,
    expect: false,
    describe: false,
    it: false,
    cancelAnimationFrame: false,
    requestAnimationFrame: false,
    fetch: false,
    afterEach: false,
    beforeEach: false,
  },
  parserOptions: {
    ecmaFeatures: {
      legacyDecorators: true,
    },
  },
}
