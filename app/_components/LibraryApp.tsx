"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Library, OpResult } from "@/lib/types";
import BookDialog, { type BookDraft } from "./BookDialog";
import Login from "./Login";
import PlacesTab from "./PlacesTab";
import ReviewsTab from "./ReviewsTab";
import ShelfTab from "./ShelfTab";
import { CornerVine, Icon } from "./ui";
import WishTab from "./WishTab";

export type Op = (op: string, payload?: Record<string, unknown>) => Promise<boolean>;
export type OpenBook = (draft: BookDraft, focus?: "review") => void;

const TABS = [
  ["shelf", "我的書櫃"],
  ["reviews", "閱讀感想"],
  ["wish", "想買清單"],
  ["places", "書的位置"],
] as const;
/* 每個分頁籤一個顏色，像參考圖的 QUEST／SKILLS 籤 */
const TAB_COLOR = { shelf: "bg-sage", reviews: "bg-lav", wish: "bg-tan", places: "bg-sky" } as const;
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
  if (!lib) return <p className="py-20 text-center font-elite text-lg font-bold tracking-widest text-cream-muted italic">Opening the library…</p>;

  const locations = lib.places;

  return (
    <>
      <header className="mx-auto max-w-[1120px] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="sketch grid size-[50px] flex-none place-items-center rounded-full bg-sage text-ink shadow-[3px_3px_0_rgba(15,20,10,.35)]">
              <Icon name="book" size={26} />
            </span>
            <button onClick={rename} title="點一下修改名稱" className="min-w-0 cursor-text text-left">
              <h1 className="font-zh text-[clamp(24px,4.8vw,32px)] leading-tight font-bold tracking-[.12em] text-cream [text-shadow:2px_2px_0_rgba(15,20,10,.5)]">{lib.name}</h1>
              <span className="block font-elite text-[13px] font-bold tracking-[.2em] text-sage-soft uppercase">Ex Libris · My Reading Room</span>
            </button>
          </div>
          <button className="btn btn-sm" onClick={logout}>
            <Icon name="logout" size={16} /> 登出
          </button>
        </div>

        <nav role="tablist" aria-label="圖書館分頁" className="no-scrollbar relative mt-5 -mb-[3px] flex items-end gap-1.5 overflow-x-auto px-3 pt-2 sm:pl-24">
          {TABS.map(([k, l]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => {
                setTab(k);
                window.scrollTo({ top: 0 });
              }}
              className={`sketch grain flex-none rounded-[14px_10px_0_0/12px_14px_0_0] px-5 font-zh text-[17px] font-bold tracking-[.1em] text-ink transition-all ${TAB_COLOR[k]} ${
                tab === k ? "pt-3 pb-3" : "pt-2 pb-2 hover:pt-2.5"
              }`}
            >
              {l}
            </button>
          ))}
        </nav>
      </header>

      <main className="paper mx-auto max-w-[1120px] p-[clamp(18px,3.5vw,36px)]">
        <CornerVine corner="tl" className="hidden sm:block" />
        <CornerVine corner="br" />
        {tab === "shelf" && <ShelfTab lib={lib} openBook={openBook} />}
        {tab === "reviews" && <ReviewsTab lib={lib} openBook={openBook} />}
        {tab === "wish" && <WishTab lib={lib} op={op} locations={locations} />}
        {tab === "places" && <PlacesTab lib={lib} op={op} openBook={openBook} />}
      </main>

      <p className="mt-7 text-center font-elite text-sm font-bold tracking-widest text-cream-muted italic">Good things take time…</p>

      <BookDialog editing={editing} onClose={() => setEditing(null)} op={op} locations={locations} />

      {msg && (
        <div role="status" className="sketch grain fixed bottom-[calc(20px+env(safe-area-inset-bottom,0px))] left-1/2 z-50 max-w-[calc(100vw-32px)] -translate-x-1/2 -rotate-1 animate-drop bg-sage-soft px-5 py-2.5 font-zh text-base font-bold text-ink shadow-[4px_5px_0_rgba(15,20,10,.4)]">
          {msg}
        </div>
      )}
    </>
  );
}
