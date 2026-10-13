"use client";

import { useRef, useState } from "react";
import type { Library } from "@/lib/types";
import type { Op } from "./LibraryApp";
import { Icon, Modal } from "./ui";

/* 備份檔的格式：外面包一層說明，裡面是整個圖書館。匯入時也接受直接拿 data/db.json */
type BackupFile = { app: "my-library"; version: 1; exportedAt: string; library: Library };

const today = () => new Date().toLocaleDateString("sv").slice(0, 10); // YYYY-MM-DD（本地時間）

/* 把圖書館存成 JSON 檔下載 */
function download(lib: Library, tag = "") {
  const data: BackupFile = { app: "my-library", version: 1, exportedAt: new Date().toISOString(), library: lib };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `我的圖書館-${tag}備份-${today()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* 頁首的「備份」按鈕：打開視窗，可以匯出備份檔，或從備份檔匯入 */
export default function BackupButton({ lib, op }: { lib: Library; op: Op }) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);

  const pick = async (f: File | undefined) => {
    if (file.current) file.current.value = ""; // 同一個檔案可以再選一次
    if (!f) return;
    setErr("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(await f.text());
    } catch {
      setErr("讀不懂這個檔案，請選擇匯出的 .json 備份檔");
      return;
    }
    const p = parsed as Partial<BackupFile> & Partial<Library>;
    const incoming = (p.library ?? p) as Partial<Library>;
    if (!Array.isArray(incoming.books) || !Array.isArray(incoming.wishes)) {
      setErr("這不是圖書館的備份檔");
      return;
    }
    const when = p.exportedAt ? `（${new Date(p.exportedAt).toLocaleString("zh-TW")} 的備份）` : "";
    const ok = confirm(
      `要匯入「${f.name}」${when}嗎？\n\n` +
        `備份裡有 ${incoming.books.length} 本書、${incoming.wishes.length} 本想買的書。\n` +
        `匯入後會「取代」目前的 ${lib.books.length} 本書和 ${lib.wishes.length} 本想買的書。\n\n` +
        `按下確定前，會先自動下載一份目前資料的備份，以防萬一。`,
    );
    if (!ok) return;
    download(lib, "匯入前");
    if (await op("restore", { library: incoming })) setOpen(false);
  };

  return (
    <>
      <button className="btn btn-sm" onClick={() => setOpen(true)} title="匯出或匯入備份" aria-label="備份">
        <Icon name="archive" size={16} /> <span className="hidden sm:inline">備份</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="備份">
        <div className="flex flex-col gap-4 font-zh">
          <p className="text-center text-muted">
            目前有 <b className="text-ink">{lib.books.length}</b> 本書、<b className="text-ink">{lib.wishes.length}</b> 本想買的書
          </p>

          <section className="sketch flex flex-col gap-2 bg-sage-soft/60 p-4">
            <h3 className="text-lg font-bold">匯出備份</h3>
            <p className="text-sm text-muted">把所有書、感想、想買清單和位置存成一個檔案，可以放到雲端硬碟或隨身碟保存。</p>
            <button className="btn btn-pri self-start" onClick={() => download(lib)}>
              <Icon name="download" size={16} /> 下載備份檔
            </button>
          </section>

          <section className="sketch flex flex-col gap-2 bg-tan/40 p-4">
            <h3 className="text-lg font-bold">匯入備份</h3>
            <p className="text-sm text-muted">選擇之前下載的備份檔（也可以選 data/db.json）。匯入會取代目前的資料，匯入前會先自動下載一份目前資料的備份。</p>
            <input ref={file} type="file" accept=".json,application/json" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
            <button className="btn self-start" onClick={() => file.current?.click()}>
              <Icon name="upload" size={16} /> 選擇備份檔…
            </button>
            {err && <p className="text-sm text-berry">{err}</p>}
          </section>
        </div>
      </Modal>
    </>
  );
}
