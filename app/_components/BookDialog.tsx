"use client";

import { useState } from "react";
import { coverOf, FORMAT_LABEL, isBooksCom, STATUS_LABEL } from "@/lib/books";
import type { Book, Format, Status } from "@/lib/types";
import type { Op } from "./LibraryApp";
import { Cover, Field, Modal, Seg, StarInput } from "./ui";

export type BookDraft = Partial<Book>;

const EMPTY: Omit<Book, "id" | "addedAt"> = {
  title: "",
  author: "",
  format: "ebook",
  qty: 1,
  location: "",
  link: "",
  cover: "",
  status: "unread",
  rating: 0,
  review: "",
  readAt: "",
};

/* 新增／編輯一本書（也用來寫閱讀感想） */
export default function BookDialog({ editing, onClose, op, locations }: { editing: { draft: BookDraft; focus?: "review" } | null; onClose: () => void; op: Op; locations: string[] }) {
  return (
    <Modal open={!!editing} onClose={onClose} title={editing?.draft.id ? (editing.focus === "review" ? "閱讀感想" : "編輯書籍") : "新增一本書"} wide>
      {/* key：每次打開都用新的表單狀態 */}
      {editing && <BookForm key={editing.draft.id ?? "new"} draft={editing.draft} focus={editing.focus} onClose={onClose} op={op} locations={locations} />}
    </Modal>
  );
}

function BookForm({ draft, focus, onClose, op, locations }: { draft: BookDraft; focus?: "review"; onClose: () => void; op: Op; locations: string[] }) {
  const [f, setF] = useState({ ...EMPTY, ...draft });
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await op(draft.id ? "updateBook" : "addBook", { ...f, id: draft.id });
    setBusy(false);
    if (ok) onClose();
  };

  const remove = async () => {
    if (!draft.id || !confirm(`確定要把《${draft.title}》從圖書館移除嗎？`)) return;
    if (await op("deleteBook", { id: draft.id })) onClose();
  };

  /* 電子書預設放在博客來 App */
  const setFormat = (v: Format) => {
    setF((x) => ({ ...x, format: v, location: v === "ebook" && !x.location ? "博客來電子書 App" : x.location }));
  };

  const linkHint = f.link
    ? isBooksCom(f.link)
      ? coverOf({ link: f.link })
        ? "✓ 已辨識博客來商品，會自動抓封面"
        : "博客來連結"
      : "其他網站的連結"
    : "貼上博客來商品頁網址，會自動帶出封面；不填的話，會改成「到博客來搜尋」";

  return (
    <form onSubmit={save} className="flex flex-col gap-3.5">
      <div className="grid gap-4 sm:grid-cols-[110px_minmax(0,1fr)]">
        <div className="hidden sm:block">
          <Cover book={f} />
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="書名 *" className="sm:col-span-2">
            <input className="input" required value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="例如：原子習慣" autoFocus={focus !== "review"} />
          </Field>
          <Field label="作者">
            <input className="input" value={f.author} onChange={(e) => set("author", e.target.value)} />
          </Field>
          <Field label="格式">
            <Seg label="格式" value={f.format} onChange={setFormat} options={(Object.keys(FORMAT_LABEL) as Format[]).map((k) => [k, FORMAT_LABEL[k]] as const)} />
          </Field>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Field label="放在哪裡" hint="選以前用過的位置，或輸入新的">
          <input className="input" list="locations" value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="例如：客廳書架第 2 層" />
          <datalist id="locations">
            {[...new Set(["博客來電子書 App", ...locations])].map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </Field>
        <Field label="數量">
          <input className="input w-28 tabular-nums" type="number" min={0} max={999} value={f.qty} onChange={(e) => set("qty", Number(e.target.value))} />
        </Field>
      </div>

      <Field label="網路連結" hint={linkHint}>
        <input className="input" type="url" value={f.link} onChange={(e) => set("link", e.target.value)} placeholder="https://www.books.com.tw/products/…" />
      </Field>

      <details className="font-zh text-sm text-muted" open={!!f.cover}>
        <summary className="cursor-pointer select-none">自訂封面圖片網址（選填）</summary>
        <input className="input mt-2" type="url" value={f.cover} onChange={(e) => set("cover", e.target.value)} placeholder="https://…jpg" />
      </details>

      <div className="mt-1 border-t border-dashed border-rule pt-3.5">
        <p className="mb-3 font-zh font-black tracking-wider">閱讀紀錄</p>
        <div className="grid gap-3.5 sm:grid-cols-3">
          <Field label="狀態">
            <Seg label="閱讀狀態" value={f.status} onChange={(v: Status) => setF((x) => ({ ...x, status: v, readAt: v === "done" && !x.readAt ? new Date().toISOString().slice(0, 10) : x.readAt }))} options={(Object.keys(STATUS_LABEL) as Status[]).map((k) => [k, STATUS_LABEL[k]] as const)} />
          </Field>
          <Field label="讀完日期">
            <input className="input" type="date" value={f.readAt} onChange={(e) => set("readAt", e.target.value)} />
          </Field>
          <Field label="評分">
            <StarInput value={f.rating} onChange={(v) => set("rating", v)} />
          </Field>
        </div>
        <Field label="閱讀感想" className="mt-3.5">
          <textarea
            className="input ruled min-h-40 resize-y bg-[#fffaec]/55 bg-position-[0_8px] font-zh leading-8"
            value={f.review}
            onChange={(e) => set("review", e.target.value)}
            placeholder="這本書讓我想到…"
            autoFocus={focus === "review"}
          />
        </Field>
      </div>

      <div className="mt-2 flex flex-wrap justify-end gap-2">
        {draft.id && (
          <button type="button" className="btn btn-danger mr-auto" onClick={remove}>
            移除這本書
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          取消
        </button>
        <button className="btn btn-pri" disabled={busy}>
          {busy ? "儲存中…" : draft.id ? "儲存" : "放上書架"}
        </button>
      </div>
    </form>
  );
}
