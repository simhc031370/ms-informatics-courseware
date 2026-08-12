"use client";

import { useMemo, useState } from "react";

type Part = {
  id: string;
  label: string;
  desc: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
};

const parts: Part[] = [
  { id: "cpu", label: "CPU", desc: "연산과 제어를 담당하는 두뇌입니다. 명령어를 실행합니다.", x: 90, y: 70, w: 70, h: 70, color: "#F4D03F" },
  { id: "ram", label: "RAM", desc: "실행 중인 프로그램과 데이터를 임시로 저장합니다. 전원이 꺼지면 사라집니다.", x: 200, y: 50, w: 30, h: 120, color: "#27AE60" },
  { id: "gpu", label: "GPU", desc: "그래픽·병렬 연산을 담당합니다. 게임·AI에도 활용됩니다.", x: 80, y: 180, w: 160, h: 40, color: "#8E44AD" },
  { id: "ssd", label: "SSD", desc: "운영체제·파일 등을 영구 저장합니다. RAM보다 느리지만 전원이 꺼져도 유지됩니다.", x: 20, y: 180, w: 50, h: 40, color: "#2980B9" },
  { id: "psu", label: "전원공급장치", desc: "각 부품에 필요한 전력을 안정적으로 공급합니다.", x: 260, y: 160, w: 70, h: 60, color: "#C0392B" },
];

export function Pc3DViewer() {
  const [selected, setSelected] = useState("cpu");
  const current = useMemo(() => parts.find((p) => p.id === selected)!, [selected]);

  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
      <div className="glass rounded-2xl overflow-hidden p-4 bg-[#1b2631]">
        <svg viewBox="0 0 360 260" className="w-full h-[320px]">
          <rect x="10" y="20" width="340" height="220" rx="12" fill="#2C3E50" />
          <text x="24" y="48" fill="#95a5a6" fontSize="12">메인보드 (클릭하여 부품 탐구)</text>
          {parts.map((p) => (
            <g key={p.id} onClick={() => setSelected(p.id)} style={{ cursor: "pointer" }}>
              <rect
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
                rx="6"
                fill={p.color}
                opacity={selected === p.id ? 1 : 0.85}
                stroke={selected === p.id ? "#fff" : "transparent"}
                strokeWidth="3"
              />
              <text x={p.x + 8} y={p.y + 18} fill="#111" fontSize="11" fontWeight="700">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="glass rounded-2xl p-5">
        <h3 className="brand-display text-xl mb-2">PC 구성 탐구</h3>
        <p className="text-sm opacity-80 mb-4">부품을 클릭하거나 아래 버튼을 눌러 역할을 확인하세요.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {parts.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                selected === p.id ? "bg-[var(--mint)] text-white border-transparent" : "bg-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="rounded-xl bg-[var(--sand)] p-4">
          <div className="font-semibold mb-1">{current.label}</div>
          <p className="text-sm leading-relaxed">{current.desc}</p>
        </div>
      </div>
    </div>
  );
}
