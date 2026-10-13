"use client";

import { useState } from "react";
import { FORMAT_LABEL, isBooksCom, linkOf } from "@/lib/books";
import type { Format, Library, Wish } from "@/lib/types";
import type { Op } from "./LibraryApp";
import { FORMAT_CHIP } from "./ShelfTab";
import { Empty, Field, Icon, Modal, SecTitle, Seg } from "./ui";

const PRIORITY: Record<Wish["priority"], string> = { 1: "最想買", 2: "想買", 3: "有空再看" };
type Draft = Partial<Wish>;

/* 想買清單：像圖書館的借書卡；買到之後一鍵移到書櫃 */
export default function WishTab({ lib, op, locations }: { lib: Library; op: Op; locations: string[] }) {
  const [editing, setEditing] = useState<Draft | null>(null);
  const [buying, setBuying] = useState<Wish | null>(null);
  const wishes = [...lib.wishes].sort((a, b) => a.priority - b.priority || b.addedAt - a.addedAt);

  return (
    <section>
      <SecTitle zh="想買清單" en="Wish List">
        <button className="btn btn-pri" onClick={() => setEditing({})}>
          <Icon name="plus" size={16} /> 加入想買
        </button>
      </SecTitle>
      <p className="font-zh text-sm text-muted">下次逛博客來前先看一下。買到了按「買到了」，就會自動放上書櫃。</p>

      {wishes.length ? (
        <div className="mt-[18px] grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-4">
          {wishes.map((w) => (
            <article key={w.id} className="relative flex flex-col gap-2 rounded-[3px] border border-line bg-[#fffaec]/40 px-[18px] py-4">
              <span className="absolute top-3 right-3 rotate-6 rounded-[3px] border-[1.5px] border-stamp px-1.5 py-0.5 font-zh text-xs font-bold tracking-wider text-stamp opacity-85">{PRIORITY[w.priority]}</span>
              <h3 className="pr-24 font-zh text-[17px] leading-snug font-black break-words">{w.title}</h3>
              <p className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[13px] text-muted">
                {w.author && <span className="font-zh">{w.author}</span>}
                <span className={`chip ${FORMAT_CHIP[w.format]}`}>{FORMAT_LABEL[w.format]}</span>
                {w.price && <span className="font-type font-bold text-ink">{w.price}</span>}
              </p>
              {w.note && <p className="border-l-[3px] border-rule pl-2.5 font-zh text-sm break-words whitespace-pre-wrap">{w.note}</p>}
              <div className="mt-auto flex flex-wrap gap-1.5 border-t border-dashed border-rule pt-2.5">
                <a className="btn btn-sm" href={linkOf(w)} target="_blank" rel="noreferrer">
                  <Icon name={w.link ? "link" : "search"} size={15} />
                  {w.link ? (isBooksCom(w.link) ? "博客來頁面" : "打開連結") : "搜尋博客來"}
                </a>
                <span className="flex-1" />
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(w)} aria-label={`編輯《${w.title}》`}>
                  <Icon name="edit" size={15} />
                </button>
                <button className="btn btn-pri btn-sm" onClick={() => setBuying(w)}>
                  <Icon name="bag" size={15} /> 買到了
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty title="Nothing on the list yet.">還沒有想買的書。看到喜歡的書，先記下來吧。</Empty>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "編輯想買的書" : "加入想買清單"}>
        {editing && <WishForm key={editing.id ?? "new"} draft={editing} op={op} onClose={() => setEditing(null)} />}
      </Modal>
      <Modal open={!!buying} onClose={() => setBuying(null)} title="恭喜入手！">
        {buying && <BoughtForm key={buying.id} wish={buying} op={op} locations={locations} onClose={() => setBuying(null)} />}
      </Modal>
    </section>
  );
}

function WishForm({ draft, op, onClose }: { draft: Draft; op: Op; onClose: () => void }) {
  const [f, setF] = useState({ title: "", author: "", format: "ebook" as Format, link: "", price: "", note: "", priority: 2 as Wish["priority"], ...draft });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await op(draft.id ? "updateWish" : "addWish", f);
    setBusy(false);
    if (ok) onClose();
  };
  const remove = async () => {
    if (draft.id && confirm(`確定從想買清單移除《${draft.title}》？`) && (await op("deleteWish", { id: draft.id }))) onClose();
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-3.5">
      <Field label="書名 *">
        <input className="input" required autoFocus value={f.title} onChange={(e) => set("title", e.target.value)} />
      </Field>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <Field label="作者">
          <input className="input" value={f.author} onChange={(e) => set("author", e.target.value)} />
        </Field>
        <Field label="價格">
          <input className="input" value={f.price} onChange={(e) => set("price", e.target.value)} placeholder="例如：$315" />
        </Field>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3.5">
        <Field label="格式">
          <Seg label="格式" value={f.format} onChange={(v) => set("format", v)} options={[["ebook", "電子書"], ["paper", "實體書"]] as const} />
        </Field>
        <Field label="有多想要">
          <Seg label="優先順序" value={f.priority} onChange={(v) => set("priority", v)} options={[[1, "最想買"], [2, "想買"], [3, "有空再看"]] as const} />
        </Field>
      </div>
      <Field label="博客來連結" hint="不填的話，會提供「到博客來搜尋」">
        <input className="input" type="url" value={f.link} onChange={(e) => set("link", e.target.value)} placeholder="https://www.books.com.tw/products/…" />
      </Field>
      <Field label="備註">
        <textarea className="input min-h-20 font-zh" value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="誰推薦的？等特價？" />
      </Field>
      <div className="mt-2 flex flex-wrap justify-end gap-2">
        {draft.id && (
          <button type="button" className="btn btn-danger mr-auto" onClick={remove}>
            移除
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          取消
        </button>
        <button className="btn btn-pri" disabled={busy}>
          {draft.id ? "儲存" : "加入清單"}
        </button>
      </div>
    </form>
  );
}

function BoughtForm({ wish, op, locations, onClose }: { wish: Wish; op: Op; locations: string[]; onClose: () => void }) {
  const [loc, setLoc] = useState(wish.format === "ebook" ? "博客來電子書 App" : "");
  const done = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await op("bought", { id: wish.id, location: loc })) onClose();
  };
  return (
    <form onSubmit={done} className="flex flex-col gap-3.5">
      <p className="text-center font-zh">
        《{wish.title}》要放在哪裡呢？
      </p>
      <Field label="放在哪裡">
        <input className="input" list="bought-locations" autoFocus value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="例如：客廳書架第 2 層" />
        <datalist id="bought-locations">
          {[...new Set(["博客來電子書 App", ...locations])].map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          取消
        </button>
        <button className="btn btn-pri">放上書櫃</button>
      </div>
    </form>
  );
}
