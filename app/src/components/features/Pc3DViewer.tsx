"use client";

import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { useMemo, useState } from "react";

type Part = {
  id: string;
  label: string;
  desc: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
};

const parts: Part[] = [
  {
    id: "case",
    label: "케이스/메인보드 공간",
    desc: "부품을 고정하고 연결하는 뼈대입니다.",
    position: [0, 0, 0],
    size: [3.2, 2.4, 0.15],
    color: "#2C3E50",
  },
  {
    id: "cpu",
    label: "CPU",
    desc: "연산과 제어를 담당하는 두뇌입니다. 명령어를 실행합니다.",
    position: [-0.4, 0.35, 0.2],
    size: [0.7, 0.7, 0.2],
    color: "#F4D03F",
  },
  {
    id: "ram",
    label: "RAM",
    desc: "실행 중인 프로그램과 데이터를 임시로 저장합니다. 전원이 꺼지면 사라집니다.",
    position: [0.9, 0.5, 0.2],
    size: [0.25, 1.2, 0.2],
    color: "#27AE60",
  },
  {
    id: "gpu",
    label: "GPU",
    desc: "그래픽·병렬 연산을 담당합니다. 게임·AI에도 활용됩니다.",
    position: [0, -0.55, 0.35],
    size: [1.6, 0.35, 0.45],
    color: "#8E44AD",
  },
  {
    id: "ssd",
    label: "SSD",
    desc: "운영체제·파일 등을 영구 저장합니다. RAM보다 느리지만 전원이 꺼져도 유지됩니다.",
    position: [-1.1, -0.5, 0.2],
    size: [0.7, 0.35, 0.15],
    color: "#2980B9",
  },
  {
    id: "psu",
    label: "전원공급장치",
    desc: "각 부품에 필요한 전력을 안정적으로 공급합니다.",
    position: [1.1, -0.7, 0.25],
    size: [0.7, 0.55, 0.35],
    color: "#C0392B",
  },
];

function PartMesh({
  part,
  selected,
  onSelect,
}: {
  part: Part;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <group position={part.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <RoundedBox args={part.size} radius={0.04} smoothness={4}>
        <meshStandardMaterial
          color={part.color}
          emissive={selected ? part.color : "#000"}
          emissiveIntensity={selected ? 0.35 : 0}
        />
      </RoundedBox>
      {selected && (
        <Html distanceFactor={8} position={[0, part.size[1] / 2 + 0.25, 0]}>
          <div className="rounded-lg bg-white/95 px-2 py-1 text-xs shadow border whitespace-nowrap">
            {part.label}
          </div>
        </Html>
      )}
    </group>
  );
}

export function Pc3DViewer() {
  const [selected, setSelected] = useState("cpu");
  const current = useMemo(() => parts.find((p) => p.id === selected)!, [selected]);

  return (
    <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
      <div className="glass rounded-2xl overflow-hidden h-[380px]">
        <Canvas camera={{ position: [3.5, 2.2, 4.2], fov: 42 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 6, 4]} intensity={1.1} />
          {parts.map((p) => (
            <PartMesh
              key={p.id}
              part={p}
              selected={selected === p.id}
              onSelect={() => setSelected(p.id)}
            />
          ))}
          <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
        </Canvas>
      </div>
      <div className="glass rounded-2xl p-5">
        <h3 className="brand-display text-xl mb-2">3D PC 탐구</h3>
        <p className="text-sm opacity-80 mb-4">부품을 클릭하거나 아래 버튼을 눌러 역할을 확인하세요.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {parts.filter((p) => p.id !== "case").map((p) => (
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
