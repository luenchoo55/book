import "server-only";
import type { Book, Format, Library, Status, Wish } from "../types";
import { UserError } from "./store";

/* 網站上每一個「修改」動作都在這裡。每個動作收到目前的圖書館資料，直接改它，回傳要顯示的提示文字。 */
type P = Record<string, unknown>;
type Cmd = (L: Library, p: P) => string | undefined;

const str = (v: unknown, max = 2000) => String(v ?? "").trim().slice(0, max);
const int = (v: unknown, min: number, max: number, def: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};
const pick = <T extends string>(v: unknown, opts: readonly T[], def: T) => (opts.includes(v as T) ? (v as T) : def);
const url = (v: unknown) => {
  const s = str(v, 1000);
  if (!s) return "";
  if (!/^https?:\/\//i.test(s)) throw new UserError("連結要以 http:// 或 https:// 開頭");
  return s;
};
const date = (v: unknown) => {
  const s = str(v, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
};
const newId = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const FORMATS = ["paper", "ebook"] as const satisfies readonly Format[];
const STATUSES = ["unread", "reading", "done"] as const satisfies readonly Status[];

function findBook(L: Library, id: unknown) {
  const b = L.books.find((x) => x.id === id);
  if (!b) throw new UserError("找不到這本書，可能已經被刪除了", 404);
  return b;
}
function findWish(L: Library, id: unknown) {
  const w = L.wishes.find((x) => x.id === id);
  if (!w) throw new UserError("找不到這筆想買的書", 404);
  return w;
}

/* 新增／修改書時共用：把表單內容整理成書的欄位 */
function bookFields(p: P, prev?: Book): Omit<Book, "id" | "addedAt"> {
  const title = str(p.title ?? prev?.title, 200);
  if (!title) throw new UserError("請輸入書名");
  const status = pick(p.status ?? prev?.status, STATUSES, "unread");
  return {
    title,
    author: str(p.author ?? prev?.author, 200),
    format: pick(p.format ?? prev?.format, FORMATS, "paper"),
    qty: int(p.qty ?? prev?.qty, 0, 999, 1),
    location: str(p.location ?? prev?.location, 100),
    link: url(p.link ?? prev?.link),
    cover: url(p.cover ?? prev?.cover),
    status,
    rating: int(p.rating ?? prev?.rating, 0, 5, 0),
    review: str(p.review ?? prev?.review, 20000),
    readAt: date(p.readAt ?? prev?.readAt),
  };
}

function wishFields(p: P, prev?: Wish): Omit<Wish, "id" | "addedAt"> {
  const title = str(p.title ?? prev?.title, 200);
  if (!title) throw new UserError("請輸入書名");
  return {
    title,
    author: str(p.author ?? prev?.author, 200),
    format: pick(p.format ?? prev?.format, FORMATS, "ebook"),
    link: url(p.link ?? prev?.link),
    price: str(p.price ?? prev?.price, 30),
    note: str(p.note ?? prev?.note, 2000),
    priority: int(p.priority ?? prev?.priority, 1, 3, 2) as 1 | 2 | 3,
  };
}

export const commands: Record<string, Cmd> = {
  addBook(L, p) {
    const b: Book = { id: newId("b"), addedAt: Date.now(), ...bookFields(p) };
    L.books.unshift(b);
    return `已把《${b.title}》放上書架`;
  },
  updateBook(L, p) {
    const b = findBook(L, p.id);
    Object.assign(b, bookFields(p, b));
    return `已更新《${b.title}》`;
  },
  deleteBook(L, p) {
    const b = findBook(L, p.id);
    L.books = L.books.filter((x) => x !== b);
    return `已移除《${b.title}》`;
  },
  /* 數量 +1 / -1 */
  qty(L, p) {
    const b = findBook(L, p.id);
    b.qty = int(b.qty + int(p.delta, -1, 1, 0), 0, 999, b.qty);
    return undefined;
  },
  addWish(L, p) {
    const w: Wish = { id: newId("w"), addedAt: Date.now(), ...wishFields(p) };
    L.wishes.unshift(w);
    return `已加入想買清單：《${w.title}》`;
  },
  updateWish(L, p) {
    const w = findWish(L, p.id);
    Object.assign(w, wishFields(p, w));
    return `已更新《${w.title}》`;
  },
  deleteWish(L, p) {
    const w = findWish(L, p.id);
    L.wishes = L.wishes.filter((x) => x !== w);
    return `已從想買清單移除《${w.title}》`;
  },
  /* 買到了：從想買清單移到書架（同名同格式的書已在書架上就數量 +1） */
  bought(L, p) {
    const w = findWish(L, p.id);
    L.wishes = L.wishes.filter((x) => x !== w);
    const same = L.books.find((b) => b.title === w.title && b.format === w.format);
    if (same) {
      same.qty++;
      return `《${w.title}》已在書架上，數量 +1`;
    }
    const location = str(p.location, 100) || (w.format === "ebook" ? "博客來電子書 App" : "");
    L.books.unshift({
      id: newId("b"),
      addedAt: Date.now(),
      title: w.title,
      author: w.author,
      format: w.format,
      qty: 1,
      location,
      link: w.link,
      cover: "",
      status: "unread",
      rating: 0,
      review: "",
      readAt: "",
    });
    return `恭喜入手！《${w.title}》已放上書架`;
  },
  /* ---------- 位置 ---------- */
  addPlace(L, p) {
    const name = str(p.name, 100);
    if (!name) throw new UserError("請輸入位置名稱");
    if (L.places.includes(name)) throw new UserError(`已經有「${name}」這個位置了`);
    L.places.push(name);
    return `已新增位置「${name}」`;
  },
  /* 改名：這個位置上的書會一起跟著改；改成已存在的名稱就合併 */
  renamePlace(L, p) {
    const from = str(p.from, 100);
    const to = str(p.to, 100);
    if (!L.places.includes(from)) throw new UserError("找不到這個位置", 404);
    if (!to) throw new UserError("請輸入位置名稱");
    if (from === to) return undefined;
    for (const b of L.books) if (b.location === from) b.location = to;
    const merged = L.places.includes(to);
    L.places = merged ? L.places.filter((x) => x !== from) : L.places.map((x) => (x === from ? to : x));
    return merged ? `已把「${from}」的書合併到「${to}」` : `已改名為「${to}」`;
  },
  /* 刪除位置：上面的書不會刪掉，只是變成「還沒記錄位置」 */
  deletePlace(L, p) {
    const name = str(p.name, 100);
    if (!L.places.includes(name)) throw new UserError("找不到這個位置", 404);
    let n = 0;
    for (const b of L.books)
      if (b.location === name) {
        b.location = "";
        n++;
      }
    L.places = L.places.filter((x) => x !== name);
    return n ? `已刪除「${name}」，${n} 本書改成未記錄位置` : `已刪除「${name}」`;
  },
  movePlace(L, p) {
    const i = L.places.indexOf(str(p.name, 100));
    const j = i + int(p.dir, -1, 1, 0);
    if (i < 0 || j < 0 || j >= L.places.length || i === j) return undefined;
    [L.places[i], L.places[j]] = [L.places[j], L.places[i]];
    return undefined;
  },
  /* 把一本書搬到某個位置（空字串 = 未記錄位置） */
  moveBook(L, p) {
    const b = findBook(L, p.id);
    b.location = str(p.location, 100);
    return b.location ? `《${b.title}》已放到「${b.location}」` : `《${b.title}》改成未記錄位置`;
  },
  rename(L, p) {
    const name = str(p.name, 40);
    if (!name) throw new UserError("請輸入圖書館名稱");
    L.name = name;
    return "已更新圖書館名稱";
  },
};
