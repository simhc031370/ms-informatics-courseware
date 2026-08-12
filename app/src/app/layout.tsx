import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "중학교 정보 코스웨어 | 2022 개정 교육과정",
  description:
    "2022 개정 교육과정 중학교 정보과 성취기준 기반 실시간 수업 코스웨어",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
