"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Library, OpResult } from "@/lib/types";
import BookDialog, { type BookDraft } from "./BookDialog";
import Login from "./Login";
import PlacesTab from "./PlacesTab";
import ReviewsTab from "./ReviewsTab";
import ShelfTab from "./ShelfTab";
import { Icon } from "./ui";
import WishTab from "./WishTab";

export type Op = (op: string, payload?: Record<string, unknown>) => Promise<boolean>;
export type OpenBook = (draft: BookDraft, focus?: "review") => void;

const TABS = [
  ["shelf", "我的書櫃"],
  ["reviews", "閱讀感想"],
  ["wish", "想買清單"],
  ["places", "書的位置"],
] as const;
type Tab = (typeof TABS)[number][0];

/* 外框：先確認有沒有登入；登入後顯示木牌標題、分頁籤與各分頁內容 */
export default function LibraryApp() {
  const [lib, setLib] = useState<Library | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [tab, setTab] = useState<Tab>("shelf");
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ draft: BookDraft; focus?: "review" } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2800);
  }, []);

  const load = useCallback(async () => {
    try {
      setLib(await api<Library>("/api/library"));
      setNeedLogin(false);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setNeedLogin(true);
      else toast((e as Error).message);
    }
  }, [toast]);

  useEffect(() => {
    // 第一次打開頁面時向伺服器讀取資料；setState 發生在 await 之後，不會連鎖重繪
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  /* 送出一個修改，成功就換成伺服器回傳的最新資料 */
  const op = useCallback<Op>(
    async (name, payload = {}) => {
      try {
        const r = await api<OpResult>("/api/library", { method: "POST", body: { op: name, ...payload } });
        setLib(r.library);
        if (r.msg) toast(r.msg);
        return true;
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) setNeedLogin(true);
        toast((e as Error).message);
        return false;
      }
    },
    [toast],
  );

  const openBook = useCallback<OpenBook>((draft, focus) => setEditing({ draft, focus }), []);

  const logout = async () => {
    await api("/api/login", { method: "DELETE" }).catch(() => {});
    setLib(null);
    setNeedLogin(true);
  };

  const rename = () => {
    const name = prompt("圖書館的名稱", lib?.name ?? "");
    if (name && name.trim() !== lib?.name) op("rename", { name });
  };

  if (needLogin) return <Login onDone={load} />;
  if (!lib) return <p className="py-20 text-center font-elite tracking-widest text-on-wood-muted">Opening the library…</p>;

  const counts: Record<Tab, number> = {
    shelf: lib.books.length,
    reviews: lib.books.filter((b) => b.review || b.rating).length,
    wish: lib.wishes.length,
    places: lib.places.length,
  };
  const locations = lib.places;

  return (
    <>
      <header className="mx-auto max-w-[1120px] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="grid size-[46px] flex-none place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#f0d49a,var(--color-brass)_60%,#7a5527)] text-wood-900 shadow-[0_2px_0_rgba(0,0,0,.4),inset_0_0_0_3px_rgba(60,40,15,.35)]">
              <Icon name="book" size={22} />
            </span>
            <button onClick={rename} title="點一下修改名稱" className="min-w-0 cursor-text text-left">
              <h1 className="font-zh text-[clamp(22px,4.5vw,30px)] leading-tight font-black tracking-[.12em] text-on-wood [text-shadow:0_2px_0_rgba(0,0,0,.45)]">{lib.name}</h1>
              <span className="block font-elite text-[13px] tracking-[.18em] text-brass-soft uppercase">Ex Libris · My Reading Room</span>
            </button>
          </div>
          <button className="btn btn-wood btn-sm" onClick={logout}>
            <Icon name="logout" size={16} /> 登出
          </button>
        </div>

        <nav role="tablist" aria-label="圖書館分頁" className="no-scrollbar mt-5 flex gap-1 overflow-x-auto pt-1">
          {TABS.map(([k, l]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => {
                setTab(k);
                window.scrollTo({ top: 0 });
              }}
              className={`flex-none rounded-t-md px-[18px] pt-2 pb-2.5 font-zh text-[15px] font-semibold tracking-[.06em] transition ${
                tab === k ? "grain translate-y-px bg-paper text-ink" : "bg-on-wood/10 text-on-wood-muted hover:bg-on-wood/15 hover:text-on-wood"
              }`}
            >
              {l}
              <span className="ml-1.5 font-type text-xs opacity-70">{counts[k]}</span>
            </button>
          ))}
        </nav>
      </header>

      <main className="paper mx-auto max-w-[1120px] rounded-tl-none p-[clamp(16px,3vw,32px)]">
        {tab === "shelf" && <ShelfTab lib={lib} op={op} openBook={openBook} />}
        {tab === "reviews" && <ReviewsTab lib={lib} openBook={openBook} />}
        {tab === "wish" && <WishTab lib={lib} op={op} locations={locations} />}
        {tab === "places" && <PlacesTab lib={lib} op={op} openBook={openBook} />}
      </main>

      <p className="mt-6 text-center font-elite text-[13px] tracking-widest text-on-wood-muted">Good things take time…</p>

      <BookDialog editing={editing} onClose={() => setEditing(null)} op={op} locations={locations} />

      {msg && (
        <div role="status" className="grain fixed bottom-[calc(20px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 max-w-[calc(100vw-32px)] -translate-x-1/2 -rotate-1 animate-drop rounded-[2px] bg-paper px-[18px] py-2.5 font-zh text-sm font-semibold text-ink shadow-[0_10px_24px_rgba(0,0,0,.5)]">
          {msg}
        </div>
      )}
    </>
  );
}
