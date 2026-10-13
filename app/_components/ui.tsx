"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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

/* 羅盤星分隔線 */
export function Flourish({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto my-3.5 flex max-w-80 items-center gap-2.5 text-line ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-line" />
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1l1.6 8.4L22 12l-8.4 1.6L12 23l-1.6-9.4L2 12l8.4-2.6z" opacity=".9" />
        <circle cx="12" cy="12" r="2.2" fill="var(--color-paper)" />
      </svg>
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-line" />
    </div>
  );
}

/* 星星：唯讀顯示 */
export function Stars({ value, className = "" }: { value: number; className?: string }) {
  if (!value) return null;
  return (
    <span className={`inline-flex text-base leading-none tracking-tight ${className}`} aria-label={`${value} 顆星`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= value ? "text-brass" : "text-paper-dark"}>
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
          className={`px-0.5 py-1 text-2xl leading-none transition-colors ${i <= value ? "text-brass" : "text-paper-edge hover:text-brass-soft"}`}
        >
          ★
        </button>
      ))}
    </span>
  );
}

/* 數量增減 */
export function Stepper({ value, onChange, label }: { value: number; onChange: (delta: 1 | -1) => void; label: string }) {
  const b = "grid size-8 place-items-center font-type text-lg font-bold leading-none hover:bg-ink/10 disabled:cursor-default disabled:opacity-30";
  return (
    <span className="inline-flex items-center rounded-[3px] border border-line bg-[#fffaec]/40">
      <button type="button" className={b} onClick={() => onChange(-1)} disabled={value <= 0} aria-label={`${label}：減少一本`}>
        −
      </button>
      <output className="min-w-12 border-x border-rule text-center font-type text-sm leading-8 font-bold tabular-nums" aria-label={`${label}的數量`}>
        {value} 本
      </output>
      <button type="button" className={b} onClick={() => onChange(1)} aria-label={`${label}：增加一本`}>
        +
      </button>
    </span>
  );
}

/* 皮革書的顏色：依書名固定挑一個 */
const LEATHER = ["#5b2c1f", "#2f4a3a", "#23324a", "#6b4a1f", "#4a2338", "#3d3a24", "#5a3a2a", "#27413f"];
export const leatherOf = (title: string) => LEATHER[[...title].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % LEATHER.length];

/* 封面：有圖用圖（自訂網址 > 博客來推算），抓不到就畫一本皮革精裝書 */
export function Cover({ book, className = "" }: { book: { title: string; author: string; link: string; cover?: string }; className?: string }) {
  const src = coverOf(book);
  const [failed, setFailed] = useState<string | null>(null);
  const box = `relative aspect-[2/3] w-full overflow-hidden rounded-l-[2px] rounded-r-[4px] shadow-[2px_3px_6px_rgba(0,0,0,.35),inset_0_0_0_1px_rgba(0,0,0,.15)] ${className}`;
  if (src && failed !== src)
    return (
      <div className={box}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 外部網站的封面，不經過 Next 圖片最佳化 */}
        <img src={src} alt={`《${book.title}》封面`} referrerPolicy="no-referrer" loading="lazy" onError={() => setFailed(src)} className="size-full object-cover" />
      </div>
    );
  return (
    <div className={`${box} cloth flex flex-col items-center justify-center px-2 py-2.5 text-center text-gilt`} style={{ backgroundColor: leatherOf(book.title) }}>
      <span className="absolute left-[14%] right-[8%] top-[12%] h-0.5 bg-current opacity-60" />
      <b className="line-clamp-5 font-zh text-[13px] leading-snug font-black tracking-wide break-all">{book.title}</b>
      {book.author && <i className="mt-1.5 line-clamp-2 font-zh text-[10px] not-italic opacity-75">{book.author}</i>}
      <span className="absolute left-[14%] right-[8%] bottom-[12%] h-0.5 bg-current opacity-60" />
    </div>
  );
}

/* 表單欄位 */
export function Field({ label, hint, className = "", children }: { label: string; hint?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <label className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <span className="font-zh text-[13px] font-semibold tracking-wide text-muted">{label}</span>
      {children}
      {hint && <span className="font-zh text-xs text-muted">{hint}</span>}
    </label>
  );
}

/* 選項切換（例如 實體書／電子書） */
export function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap overflow-hidden rounded-[3px] border border-line">
      {options.map(([v, l], i) => (
        <button
          key={String(v)}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`min-h-9 px-3 py-1.5 font-zh text-[13px] font-semibold ${i ? "border-l border-rule" : ""} ${value === v ? "bg-ink text-paper" : "text-muted hover:bg-ink/5"}`}
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
        <div className="paper max-h-[calc(100dvh-24px)] overflow-auto p-[clamp(18px,4vw,30px)]">
          <h2 className="text-center font-zh text-[22px] font-black tracking-[.08em]">{title}</h2>
          <Flourish />
          {children}
        </div>
      )}
    </dialog>
  );
}

/* 分頁標題 */
export function SecTitle({ zh, en, children }: { zh: string; en: string; children?: ReactNode }) {
  return (
    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
      <h2 className="font-zh text-[22px] font-black tracking-[.08em]">
        {zh}
        <span className="ml-2.5 font-elite text-[13px] font-normal tracking-[.14em] text-muted uppercase">{en}</span>
      </h2>
      {children}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-4 py-10 text-center font-zh text-muted">
      <p className="font-elite text-lg tracking-wide text-ink">{title}</p>
      {children && <p className="mt-1.5">{children}</p>}
    </div>
  );
}
