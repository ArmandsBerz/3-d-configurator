module.exports = {
  // Define the environments your code will run in
  env: {
    browser: true,
    es2021: true,
  },
  // Inherit recommended rule sets. The order is important.
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:tailwindcss/recommended',
    // This MUST be the last item to override other configs and avoid conflicts
    'prettier',
  ],
  // Configure the JavaScript parser
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  // Specify plugins to use
  plugins: ['react'],
  // Define custom rules (you can add more later)
  rules: {
    'react/react-in-jsx-scope': 'off', // Not needed with the modern JSX transform
  },
  // Settings to be shared across all plugins
  settings: {
    react: {
      // Automatically detect the React version to use
      version: 'detect',
    },
  },
};