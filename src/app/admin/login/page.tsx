import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/admin-guard";
import { NEXT_PARAM, sanitizeAdminNext } from "@/lib/admin-nav";

export const metadata: Metadata = { title: "관리자 로그인 · team_싹싹기름" };

/**
 * 관리자 로그인 `/admin/login`.
 *
 * `(console)` 그룹 **밖**에 있습니다. 안에 두면 콘솔 레이아웃의 인증 가드에 걸려
 * 로그인 화면이 자기 자신으로 무한히 리다이렉트됩니다.
 * proxy 쪽 예외도 같은 이유로 `PUBLIC_ADMIN_PATHS` 에 함께 들어 있습니다.
 *
 * `?next=` 는 클라이언트 훅(`useSearchParams`)이 아니라 **서버에서** 읽습니다.
 * Suspense 경계가 필요 없어지고, 무엇보다 **open redirect 검사를 서버에서 끝낼 수** 있습니다.
 */
export default async function AdminLoginPage(props: PageProps<"/admin/login">) {
  const params = await props.searchParams;
  const raw = params[NEXT_PARAM];
  const next = sanitizeAdminNext(Array.isArray(raw) ? raw[0] : raw);

  // 이미 로그인한 사람이 주소창으로 들어온 경우. 로그인 화면을 다시 보여줄 이유가 없습니다.
  if (await isAdminAuthenticated()) redirect(next);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-6">
      <main className="w-full max-w-[360px]">
        <div className="mb-[22px] flex items-center gap-[10px]">
          <div className="bg-green-600 flex h-8 w-8 items-center justify-center rounded-[9px] text-[15px] font-black text-white">
            싹
          </div>
          <div className="flex flex-col gap-[2px]">
            <span className="text-ink text-[13px] font-extrabold tracking-[-.01em]">싹싹기름</span>
            <span className="text-green-600 text-[9.5px] font-extrabold tracking-[.14em]">
              ADMIN
            </span>
          </div>
        </div>

        <div className="border-line rounded-[14px] border bg-white p-6">
          <h1 className="text-ink m-0 text-[19px] font-extrabold tracking-[-.025em]">
            관리자 로그인
          </h1>
          <p className="text-muted-3 mt-[6px] mb-[18px] text-[12px] leading-[1.6] font-medium">
            운영자 전용 화면입니다. 비밀번호는 현장 담당자에게 확인하세요.
          </p>

          <AdminLoginForm next={next} />
        </div>
      </main>
    </div>
  );
}
