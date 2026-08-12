"use client";

import { useMemo, useState } from "react";

function clean(value: string, base: number) {
  const v = value.trim().toUpperCase();
  if (!v) return null;
  const n = parseInt(v, base);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

export function NumberBaseLab() {
  const [dec, setDec] = useState("45");
  const n = useMemo(() => clean(dec, 10), [dec]);

  const bin = n == null ? "-" : n.toString(2);
  const oct = n == null ? "-" : n.toString(8);
  const hex = n == null ? "-" : n.toString(16).toUpperCase();

  const [fromBase, setFromBase] = useState(2);
  const [fromValue, setFromValue] = useState("101101");
  const converted = useMemo(() => {
    const num = clean(fromValue, fromBase);
    if (num == null) return null;
    return {
      dec: String(num),
      bin: num.toString(2),
      oct: num.toString(8),
      hex: num.toString(16).toUpperCase(),
    };
  }, [fromBase, fromValue]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5">
        <h3 className="brand-display text-xl mb-2">진법 변환 실습실</h3>
        <p className="text-sm opacity-80 mb-4">
          10진수를 입력하면 2·8·16진수로 바로 변환됩니다. 자리값 원리를 떠올리며 연습하세요.
        </p>
        <label className="text-sm font-medium">10진수 입력</label>
        <input
          className="mt-1 w-full rounded-xl border px-3 py-2 bg-white"
          value={dec}
          onChange={(e) => setDec(e.target.value)}
        />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            ["2진수", bin],
            ["8진수", oct],
            ["16진수", hex],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-[var(--sand)] p-3">
              <div className="text-xs opacity-70">{k}</div>
              <div className="font-mono text-lg break-all">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h4 className="font-semibold mb-3">임의 진법 → 상호 변환</h4>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-sm">출발 진법</label>
            <select
              className="block mt-1 rounded-xl border px-3 py-2 bg-white"
              value={fromBase}
              onChange={(e) => setFromBase(Number(e.target.value))}
            >
              <option value={2}>2진법</option>
              <option value={8}>8진법</option>
              <option value={10}>10진법</option>
              <option value={16}>16진법</option>
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-sm">값</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2 bg-white font-mono"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
            />
          </div>
        </div>
        {converted ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
            <div className="rounded-xl border p-3">10진: <b className="font-mono">{converted.dec}</b></div>
            <div className="rounded-xl border p-3">2진: <b className="font-mono">{converted.bin}</b></div>
            <div className="rounded-xl border p-3">8진: <b className="font-mono">{converted.oct}</b></div>
            <div className="rounded-xl border p-3">16진: <b className="font-mono">{converted.hex}</b></div>
          </div>
        ) : (
          <p className="text-sm text-[var(--coral)] mt-3">입력값이 해당 진법에 맞지 않습니다.</p>
        )}
      </div>

      <div className="glass rounded-2xl p-5 text-sm leading-relaxed space-y-2">
        <h4 className="font-semibold">디지털 표현 한눈에</h4>
        <p>• 문자: 유니코드/ASCII로 문자를 숫자 코드에 대응 (예: A → 65 → 1000001₂)</p>
        <p>• 그림: 픽셀의 RGB 값을 비트로 저장. 해상도·색깊이가 용량을 좌우</p>
        <p>• 소리: 표본화 → 양자화 → 부호화. 표본률·비트심도가 음질과 용량을 결정</p>
      </div>
    </div>
  );
}
