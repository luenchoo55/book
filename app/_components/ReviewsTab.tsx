"use client";

import { FORMAT_LABEL } from "@/lib/books";
import type { Library } from "@/lib/types";
import type { OpenBook } from "./LibraryApp";
import { Cover, Empty, Icon, SecTitle, Stars } from "./ui";

/* 閱讀感想：寫過感想或打過分數的書，一張張像釘在牆上的信紙；下面列出讀完但還沒寫的書 */
export default function ReviewsTab({ lib, openBook }: { lib: Library; openBook: OpenBook }) {
  const written = lib.books.filter((b) => b.review || b.rating).sort((a, b) => (b.readAt || "").localeCompare(a.readAt || "") || b.addedAt - a.addedAt);
  const todo = lib.books.filter((b) => !b.review && !b.rating && b.status !== "unread");

  return (
    <section>
      <SecTitle zh="閱讀感想" en="Reading Notes">
        <p className="font-zh text-sm text-muted">共 {written.length} 篇</p>
      </SecTitle>

      {written.length ? (
        <div className="mt-[18px] grid grid-cols-[repeat(auto-fill,minmax(min(100%,420px),1fr))] gap-[18px]">
          {written.map((b) => (
            <article key={b.id} className="relative rounded-[3px] border border-rule bg-[#fffaec]/45 px-[22px] pt-5 pb-4">
              <span className="absolute -top-[7px] right-6 size-3.5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#d97a63,var(--color-stamp)_60%,#4f1d14)] shadow-[0_2px_3px_rgba(0,0,0,.4)]" aria-hidden />
              <div className="grid grid-cols-[58px_minmax(0,1fr)] items-start gap-3.5">
                <Cover book={b} />
                <div className="min-w-0">
                  <h3 className="font-zh text-lg leading-snug font-black break-words">{b.title}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                    {b.author && <span className="font-zh">{b.author}</span>}
                    <span className="font-zh">{FORMAT_LABEL[b.format]}</span>
                    {b.readAt && <time className="tabular-nums">{b.readAt.replaceAll("-", ".")}</time>}
                  </p>
                  <Stars value={b.rating} className="mt-1" />
                </div>
              </div>
              <blockquote className={`ruled mt-3.5 min-h-24 font-zh text-[15px] leading-8 break-words whitespace-pre-wrap ${b.review ? "" : "text-faint italic"}`}>{b.review || "（只打了分數，還沒寫下文字）"}</blockquote>
              <div className="mt-2 flex justify-end">
                <button className="btn btn-ghost btn-sm" onClick={() => openBook(b, "review")}>
                  <Icon name="edit" size={15} /> 編輯感想
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty title="Dear diary…">還沒有閱讀感想。讀完一本書後，到書櫃按「感想」寫下心得吧。</Empty>
      )}

      {todo.length > 0 && (
        <>
          <h3 className="mt-7 flex items-center gap-2.5 font-zh text-base font-black tracking-wider after:h-px after:flex-1 after:bg-line">讀過了，還沒寫感想</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {todo.map((b) => (
              <button key={b.id} className="btn btn-sm font-zh" onClick={() => openBook(b, "review")}>
                <Icon name="edit" size={14} /> 《{b.title}》
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
