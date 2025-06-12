export default {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // Enables plugin + disables conflicting ESLint rules
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error', // Show prettier issues as ESLint errors
  },
};
