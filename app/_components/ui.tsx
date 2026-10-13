"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { coverOf } from "@/lib/books";

/* ---------- 小圖示（線條風格，配合復古感） ---------- */
const paths = {
  pin: "M12 21s-6-5.6-6-11a6 6 0 1 1 12 0c0 5.4-6 11-6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  search: "m20 20-4.2-4.2M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  link: "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  lock: "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  eyeOff: "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2",
  bag: "M5 8h14l-1 12H6L5 8Zm4 0V6a3 3 0 0 1 6 0v2",
  logout: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  upload: "M12 20V9M7 14l5-5 5 5M5 4h14",
  archive: "M4 8h16v12H4zM3 4h18v4H3zM10 12h4",
  up: "m6 15 6-6 6 6",
  down: "m6 9 6 6 6-6",
  book: "M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5Zm0 0v13",
} as const;

export function Icon({ name, size = 18, className = "" }: { name: keyof typeof paths; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      <path d={paths[name]} />
    </svg>
  );
}

/* 手繪金幣（價格旁邊用） */
export function Coin({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="flex-none">
      <ellipse cx="12.6" cy="12.8" rx="9.6" ry="9.6" fill="#a8741a" stroke="var(--color-ink)" strokeWidth="1.6" />
      <circle cx="11.4" cy="11.6" r="9.4" fill="var(--color-gold)" stroke="var(--color-ink)" strokeWidth="1.6" />
      <circle cx="11.4" cy="11.6" r="6.2" fill="none" stroke="#a8741a" strokeWidth="1.3" strokeDasharray="2.2 1.6" />
      <path d="M11.4 7.4v8.4M13.6 9.2c-.6-.8-1.4-1-2.3-1-1.2 0-2 .6-2 1.5 0 2.1 4.6 1.2 4.6 3.4 0 1-.9 1.6-2.2 1.6-1 0-1.9-.4-2.4-1.1" fill="none" stroke="var(--color-ink)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.6 7.6c.8-1.2 2-2 3.4-2.3" stroke="#fff6d6" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* 一小段藤蔓（左邊接莖、右邊有小花），flip 會左右翻轉 */
export function VineSprig({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <svg width="64" height="20" viewBox="0 0 64 20" fill="none" aria-hidden className={`flex-none ${flip ? "-scale-x-100" : ""} ${className}`}>
      <path d="M2 11c10-6 18 5 28 0s16-6 24-2" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 8c-1-4 3-6 6-5-1 4-3 5-6 5Z" fill="var(--color-sage)" stroke="var(--color-ink)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M33 11c2 4 6 4 8 2-2-3-5-4-8-2Z" fill="var(--color-sage)" stroke="var(--color-ink)" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M24 8c0-3 2-4 4-4 0 3-2 4-4 4Z" fill="var(--color-sage)" stroke="var(--color-ink)" strokeWidth="1.1" strokeLinejoin="round" />
      <g transform="translate(57 8)" stroke="var(--color-ink)" strokeWidth="1.1">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="0" cy="-3" rx="2.2" ry="3" fill="var(--color-lav)" transform={`rotate(${r})`} />
        ))}
        <circle r="1.6" fill="var(--color-gold-soft)" />
      </g>
    </svg>
  );
}

/* 分隔線：藤蔓 ― 葉子 ― 藤蔓 */
export function Flourish({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto my-3.5 flex max-w-80 items-center justify-center gap-1 ${className}`} aria-hidden>
      <VineSprig flip />
      <svg width="16" height="16" viewBox="0 0 16 16" className="flex-none">
        <path d="M8 1c4 3 4 9 0 14C4 10 4 4 8 1Z" fill="var(--color-sage)" stroke="var(--color-ink)" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 4v9" stroke="var(--color-ink)" strokeWidth="1" />
      </svg>
      <VineSprig />
    </div>
  );
}

/* 紙板角落的藤蔓裝飾（corner：tl 左上、br 右下） */
export function CornerVine({ corner, className = "" }: { corner: "tl" | "br"; className?: string }) {
  const leaf = (x: number, y: number, r: number, k: number) => (
    <path key={k} d="M0 0c3-7 11-9 15-6-3 6-9 9-15 6Z" transform={`translate(${x} ${y}) rotate(${r})`} fill={k % 3 ? "var(--color-sage)" : "#7f9b52"} stroke="var(--color-ink)" strokeWidth="1.4" strokeLinejoin="round" />
  );
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
      className={`pointer-events-none absolute z-10 ${corner === "tl" ? "-top-4 -left-4" : "-right-4 -bottom-4 rotate-180"} ${className}`}
    >
      <path d="M8 112C6 70 18 30 52 14S104 6 114 8" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M20 60c-8-4-12-12-10-20M40 24c2-8 10-12 18-12" stroke="var(--color-ink)" strokeWidth="1.5" strokeLinecap="round" />
      {[leaf(8, 96, -100, 1), leaf(12, 72, -80, 2), leaf(20, 52, -60, 3), leaf(10, 40, -150, 4), leaf(34, 30, -40, 5), leaf(56, 16, -20, 6), leaf(58, 12, -170, 7), leaf(80, 10, -10, 8), leaf(100, 8, 10, 9)]}
      <g transform="translate(28 20)" stroke="var(--color-ink)" strokeWidth="1.2">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="0" cy="-4" rx="3" ry="4" fill="var(--color-rose)" transform={`rotate(${r})`} />
        ))}
        <circle r="2.2" fill="var(--color-gold-soft)" />
      </g>
    </svg>
  );
}

/* 星星：唯讀顯示 */
export function Stars({ value, className = "" }: { value: number; className?: string }) {
  if (!value) return null;
  return (
    <span className={`inline-flex text-base leading-none tracking-tight ${className}`} aria-label={`${value} 顆星`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? "text-gold [-webkit-text-stroke:.6px_var(--color-ink)]" : "text-paper-dark"}>
          ★
        </span>
      ))}
    </span>
  );
}

/* 星星：可以點選評分，再點一次同一顆就取消 */
export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="inline-flex" role="radiogroup" aria-label="評分">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} 顆星`}
          onClick={() => onChange(value === i ? 0 : i)}
          className={`px-0.5 py-1 text-2xl leading-none transition-colors ${i <= value ? "text-gold [-webkit-text-stroke:.8px_var(--color-ink)]" : "text-paper-dark [-webkit-text-stroke:.8px_var(--color-faint)] hover:text-gold-soft"}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}

/* 皮革書的顏色：依書名固定挑一個 */
export const PALETTE = ["#6f8f4a", "#7d6fae", "#c47467", "#b58b4f", "#5f8fa3", "#cf8a4f", "#4f7a5a", "#b8862a"];
const autoColor = (title: string) => PALETTE[[...title].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % PALETTE.length];
/* 封面／書背顏色：有自己選的顏色就用它，沒有就依書名自動挑一個 */
export const colorOf = (b: { title: string; color?: string }) => b.color || autoColor(b.title);

/* 封面：有圖用圖（自訂網址 > 博客來推算），抓不到就畫一本皮革精裝書 */
export function Cover({ book, className = "" }: { book: { title: string; author: string; link: string; cover?: string; color?: string }; className?: string }) {
  const src = coverOf(book);
  const [failed, setFailed] = useState<string | null>(null);
  const box = `sketch aspect-[2/3] w-full overflow-hidden rounded-[4px_9px_8px_4px/4px_7px_9px_4px] shadow-[3px_3px_0_rgba(58,42,31,.35)] ${className}`;
  if (src && failed !== src)
    return (
      <div className={box}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 外部網站的封面，不經過 Next 圖片最佳化 */}
        <img src={src} alt={`《${book.title}》封面`} referrerPolicy="no-referrer" loading="lazy" onError={() => setFailed(src)} className="size-full object-cover" />
      </div>
    );
  return (
    <div className={`${box} @container grain flex flex-col items-center justify-center px-2 py-2.5 text-center text-spine`} style={{ backgroundColor: colorOf(book) }}>
      <svg className="absolute top-[9%] left-1/2 hidden -translate-x-1/2 @[76px]:block" width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
        <path d="M9 13V5M9 8C6 8 3 6 3 2c4 0 6 2 6 6Zm0-1c3 0 6-2 6-5-4 0-6 2-6 5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      <b className="line-clamp-5 font-zh text-[14px] leading-snug font-bold tracking-wide break-all [text-shadow:1px_1px_0_rgba(58,42,31,.45)]">{book.title}</b>
      {book.author && <i className="mt-1.5 hidden @[76px]:line-clamp-2 font-zh text-[10px] not-italic opacity-75">{book.author}</i>}
      <span className="absolute right-[18%] bottom-[10%] left-[18%] hidden h-0 border-t-2 @[76px]:block border-dotted border-current opacity-70" />
    </div>
  );
}

/* 表單欄位 */
export function Field({ label, hint, className = "", children }: { label: string; hint?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <label className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <span className="font-zh text-sm font-bold tracking-wide text-ink-soft">{label}</span>
      {children}
      {hint && <span className="font-zh text-xs text-muted">{hint}</span>}
    </label>
  );
}

/* 選項切換（例如 實體書／電子書） */
export function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="sketch inline-flex flex-wrap overflow-hidden bg-[#fbf5e2]">
      {options.map(([v, l], i) => (
        <button
          key={String(v)}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`min-h-9 px-3 py-1.5 font-zh text-sm font-bold ${i ? "border-l-2 border-ink/70" : ""} ${value === v ? "bg-sage text-ink" : "text-muted hover:bg-sage-soft/60"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* 對話框：羊皮紙卡片 */
export function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={`m-auto max-h-[calc(100dvh-24px)] w-full ${wide ? "max-w-[min(720px,calc(100vw-24px))]" : "max-w-[min(520px,calc(100vw-24px))]"} bg-transparent p-0 text-ink`}
    >
      {open && (
        <div className="paper max-h-[calc(100dvh-24px)] overflow-auto p-[clamp(18px,4vw,30px)] shadow-none">
          <h2 className="text-center font-zh text-2xl font-bold tracking-[.08em]">{title}</h2>
          <Flourish />
          {children}
        </div>
      )}
    </dialog>
  );
}

/* 分頁標題下的一句話，例如「目前我的書櫃裡有 3 本書」；用 <N> 包數字會放大加粗 */
export function Summary({ children }: { children: ReactNode }) {
  return <p className="mt-1 font-zh text-lg text-ink-soft">{children}</p>;
}
export function N({ children }: { children: ReactNode }) {
  return <b className="mx-1 font-type text-[22px] font-extrabold text-leaf">{children}</b>;
}

/* 分頁標題：藤蔓 標題 藤蔓，英文小字在下面 */
export function SecTitle({ zh, en, children }: { zh: string; en: string; children?: ReactNode }) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="flex min-w-0 items-center gap-2">
        <VineSprig flip className="hidden sm:block" />
        <h2 className="text-center leading-tight">
          <span className="block font-zh text-[26px] font-bold tracking-[.12em]">{zh}</span>
          <span className="block font-elite text-xs font-bold tracking-[.22em] text-muted uppercase">{en}</span>
        </h2>
        <VineSprig className="hidden sm:block" />
      </div>
      {children}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center font-zh text-muted">
      <p className="font-elite text-xl font-bold tracking-wide text-ink italic">{title}</p>
      {children && <p className="mt-1.5">{children}</p>}
    </div>
  );
}

/* 位置輸入框：可以打字，也可以從下面的清單選以前用過的位置。
   （不用瀏覽器內建的 datalist，因為它在對話框裡的位置會跑掉） */
export function LocationInput({ value, onChange, options, autoFocus }: { value: string; onChange: (v: string) => void; options: string[]; autoFocus?: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const kw = value.trim().toLowerCase();
  /* 剛好等於某個選項（例如剛選完）時顯示全部，方便換成別的；否則只顯示包含關鍵字的 */
  const shown = !kw || options.some((o) => o.toLowerCase() === kw) ? options : options.filter((o) => o.toLowerCase().includes(kw));
  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setActive(-1);
  };
  return (
    <div className="relative">
      <input
        className="input pr-10"
        role="combobox"
        aria-expanded={open && shown.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        value={value}
        placeholder="例如：客廳書架第 2 層"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            const n = shown.length;
            if (n) setActive((i) => (e.key === "ArrowDown" ? (i + 1) % n : (i - 1 + n) % n));
          } else if (e.key === "Enter" && open && active >= 0 && shown[active]) {
            e.preventDefault();
            pick(shown[active]);
          } else if (e.key === "Escape" && open) {
            e.preventDefault();
            e.stopPropagation(); // 只關清單，不要關掉整個對話框
            setOpen(false);
          }
        }}
      />
      <button type="button" tabIndex={-1} aria-label="顯示位置清單" onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen(!open)} className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center text-ink">
        <Icon name="down" size={18} />
      </button>
      {open && shown.length > 0 && (
        <ul id={listId} role="listbox" className="sketch absolute inset-x-0 top-full z-30 mt-1.5 max-h-56 overflow-auto bg-[#fbf5e2] py-1 shadow-[4px_5px_0_rgba(58,42,31,.3)]">
          {shown.map((o, i) => (
            <li
              key={o}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o === value}
              onMouseDown={(e) => e.preventDefault()} // 不要讓輸入框先失焦把清單關掉
              onClick={(e) => {
                e.preventDefault(); // 外層 <label> 會把點擊轉給輸入框，讓清單又打開
                pick(o);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-2 px-3 py-2 font-zh text-base ${i === active ? "bg-sage-soft" : ""} ${o === value ? "font-bold" : ""}`}
            >
              <Icon name="pin" size={15} className="flex-none text-berry" />
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
