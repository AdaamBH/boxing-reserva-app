import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // No 'any' sin justificar (ver CODE_STYLE.md) — se usa 'unknown' + Zod.
      '@typescript-eslint/no-explicit-any': 'error',
      // @ts-ignore prohibido sin comentario justificando el motivo (CODE_STYLE.md);
      // @ts-expect-error sigue permitido porque falla si deja de hacer falta.
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': 'allow-with-description',
          'ts-expect-error': 'allow-with-description',
        },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  // Prettier siempre al final: desactiva reglas de ESLint que compitan
  // con el formateo (comillas, punto y coma...) para que nunca se discutan
  // manualmente en una revisión (ver CODE_STYLE.md).
  eslintConfigPrettier,
);
