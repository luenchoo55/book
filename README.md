# 我的圖書館

復古木頭書店風的個人圖書館：記錄藏書與數量、閱讀感想、想買的書、書放在哪裡，並附上博客來連結。

## 本機開發

```bash
npm install
npm run dev
```

打開 http://localhost:3000。登入密碼放在 `.env.local`：

```
ADMIN_PASSWORD=你的密碼
```

本機資料存在 `data/db.json`（刪掉就回到示範資料）；部署到 Vercel 時，設定 Upstash Redis 的環境變數就會改存在雲端。

## 小技巧

- 貼上博客來商品頁網址（`https://www.books.com.tw/products/…`），會自動帶出封面。
- 沒有附連結的書，會提供「到博客來搜尋」的按鈕。
- 想買清單按「買到了」，書會自動移到書櫃；同名的書已在書櫃上就數量 +1。
