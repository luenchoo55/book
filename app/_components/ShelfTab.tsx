"use client";

import { useState } from "react";
import { FORMAT_LABEL, STATUS_LABEL } from "@/lib/books";
import type { Book, Format, Library, Status } from "@/lib/types";
import type { OpenBook } from "./LibraryApp";
import { Cover, Empty, Icon, N, SecTitle, Seg, Stars, Summary } from "./ui";

export const FORMAT_CHIP: Record<Format, string> = { ebook: "bg-lav-soft text-plum", paper: "bg-tan text-ink" };
export const STATUS_CHIP: Record<Status, string> = { done: "bg-sage-soft text-leaf", reading: "bg-rose-soft text-berry", unread: "bg-paper-2 text-muted" };

type Sort = "new" | "title" | "author";

/* 我的書櫃：統計、搜尋篩選、每本書一張卡片 */
export default function ShelfTab({ lib, openBook }: { lib: Library; openBook: OpenBook }) {
  const [q, setQ] = useState("");
  const [fmt, setFmt] = useState<Format | "all">("all");
  const [st, setSt] = useState<Status | "all">("all");
  const [sort, setSort] = useState<Sort>("new");

  const books = lib.books;
  const kw = q.trim().toLowerCase();
  const shown = books
    .filter((b) => (fmt === "all" || b.format === fmt) && (st === "all" || b.status === st))
    .filter((b) => !kw || [b.title, b.author, b.location].some((s) => s.toLowerCase().includes(kw)))
    .sort((a, b) => (sort === "new" ? b.addedAt - a.addedAt : (sort === "title" ? a.title : a.author).localeCompare(sort === "title" ? b.title : b.author, "zh-Hant")));

  const stats = [
    [books.length, "藏書（種）"],
    [books.reduce((s, b) => s + b.qty, 0), "總冊數"],
    [books.filter((b) => b.status === "done").length, "已讀完"],
    [books.filter((b) => b.status === "reading").length, "閱讀中"],
  ] as const;

  return (
    <section>
      <SecTitle zh="我的書櫃" en="The Collection">
        <button className="btn btn-pri" onClick={() => openBook({})}>
          <Icon name="plus" size={16} /> 新增書籍
        </button>
      </SecTitle>
      <Summary>
        目前我的書櫃裡有<N>{books.length}</N>本書
        {stats[1][0] !== books.length && (
          <>
            ，共<N>{stats[1][0]}</N>冊
          </>
        )}
      </Summary>

      <dl className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([n, l], i) => (
          <div key={l} className={`sketch grain flex flex-col-reverse gap-0.5 px-4 py-2.5 ${["bg-sage-soft", "bg-tan/70", "bg-lav-soft", "bg-rose-soft"][i]}`}>
            <dt className="font-zh text-sm font-bold tracking-wider text-ink-soft">{l}</dt>
            <dd className="font-type text-[30px] leading-tight font-extrabold tabular-nums">{n}</dd>
          </div>
        ))}
      </dl>

      <div className="mb-[18px] flex flex-wrap items-center gap-2.5">
        <label className="relative min-w-0 flex-[1_1_240px]">
          <span className="sr-only">搜尋書名、作者或位置</span>
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input className="input pl-10" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋書名、作者、位置…" />
        </label>
        <Seg label="格式" value={fmt} onChange={setFmt} options={[["all", "全部"], ["paper", "實體"], ["ebook", "電子"]] as const} />
        <Seg label="閱讀狀態" value={st} onChange={setSt} options={[["all", "全部"], ["unread", "未讀"], ["reading", "閱讀中"], ["done", "已讀"]] as const} />
        <select className="input min-h-9 w-auto py-1 font-zh text-sm" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="排序">
          <option value="new">最新加入</option>
          <option value="title">依書名</option>
          <option value="author">依作者</option>
        </select>
      </div>

      {shown.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
          {shown.map((b) => (
            <BookCard key={b.id} b={b} openBook={openBook} />
          ))}
        </div>
      ) : books.length ? (
        <Empty title="No books found.">找不到符合條件的書，換個關鍵字試試。</Empty>
      ) : (
        <Empty title="An empty shelf awaits.">書櫃還是空的，按「新增書籍」放上第一本書吧。</Empty>
      )}
    </section>
  );
}

function BookCard({ b, openBook }: { b: Book; openBook: OpenBook }) {
  return (
    <article className="sketch grid grid-cols-[92px_minmax(0,1fr)] gap-3.5 bg-[#f7eed6] p-3.5 transition-colors hover:bg-sage-soft">
      <button onClick={() => openBook(b)} aria-label={`編輯《${b.title}》`} className="self-start">
        <Cover book={b} />
      </button>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="font-zh text-lg leading-snug font-bold tracking-wide break-words">{b.title}</h3>
        {b.author && <p className="font-zh text-sm text-muted">{b.author}</p>}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`chip ${FORMAT_CHIP[b.format]}`}>{FORMAT_LABEL[b.format]}</span>
          <span className={`chip ${STATUS_CHIP[b.status]}`}>{STATUS_LABEL[b.status]}</span>
          <Stars value={b.rating} className="text-sm" />
        </div>
        <p className={`flex items-start gap-1 font-zh text-sm break-words ${b.location ? "" : "text-faint"}`}>
          <Icon name="pin" size={15} className="mt-0.5 flex-none text-berry" />
          {b.location || "還沒記錄位置"}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t-2 border-dotted border-ink/30 pt-2">
          <div className="flex gap-1">
            {b.link && (
              <a className="btn btn-ghost btn-sm" href={b.link} target="_blank" rel="noreferrer" title="打開連結">
                <Icon name="link" size={15} /> 連結
              </a>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => openBook(b, "review")} title="寫閱讀感想">
              <Icon name="edit" size={15} /> 感想
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
