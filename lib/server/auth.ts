import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* 圖書館登入：密碼放在環境變數 ADMIN_PASSWORD（.env.local），
   登入成功後發一張有簽章、會過期的 cookie，之後每次呼叫 /api/library 都要檢查。 */
const COOKIE = "library_owner";
const MAX_AGE = 30 * 24 * 60 * 60; // 登入有效 30 天

const password = () => process.env.ADMIN_PASSWORD ?? "";
const sign = (exp: string) => createHmac("sha256", password()).update("library-owner:" + exp).digest("hex");

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const passwordConfigured = () => password().length > 0;
export const checkPassword = (input: string) => passwordConfigured() && same(input, password());

export async function isAdmin() {
  if (!passwordConfigured()) return false;
  const token = (await cookies()).get(COOKIE)?.value ?? "";
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, sign(exp));
}

export async function startSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/* 防止猜密碼：同一個來源連續錯 5 次，鎖 1 分鐘 */
const fails = new Map<string, { n: number; until: number }>();
export function lockedFor(ip: string) {
  const f = fails.get(ip);
  return f && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 1000) : 0;
}
export function recordFail(ip: string) {
  const f = fails.get(ip) ?? { n: 0, until: 0 };
  f.n++;
  if (f.n >= 5) {
    f.n = 0;
    f.until = Date.now() + 60_000;
  }
  fails.set(ip, f);
}
export const clearFails = (ip: string) => fails.delete(ip);

export const unauthorized = () => Response.json({ error: "請先登入圖書館" }, { status: 401 });
