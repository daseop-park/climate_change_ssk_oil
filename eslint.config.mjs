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

    // 디자인 핸드오프는 **읽기 전용 원본**입니다. `support.js` 는 HTML 목업을 브라우저에서
    // 열기 위한 프로토타입 런타임이고, 저자가 "이식 대상 아님" 이라고 명시했습니다.
    // `src/` 밖이라 번들에도 들어가지 않는데, 검사하면 고칠 수 없는 에러 4건이
    // 매번 출력을 채워 정작 우리 코드의 경고를 묻어 버립니다.
    "admin_handoff/**",
    "design_handoff_ssakssak/**",
  ]),
]);

export default eslintConfig;
