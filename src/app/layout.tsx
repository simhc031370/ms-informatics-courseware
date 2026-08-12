import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "중학교 정보 교과 코스웨어 | Informatics Courseware",
  description:
    "2022 개정 교육과정 중학교 정보과 성취기준 기반 실시간 수업 코스웨어 (Informatics Courseware)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Jua&family=Nunito:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
