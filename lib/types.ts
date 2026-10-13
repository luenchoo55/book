/* 圖書館的資料格式（前端、後端共用） */

export type Format = "paper" | "ebook";
export type Status = "unread" | "reading" | "done";

export type Book = {
  id: string;
  title: string;
  author: string;
  format: Format;
  qty: number; // 擁有幾本
  location: string; // 放在哪裡，例如「客廳書架第 2 層」「博客來 App」
  link: string; // 網路連結（博客來或其他）
  cover: string; // 封面圖片網址；空白就用博客來連結自動推算
  status: Status;
  rating: number; // 0～5 顆星，0 = 還沒評分
  review: string; // 閱讀感想
  readAt: string; // 讀完日期 YYYY-MM-DD
  addedAt: number;
};

export type Wish = {
  id: string;
  title: string;
  author: string;
  format: Format;
  link: string;
  price: string;
  note: string;
  priority: 1 | 2 | 3; // 1 = 最想買
  addedAt: number;
};

export type Library = {
  name: string;
  books: Book[];
  wishes: Wish[];
  places: string[]; // 自己管理的位置清單（順序就是顯示順序）
};

export type OpResult = { library: Library; msg?: string };
