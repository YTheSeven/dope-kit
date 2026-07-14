import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

/**
 * ESLint 配置文件
 * 专注于 Vue 文件的 lint 验证
 * TypeScript 文件全部交给 oxlint 处理
 */
export default [
  // 全局忽略配置
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "docs/**", // 文档目录
      "*.min.js",
      "public/**",
      ".vite/**",
      "**/*.ts", // TS 文件交给 oxlint
      "**/*.tsx", // TSX 文件交给 oxlint
      "**/*.js", // JS 文件交给 oxlint
      "**/*.jsx", // JSX 文件交给 oxlint
      "**/*.mjs",
      "**/*.cjs",
      "**/*.d.ts", // 类型声明文件
    ],
  },

  // Vue 文件配置
  {
    files: ["**/*.vue"],
    plugins: {
      vue: pluginVue,
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: tsParser, // 用于解析 Vue 中的 TS 代码
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // uni-app 全局变量
        uni: "readonly",
        wx: "readonly",
        getApp: "readonly",
        getCurrentPages: "readonly",
      },
    },
    rules: {
      // Vue 核心规则 (essential)
      "vue/multi-word-component-names": "off",
      "vue/no-unused-vars": "warn",
      "vue/require-v-for-key": "error",
      "vue/no-use-v-if-with-v-for": "error",
      "vue/valid-template-root": "error",
      "vue/valid-v-for": "error",

      // 推荐的 Vue 规则
      "vue/no-unused-properties": "warn",
      "vue/block-order": [
        "warn",
        {
          order: ["script", "template", "style"],
        },
      ],
      "vue/require-default-prop": "off",
      "vue/require-prop-types": "off",
      "vue/component-name-in-template-casing": [
        "warn",
        "PascalCase",
        {
          registeredComponentsOnly: false,
        },
      ],
      "vue/no-template-shadow": "warn",
      "vue/no-mutating-props": "error",
    },
  },
];
