"use client";

import { useMemo, useState } from "react";

type Example = { text: string; label: string };

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^0-9a-z가-힣\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** 교육용 간단 나이브 베이즈 유사 분류기 */
function train(examples: Example[]) {
  const labels = Array.from(new Set(examples.map((e) => e.label)));
  const labelCount: Record<string, number> = {};
  const wordCount: Record<string, Record<string, number>> = {};
  const vocab = new Set<string>();

  for (const label of labels) {
    labelCount[label] = 0;
    wordCount[label] = {};
  }

  for (const ex of examples) {
    labelCount[ex.label] += 1;
    for (const w of tokenize(ex.text)) {
      vocab.add(w);
      wordCount[ex.label][w] = (wordCount[ex.label][w] || 0) + 1;
    }
  }

  return { labels, labelCount, wordCount, vocab, total: examples.length };
}

function predict(model: ReturnType<typeof train>, text: string) {
  const words = tokenize(text);
  let best = model.labels[0];
  let bestScore = -Infinity;
  const scores: Record<string, number> = {};

  for (const label of model.labels) {
    let score = Math.log((model.labelCount[label] + 1) / (model.total + model.labels.length));
    const totalWords =
      Object.values(model.wordCount[label]).reduce((a, b) => a + b, 0) + model.vocab.size;
    for (const w of words) {
      const c = (model.wordCount[label][w] || 0) + 1;
      score += Math.log(c / totalWords);
    }
    scores[label] = score;
    if (score > bestScore) {
      bestScore = score;
      best = label;
    }
  }
  return { label: best, scores };
}

const starter: Example[] = [
  { text: "오늘 날씨가 정말 좋아서 행복해", label: "긍정" },
  { text: "친구랑 놀아서 즐거웠어", label: "긍정" },
  { text: "시험 잘 봐서 신난다", label: "긍정" },
  { text: "비가 와서 기분이 우울해", label: "부정" },
  { text: "숙제가 너무 많아서 힘들어", label: "부정" },
  { text: "버스를 놓쳐서 짜증나", label: "부정" },
];

export function AiModelLab() {
  const [examples, setExamples] = useState<Example[]>(starter);
  const [text, setText] = useState("");
  const [label, setLabel] = useState("긍정");
  const [query, setQuery] = useState("오늘은 점심이 맛있어서 기분 좋아");
  const [result, setResult] = useState("");

  const model = useMemo(() => train(examples), [examples]);

  function addExample() {
    if (!text.trim() || !label.trim()) return;
    setExamples((prev) => [...prev, { text: text.trim(), label: label.trim() }]);
    setText("");
  }

  function runPredict() {
    if (examples.length < 2) {
      setResult("학습 예시를 최소 2개 이상 넣어 주세요.");
      return;
    }
    const p = predict(model, query);
    setResult(`예측 결과: ${p.label}\n(학습 데이터 ${examples.length}개, 범주 ${model.labels.join(", ")})`);
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <h3 className="brand-display text-xl">AI 모델 만들기 랩</h3>
      <p className="text-sm opacity-80">
        데이터를 직접 입력해 간단한 텍스트 분류 모델을 학습시키고 예측해 보세요. (교육용 체험 모델)
      </p>

      <div className="grid md:grid-cols-2 gap-3">
        <input
          className="rounded-xl border px-3 py-2 bg-white"
          placeholder="예시 문장"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            className="rounded-xl border px-3 py-2 bg-white flex-1"
            placeholder="라벨 (예: 긍정/부정)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <button onClick={addExample} className="px-4 rounded-xl bg-[var(--mint)] text-white">
            추가
          </button>
        </div>
      </div>

      <div className="max-h-40 overflow-auto rounded-xl border bg-white divide-y">
        {examples.map((ex, i) => (
          <div key={i} className="px-3 py-2 text-sm flex justify-between gap-2">
            <span className="truncate">{ex.text}</span>
            <span className="shrink-0 font-semibold text-[var(--sky)]">{ex.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2 bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="예측할 문장"
        />
        <button onClick={runPredict} className="px-4 py-2 rounded-xl bg-[var(--sky)] text-white">
          학습·예측 실행
        </button>
      </div>
      {result && (
        <pre className="rounded-xl bg-[var(--sand)] p-3 text-sm whitespace-pre-wrap">{result}</pre>
      )}
    </div>
  );
}
