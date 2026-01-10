import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";

export default defineConfig(
  // 下に行くほど優先される

  js.configs.recommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.greasemonkey,
      },
    },
    rules: {
      // -------------------------------------------------------------------------------------------
      // warnに変更
      // -------------------------------------------------------------------------------------------

      "no-empty": "warn",
      "no-unused-vars": "warn",

      // -------------------------------------------------------------------------------------------
      // 有効化
      // -------------------------------------------------------------------------------------------

      eqeqeq: "error",
      "no-shadow": ["error", { allow: ["_"] }],
      "no-implicit-coercion": "error", // 暗黙的な型強制を禁止
      "no-param-reassign": "error", // 関数パラメータへの再代入を禁止
    },
  },

  // Prettierと競合する可能性のあるルールを無効化
  prettier
);
