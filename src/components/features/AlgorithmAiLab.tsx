"use client";

import { useMemo, useState } from "react";
import type { AiProvider } from "@/types";

const PROBLEMS = [
  "점심시간에 급식실 대기 줄을 줄이는 방법을 알고리즘으로 설계하세요. 입력(학생 수, 배식구 수 등)과 처리 단계를 분명히 쓰세요.",
  "도서관에서 원하는 책을 찾는 과정을 현재 상태·목표 상태·단계로 구조화하세요.",
  "교실 온도가 28℃ 이상이면 창문을 열고 알림을 주는 피지컬+알고리즘을 의사코드로 작성하세요.",
  "학급 설문 응답 30개를 모아 가장 인기 있는 급식 메뉴를 찾는 알고리즘을 쓰세요.",
  "지각생을 줄이기 위해 등교 시각 데이터를 분석하는 절차를 단계적으로 설계하세요.",
];

export function AlgorithmAiLab({
  provider,
  apiKey,
  roomCode,
}: {
  provider: AiProvider;
  apiKey: string;
  roomCode?: string;
}) {
  const [seed, setSeed] = useState(0);
  const problem = useMemo(() => PROBLEMS[seed % PROBLEMS.length], [seed]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function requestFeedback() {
    setLoading(true);
    setError("");
    setFeedback("");
    try {
      const res = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "algorithm",
          provider,
          apiKey,
          roomCode,
          problem,
          answer,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "실패");
      setFeedback(data.feedback);
    } catch (e) {
      setError(e instanceof Error ? e.message : "요청 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="brand-display text-xl">알고리즘 AI 피드백 랩</h3>
        <button
          className="px-3 py-1.5 rounded-full bg-[var(--sky)] text-white text-sm"
          onClick={() => {
            setSeed((s) => s + 1 + Math.floor(Math.random() * 3));
            setAnswer("");
            setFeedback("");
          }}
        >
          새 문제 받기
        </button>
      </div>
      <div className="rounded-xl bg-[var(--sand)] p-4 text-sm leading-relaxed">{problem}</div>
      <textarea
        className="w-full min-h-40 rounded-xl border p-3 bg-white"
        placeholder="의사코드나 단계별 알고리즘을 작성하세요..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <button
        disabled={loading || !answer.trim()}
        onClick={requestFeedback}
        className="px-4 py-2 rounded-xl bg-[var(--mint)] text-white disabled:opacity-50"
      >
        {loading ? "AI 분석 중..." : "AI 피드백 요청"}
      </button>
      {!apiKey && !roomCode && (
        <p className="text-sm text-[var(--coral)]">
          교사 페이지에서 AI API 키를 설정해야 피드백을 받을 수 있습니다.
        </p>
      )}
      {error && <p className="text-sm text-[var(--coral)]">{error}</p>}
      {feedback && (
        <div className="rounded-xl border p-4 whitespace-pre-wrap text-sm leading-relaxed bg-white">
          {feedback}
        </div>
      )}
    </div>
  );
}
