import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 👈 Geist 대신 Inter 가져오기
import "./globals.css";
import { Providers } from "./providers";

// 폰트 설정 변경
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "x402 Agent",
  description: "AI Economic Operator with Wallet Connection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 👇 폰트 클래스 적용 부분 변경 */}
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}