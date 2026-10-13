/* 前端呼叫後端 API 的小工具 */
export class ApiError extends Error {
  constructor(
    msg: string,
    public status: number,
  ) {
    super(msg);
  }
}

export async function api<T>(url: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const b = init?.body;
  const res = await fetch(url, {
    method: init?.method ?? "GET",
    headers: b !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: b === undefined ? undefined : JSON.stringify(b),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "連線失敗，請稍後再試", res.status);
  return data as T;
}
