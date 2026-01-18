import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./convex/tsconfig.json"],
      },
    },
    rules: {
      // Allow unused vars starting with underscore
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      // Warn on explicit any
      "@typescript-eslint/no-explicit-any": "warn",
      // Ensure consistent return types
      "@typescript-eslint/explicit-function-return-type": "off",
      // Allow async functions without await (common in Convex)
      "@typescript-eslint/require-await": "off",
      // Allow non-null assertions sparingly
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "convex/_generated/**",
      "*.js",
      "templates/**",
      "vitest.config.ts",
    ],
  }
);
