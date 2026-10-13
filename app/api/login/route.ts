import { checkPassword, clearFails, endSession, lockedFor, passwordConfigured, recordFail, startSession } from "@/lib/server/auth";

const ipOf = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

/* 登入 */
export async function POST(req: Request) {
  if (!passwordConfigured()) return Response.json({ error: "伺服器尚未設定 ADMIN_PASSWORD，請在 .env.local 設定" }, { status: 500 });
  const ip = ipOf(req);
  const wait = lockedFor(ip);
  if (wait) return Response.json({ error: `密碼錯太多次，請 ${wait} 秒後再試` }, { status: 429 });
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!checkPassword(String(password ?? ""))) {
    recordFail(ip);
    return Response.json({ error: "密碼錯誤" }, { status: 401 });
  }
  clearFails(ip);
  await startSession();
  return Response.json({ ok: true });
}

/* 登出 */
export async function DELETE() {
  await endSession();
  return Response.json({ ok: true });
}
