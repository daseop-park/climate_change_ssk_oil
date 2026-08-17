/**
 * 관리자 비밀번호 해시 생성기. 출력값을 .env 의 ADMIN_PASSWORD_HASH 에 붙여 넣으세요.
 *
 *   npm run admin:hash -- "실제비밀번호"
 *
 * 비밀번호 원문은 어디에도 저장되지 않습니다.
 */
import { hashPassword } from "../src/lib/admin-auth";

const password = process.argv[2];

if (!password) {
  console.error('사용법: npm run admin:hash -- "<비밀번호>"');
  process.exit(1);
}

if (password.length < 10) {
  console.error("비밀번호는 10자 이상으로 정해주세요.");
  process.exit(1);
}

console.log("\n.env 에 아래 줄을 추가하세요:\n");
console.log(`ADMIN_PASSWORD_HASH="${hashPassword(password)}"\n`);
console.log("⚠️ 셸 히스토리에 비밀번호가 남습니다. 실행 후 히스토리를 정리하세요.\n");
