import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";
import unicorn from "eslint-plugin-unicorn";

export default defineConfig(
  js.configs.recommended,
  unicorn.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.greasemonkey,
      },
    },
    rules: {
      eqeqeq: "error",
      "no-shadow": "error",
      "no-param-reassign": "error",
    },
  },

  prettier,
);
