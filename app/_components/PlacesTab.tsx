"use client";

import { useState } from "react";
import type { Book, Library } from "@/lib/types";
import type { Op, OpenBook } from "./LibraryApp";
import { colorOf, Empty, Field, Icon, Modal, N, SecTitle, Summary } from "./ui";

/* 書的位置：每個位置是一層木頭書架，書以書背的樣子排在上面。
   位置可以自己新增、改名、刪除、調整順序；也可以用滑鼠把書背拖到別層，或用選單把書搬過來。 */
export default function PlacesTab({ lib, op, openBook }: { lib: Library; op: Op; openBook: OpenBook }) {
  const [naming, setNaming] = useState<{ from?: string } | null>(null);
  /* 拖曳中的書、目前滑過哪一層 */
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const drag: Drag = {
    dragId,
    over,
    start: setDragId,
    end: () => {
      setDragId(null);
      setOver(null);
    },
    enter: setOver,
    drop: (place) => {
      const b = lib.books.find((x) => x.id === dragId);
      setDragId(null);
      setOver(null);
      if (b && b.location !== place) op("moveBook", { id: b.id, location: place });
    },
  };
  const unplaced = lib.books.filter((b) => !b.location);
  const booksAt = (place: string) => lib.books.filter((b) => b.location === place);

  const remove = (place: string) => {
    const n = booksAt(place).length;
    if (confirm(n ? `刪除「${place}」？上面的 ${n} 本書不會被刪掉，會改成「還沒記錄位置」。` : `刪除「${place}」？`)) op("deletePlace", { name: place });
  };

  return (
    <section>
      <SecTitle zh="書的位置" en="Where Things Are">
        <button className="btn btn-pri" onClick={() => setNaming({})}>
          <Icon name="plus" size={16} /> 新增位置
        </button>
      </SecTitle>
      <Summary>
        目前有<N>{lib.places.length}</N>個位置
        {unplaced.length > 0 && (
          <>
            ，<N>{unplaced.length}</N>本書還沒記錄位置
          </>
        )}
      </Summary>
      <p className="font-zh text-base text-muted">用滑鼠把書背拖到別層就能搬家；點一下書背可以編輯那本書。</p>

      {lib.places.length || unplaced.length ? (
        <div className="mt-[18px] flex flex-col gap-[26px]">
          {lib.places.map((place, i) => (
            <Shelf key={place} place={place} books={booksAt(place)} all={lib.books} op={op} openBook={openBook} drag={drag}>
              <div className="flex flex-none gap-0.5">
                <button className="btn btn-ghost btn-sm px-1.5" disabled={i === 0} onClick={() => op("movePlace", { name: place, dir: -1 })} aria-label={`把「${place}」往上移`}>
                  <Icon name="up" size={16} />
                </button>
                <button className="btn btn-ghost btn-sm px-1.5" disabled={i === lib.places.length - 1} onClick={() => op("movePlace", { name: place, dir: 1 })} aria-label={`把「${place}」往下移`}>
                  <Icon name="down" size={16} />
                </button>
                <button className="btn btn-ghost btn-sm px-1.5" onClick={() => setNaming({ from: place })} aria-label={`改名「${place}」`}>
                  <Icon name="edit" size={16} />
                </button>
                <button className="btn btn-ghost btn-sm px-1.5 text-berry" onClick={() => remove(place)} aria-label={`刪除「${place}」`}>
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </Shelf>
          ))}
          {unplaced.length > 0 && <Shelf place="" books={unplaced} all={lib.books} op={op} openBook={openBook} drag={drag} />}
        </div>
      ) : (
        <Empty title="No shelves yet.">按「新增位置」建立第一層書架，例如「客廳書架第 1 層」。</Empty>
      )}

      <Modal open={!!naming} onClose={() => setNaming(null)} title={naming?.from ? "修改位置名稱" : "新增位置"}>
        {naming && <PlaceForm key={naming.from ?? "new"} from={naming.from} places={lib.places} op={op} onClose={() => setNaming(null)} />}
      </Modal>
    </section>
  );
}

type Drag = {
  dragId: string | null;
  over: string | null;
  start: (id: string) => void;
  end: () => void;
  enter: (place: string | null) => void;
  drop: (place: string) => void;
};

function Shelf({ place, books, all, op, openBook, drag, children }: { place: string; books: Book[]; all: Book[]; op: Op; openBook: OpenBook; drag: Drag; children?: React.ReactNode }) {
  const others = all.filter((b) => b.location !== place);
  /* 拖著別層的書滑到這一層時，這層會亮起來 */
  const fromHere = books.some((b) => b.id === drag.dragId);
  const target = !!drag.dragId && !fromHere && drag.over === place;
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h3 className={`flex min-w-0 items-center gap-2 font-zh text-lg font-bold tracking-wide break-words ${place ? "" : "text-muted"}`}>
          <Icon name="pin" className="flex-none text-berry" />
          {place || "還沒記錄位置"}
          <small className="font-type text-[13px] font-normal whitespace-nowrap text-muted">
            {books.length} 種 · {books.reduce((s, b) => s + b.qty, 0)} 冊
          </small>
        </h3>
        <span className="flex-1" />
        {place && others.length > 0 && (
          <select
            className="input min-h-8 w-auto max-w-56 py-0.5 font-zh text-sm"
            value=""
            aria-label={`放一本書到「${place}」`}
            onChange={(e) => e.target.value && op("moveBook", { id: e.target.value, location: place })}
          >
            <option value="">＋ 放一本書到這裡…</option>
            {others.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
                {b.location ? `（目前在 ${b.location}）` : ""}
              </option>
            ))}
          </select>
        )}
        {children}
      </div>
      <div
        onDragOver={(e) => {
          if (!drag.dragId) return;
          e.preventDefault(); // 允許放下
          e.dataTransfer.dropEffect = "move";
          if (drag.over !== place) drag.enter(place);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null) && drag.over === place) drag.enter(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          drag.drop(place);
        }}
        className={`sketch plank relative flex min-h-[148px] items-end gap-1 overflow-x-auto rounded-[10px_12px_0_0/8px_10px_0_0] px-4 pt-3.5 transition-shadow ${target ? "shadow-[inset_0_0_0_4px_var(--color-sage),inset_0_0_40px_rgba(157,180,108,.55)]" : ""}`}
      >
        {target && (
          <span className="pointer-events-none absolute top-3 right-4 z-10 rounded-full border-2 border-ink bg-sage px-3 py-0.5 font-zh text-sm font-bold text-ink">放到這裡</span>
        )}
        {books.length ? (
          books.map((b) => {
            const h = 112 + ([...b.title].length % 4) * 8;
            const w = 30 + Math.min(14, [...b.title].length) + (b.qty > 1 ? 6 : 0);
            return (
              <button
                key={b.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", b.title);
                  drag.start(b.id);
                }}
                onDragEnd={drag.end}
                onClick={() => openBook(b)}
                title={`${b.title}${b.author ? "／" + b.author : ""}（${b.qty} 本）— 拖曳可以搬到別層`}
                style={{ height: h, width: w, backgroundColor: colorOf(b) }}
                className={`sketch spine-bands flex flex-none items-center justify-center overflow-hidden rounded-[5px_6px_0_0/4px_5px_0_0] py-3.5 text-center font-zh text-sm font-bold tracking-[.12em] text-spine transition [text-shadow:1px_1px_0_rgba(58,42,31,.45)] [writing-mode:vertical-rl] hover:-translate-y-1.5 active:cursor-grabbing ${drag.dragId === b.id ? "opacity-40" : "cursor-grab"}`}
              >
                <span className="max-h-full overflow-hidden">{b.title}</span>
              </button>
            );
          })
        ) : (
          <p className="self-center pb-3.5 font-elite text-base font-bold tracking-wider text-muted italic">An empty shelf…</p>
        )}
      </div>
      <div className="sketch plank-edge h-4 rounded-[0_0_8px_10px/0_0_6px_8px] shadow-[3px_4px_0_rgba(58,42,31,.3)]" />
    </div>
  );
}

function PlaceForm({ from, places, op, onClose }: { from?: string; places: string[]; op: Op; onClose: () => void }) {
  const [name, setName] = useState(from ?? "");
  const merging = !!from && name.trim() !== from && places.includes(name.trim());
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await op(from ? "renamePlace" : "addPlace", from ? { from, to: name } : { name })) onClose();
  };
  return (
    <form onSubmit={save} className="flex flex-col gap-3.5">
      <Field label="位置名稱" hint={merging ? `已經有「${name.trim()}」，儲存後兩個位置的書會合併在一起。` : from ? "這個位置上的書會一起改過去。" : "例如：書房書櫃左邊、Kindle、博客來電子書 App"}>
        <input className="input" required autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          取消
        </button>
        <button className="btn btn-pri">{from ? (merging ? "合併" : "儲存") : "新增"}</button>
      </div>
    </form>
  );
}
