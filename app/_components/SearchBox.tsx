"use client";

import { useEffect, useId, useState } from "react";
import { FORMAT_LABEL } from "@/lib/books";
import type { Book, Library, Wish } from "@/lib/types";
import type { OpenBook } from "./LibraryApp";
import { Cover, Icon, Modal } from "./ui";

type Hit = { kind: "book"; b: Book } | { kind: "wish"; w: Wish };

/* 頁首的搜尋按鈕：點一下（或按「/」）跳出搜尋視窗，在任何分頁都能找書。
   點藏書會打開那本書，點想買的書會切到想買清單。 */
export default function SearchButton({ lib, openBook, onWish }: { lib: Library; openBook: OpenBook; onWish: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !document.querySelector("dialog[open]")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button className="btn btn-sm" onClick={() => setOpen(true)} title="搜尋書籍（快捷鍵 /）">
        <Icon name="search" size={16} /> 搜尋
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="搜尋書籍">
        <SearchPanel
          lib={lib}
          onPick={(h) => {
            setOpen(false);
            if (h.kind === "book") openBook(h.b);
            else onWish();
          }}
        />
      </Modal>
    </>
  );
}

function SearchPanel({ lib, onPick }: { lib: Library; onPick: (h: Hit) => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const kw = q.trim().toLowerCase();
  const has = (...s: string[]) => s.some((x) => x.toLowerCase().includes(kw));
  const hits: Hit[] = kw
    ? [
        ...lib.books.filter((b) => has(b.title, b.author, b.location)).slice(0, 8).map((b) => ({ kind: "book" as const, b })),
        ...lib.wishes.filter((w) => has(w.title, w.author)).slice(0, 4).map((w) => ({ kind: "wish" as const, w })),
      ]
    : [];

  return (
    <div className="flex flex-col gap-3">
      <label className="relative block">
        <span className="sr-only">搜尋書名、作者或位置</span>
        <Icon name="search" size={19} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink" />
        <input
          type="search"
          role="combobox"
          aria-expanded={hits.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={hits[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          autoFocus
          placeholder="搜尋書名、作者、位置…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if ((e.key === "ArrowDown" || e.key === "ArrowUp") && hits.length) {
              e.preventDefault();
              setActive((i) => (e.key === "ArrowDown" ? (i + 1) % hits.length : (i - 1 + hits.length) % hits.length));
            } else if (e.key === "Enter" && hits[active]) {
              e.preventDefault();
              onPick(hits[active]);
            }
          }}
          className="input min-h-12 rounded-full pl-11 text-lg"
        />
      </label>

      <div id={listId} role="listbox" aria-label="搜尋結果" className="max-h-[min(55vh,440px)] overflow-auto">
        {!kw ? (
          <p className="px-3 py-6 text-center font-zh text-muted">輸入書名、作者或位置，就會列出找到的書。</p>
        ) : hits.length ? (
          hits.map((h, i) => (
            <div
              key={h.kind === "book" ? h.b.id : h.w.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onClick={() => onPick(h)}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 ${i === active ? "bg-sage-soft" : ""}`}
            >
              {h.kind === "book" ? (
                <>
                  <div className="w-9 flex-none">
                    <Cover book={h.b} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-zh text-base font-bold">{h.b.title}</p>
                    <p className="flex items-center gap-1 truncate font-zh text-sm text-muted">
                      {h.b.author && <span className="truncate">{h.b.author}・</span>}
                      <Icon name="pin" size={13} className="flex-none text-berry" />
                      <span className="truncate">{h.b.location || "還沒記錄位置"}</span>
                    </p>
                  </div>
                  <span className="chip flex-none bg-paper-2 text-ink">{FORMAT_LABEL[h.b.format]}</span>
                </>
              ) : (
                <>
                  <span className="sketch grid size-9 flex-none place-items-center rounded-full bg-tan">
                    <Icon name="bag" size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-zh text-base font-bold">{h.w.title}</p>
                    {h.w.author && <p className="truncate font-zh text-sm text-muted">{h.w.author}</p>}
                  </div>
                  <span className="chip flex-none bg-gold-soft text-ink">想買</span>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="px-3 py-6 text-center font-zh text-muted">找不到「{q.trim()}」相關的書</p>
        )}
      </div>
    </div>
  );
}
