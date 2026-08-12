"use client";

type BrandSize = "sm" | "md" | "lg" | "hero";

export function BrandMark({ size = "md", align = "left" }: { size?: BrandSize; align?: "left" | "center" }) {
  return (
    <div className={`brand-mark brand-${size} brand-align-${align}`}>
      <div className="brand-ko">
        <span className="brand-ko-line">중학교 정보 교과</span>
        <span className="brand-ko-line">코스웨어</span>
      </div>
      <div className="brand-en">Informatics Courseware</div>
    </div>
  );
}
