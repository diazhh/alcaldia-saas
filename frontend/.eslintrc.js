module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'react/prop-types': 'warn',
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
