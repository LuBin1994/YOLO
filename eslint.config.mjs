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
    // 工作区内的素材加工 / 版式验证脚本（CommonJS，仅供本地一次性使用），
    // 不是应用代码，不要参与 lint —— 否则 `npm run lint` 会被这堆 require 淹没。
    ".workbuddy/**",
  ]),
]);

export default eslintConfig;
