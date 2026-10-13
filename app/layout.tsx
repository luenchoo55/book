import type { Metadata, Viewport } from "next";
import { Alegreya } from "next/font/google";
import "./globals.css";

/* 英文與數字：Alegreya（書卷感）。
   中文：霞鶩文楷（手寫感）字檔很大，不用 next/font 整包下載，改由瀏覽器向 Google Fonts 按需載入用到的字 */
const alegreya = Alegreya({ variable: "--font-alegreya", weight: ["500", "700", "800"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "我的圖書館",
  description: "記錄藏書、閱讀感想、想買的書與書的位置",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2b3725",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={alegreya.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- 根 layout 會套用到所有頁面 */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@400;700&display=swap" />
      </head>
      <body>
        {/* 手繪線條濾鏡：globals.css 的 sketch／paper 用它讓框線微微抖動 */}
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id="sketch">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="1.8" />
          </filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
