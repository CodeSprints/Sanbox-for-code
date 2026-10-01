import js from "@eslint/js";
import prettier from "@vue/eslint-config-prettier";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import vue from "eslint-plugin-vue";
import vueAccessibility from "eslint-plugin-vuejs-accessibility";

export default defineConfigWithVueTs(
  {
    name: "app/ignores",
    ignores: ["dist/**", "coverage/**", "src-tauri/target/**", "src-tauri/gen/**"],
  },
  js.configs.recommended,
  vue.configs["flat/recommended"],
  vueAccessibility.configs["flat/recommended"],
  vueTsConfigs.recommended,
  prettier,
  {
    name: "app/rules",
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/attribute-hyphenation": ["error", "always", { ignore: ["ariaLabelText"] }],
      "vuejs-accessibility/label-has-for": ["error", { required: { some: ["nesting", "id"] } }],
      "vue/component-api-style": ["error", ["script-setup"]],
      "vue/define-macros-order": ["error", { order: ["defineProps", "defineEmits"] }],
      "vue/block-order": ["error", { order: ["script", "template", "style"] }],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      eqeqeq: ["error", "always"],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    name: "app/tests",
    files: ["tests/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
);
