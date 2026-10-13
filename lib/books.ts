import type { Format, Status } from "./types";

/* 前後端都會用到的小工具：標籤文字、連結推算 */

export const FORMAT_LABEL: Record<Format, string> = { paper: "實體書", ebook: "電子書" };
export const STATUS_LABEL: Record<Status, string> = { unread: "未讀", reading: "閱讀中", done: "已讀完" };

/* 博客來商品網址裡的商品編號，例如 https://www.books.com.tw/products/E050012345 → E050012345 */
export function booksComId(url: string) {
  const m = url.match(/books\.com\.tw\/(?:products|exep\/prod\/booksfile\.php\?item=)\/?([0-9A-Z]{10})/i);
  return m ? m[1].toUpperCase() : null;
}

/* 用博客來商品編號推算封面圖 */
export function coverOf(b: { cover?: string; link: string }) {
  if (b.cover) return b.cover;
  const id = booksComId(b.link);
  if (!id) return "";
  return `https://www.books.com.tw/img/${id.slice(0, 3)}/${id.slice(3, 6)}/${id.slice(6, 8)}/${id}.jpg`;
}

/* 沒有附連結時，提供「搜尋本書」：開新分頁用 Google 搜尋書名 */
export const searchWeb = (title: string) => `https://www.google.com/search?q=${encodeURIComponent(title)}`;

export const linkOf = (b: { link: string; title: string }) => b.link || searchWeb(b.title);

export const isBooksCom = (url: string) => /books\.com\.tw/i.test(url);
