import { connection } from "next/server";
import { isAdmin, unauthorized } from "@/lib/server/auth";
import { commands } from "@/lib/server/commands";
import { getLibrary, mutate, UserError } from "@/lib/server/store";
import type { OpResult } from "@/lib/types";

/* 讀取整個圖書館（需要登入） */
export async function GET() {
  await connection();
  if (!(await isAdmin())) return unauthorized();
  return Response.json(await getLibrary());
}

/* 執行一個修改（需要登入），body 格式為 { op: "addBook", ...參數 } */
export async function POST(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const { op, ...payload } = await req.json().catch(() => ({}));
  const cmd = Object.hasOwn(commands, op) ? commands[op] : undefined;
  if (!cmd) return Response.json({ error: `未知的操作：${op}` }, { status: 400 });
  try {
    const { library, result } = await mutate((L) => cmd(L, payload));
    const body: OpResult = { library, msg: result };
    return Response.json(body);
  } catch (e) {
    if (e instanceof UserError) return Response.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
