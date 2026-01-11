import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Repo tooling / generated outputs (not shipped to users)
    "scripts/**",
    "playwright-report/**",
    "test-results/**",
    "build-output*.txt",
  ]),

  // Keep lint actionable: avoid blocking on advisory/experimental rules.
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/prefer-as-const': 'off',

      'react/no-unescaped-entities': 'off',

      // These are helpful hints, but too strict for this repo today.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/static-components': 'off',
    },
  },
]);

export default eslintConfig;
