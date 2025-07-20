import js from '@eslint/js';

export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**']
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        // Browser globals (for frontend)
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        performance: 'readonly',
        // Node.js globals (for server)
        process: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
        global: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off'
    }
  }
];
