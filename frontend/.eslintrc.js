module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/no-redeclare': 'warn'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  }
};
