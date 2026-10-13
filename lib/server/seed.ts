import type { Library } from "../types";

/* 第一次打開時的示範資料，之後可以在網站上刪掉 */
export function seedLibrary(): Library {
  const now = Date.now();
  const day = 86_400_000;
  return {
    name: "我的圖書館",
    books: [
      {
        id: "b1",
        title: "原子習慣",
        author: "詹姆斯・克利爾",
        format: "ebook",
        qty: 1,
        location: "博客來電子書 App",
        link: "",
        cover: "",
        status: "done",
        rating: 5,
        review: "每天進步 1%，一年後會變成 37 倍。把好習慣設計得「顯而易見、有吸引力、簡單、令人滿足」。",
        readAt: new Date(now - 20 * day).toISOString().slice(0, 10),
        addedAt: now - 40 * day,
      },
      {
        id: "b2",
        title: "小王子",
        author: "安東尼・聖修伯里",
        format: "paper",
        qty: 2,
        location: "客廳書架第 2 層",
        link: "",
        cover: "",
        status: "reading",
        rating: 0,
        review: "",
        readAt: "",
        addedAt: now - 10 * day,
      },
      {
        id: "b3",
        title: "被討厭的勇氣",
        author: "岸見一郎、古賀史健",
        format: "paper",
        qty: 1,
        location: "臥室床頭櫃",
        link: "",
        cover: "",
        status: "unread",
        rating: 0,
        review: "",
        readAt: "",
        addedAt: now - 3 * day,
      },
    ],
    places: ["客廳書架第 2 層", "臥室床頭櫃", "博客來電子書 App"],
    wishes: [
      {
        id: "w1",
        title: "蛤蟆先生去看心理師",
        author: "羅伯・狄保德",
        format: "ebook",
        link: "",
        price: "",
        note: "朋友推薦",
        priority: 1,
        addedAt: now - 2 * day,
      },
    ],
  };
}
