import type { Metadata, Viewport } from "next";
import { Courier_Prime, Noto_Serif_TC, Special_Elite } from "next/font/google";
import "./globals.css";

/* 中文：思源宋體（書卷感）；英文與數字：打字機字體，做出復古圖書館的感覺 */
const serifTC = Noto_Serif_TC({ variable: "--font-serif-tc", weight: ["400", "600", "900"], preload: false });
const courier = Courier_Prime({ variable: "--font-courier", weight: ["400", "700"], subsets: ["latin"] });
const elite = Special_Elite({ variable: "--font-special-elite", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "我的圖書館",
  description: "記錄藏書、閱讀感想、想買的書與書的位置",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#21170f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${serifTC.variable} ${courier.variable} ${elite.variable}`}>
      <body>{children}</body>
    </html>
  );
}
