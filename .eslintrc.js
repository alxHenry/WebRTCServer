module.exports = {
  extends: ['airbnb-base', 'prettier'],
  rules: {
    'no-console': 0
  },
  globals: {
    navigator: false,
    window: false,
    document: false
  }
};
