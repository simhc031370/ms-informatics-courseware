"use client";

import { useState } from "react";
import type { AiProvider, AssessmentQuestion, AssessmentSubmission } from "@/types";
import { v4 as uuid } from "uuid";

export function AssessmentPanel({
  lessonId,
  questions,
  provider,
  apiKey,
  roomCode,
  studentId,
  studentName,
  onSubmitted,
}: {
  lessonId: string;
  questions: AssessmentQuestion[];
  provider: AiProvider;
  apiKey: string;
  roomCode?: string;
  studentId?: string;
  studentName?: string;
  onSubmitted?: (submission: AssessmentSubmission, score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setLoading(true);
    setError("");
    const fb: Record<string, string> = {};
    let total = 0;
    let graded = 0;

    try {
      for (const q of questions) {
        const ans = (answers[q.id] || "").trim();
        if (!ans) continue;

        if (q.type === "short" && q.sampleAnswer) {
          const ok =
            ans.replace(/\s/g, "").includes(q.sampleAnswer.replace(/\s/g, "").slice(0, 8)) ||
            q.sampleAnswer.replace(/\s/g, "").includes(ans.replace(/\s/g, "").slice(0, 8));
          const s = ok ? 90 : 55;
          total += s;
          graded += 1;
          fb[q.id] = ok
            ? `모범 답안과 유사합니다. (+참고: ${q.sampleAnswer})`
            : `더 정확하게 다듬어 보세요. 참고 답안: ${q.sampleAnswer}`;
        } else {
          try {
            const res = await fetch("/api/ai/feedback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "essay",
                provider,
                apiKey,
                roomCode,
                question: q.prompt,
                answer: ans,
                rubric: q.rubric,
                sample: q.sampleAnswer,
              }),
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error || "채점 실패");
            fb[q.id] = data.feedback;
            if (typeof data.score === "number") {
              total += data.score;
              graded += 1;
            }
          } catch (err) {
            fb[q.id] =
              err instanceof Error
                ? `서술형 AI 채점 대기/실패: ${err.message} (답안은 교사에게 제출됩니다)`
                : "서술형 AI 채점 실패. 답안은 교사에게 제출됩니다.";
          }
        }
      }

      const finalScore = graded ? Math.round(total / graded) : 0;
      setFeedback(fb);
      setScore(finalScore);

      const submission: AssessmentSubmission = {
        id: uuid(),
        studentId: studentId || "anonymous",
        studentName: studentName || "익명",
        lessonId,
        answers,
        autoScore: finalScore,
        aiFeedback: Object.values(fb).join("\n\n"),
        submittedAt: Date.now(),
        graded: true,
      };
      onSubmitted?.(submission, finalScore);
    } catch (e) {
      setError(e instanceof Error ? e.message : "제출 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass rounded-2xl p-5 space-y-4">
      <h3 className="brand-display text-xl">형성평가</h3>
      <p className="text-sm opacity-80">주관식·서술형으로 이해한 내용을 정리해 보세요.</p>
      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-xl border bg-white p-4 space-y-2">
          <div className="text-sm font-semibold">
            {idx + 1}. [{q.type === "short" ? "주관식" : "서술형"}] {q.prompt}
          </div>
          <textarea
            className="w-full min-h-24 rounded-xl border p-3"
            value={answers[q.id] || ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
          />
          {feedback[q.id] && (
            <div className="text-sm rounded-lg bg-[var(--sand)] p-3 whitespace-pre-wrap">
              {feedback[q.id]}
            </div>
          )}
        </div>
      ))}
      <button
        onClick={submit}
        disabled={loading}
        className="px-4 py-2 rounded-xl bg-[var(--coral)] text-white disabled:opacity-50"
      >
        {loading ? "채점 중..." : "제출하고 피드백 받기"}
      </button>
      {score != null && (
        <p className="font-semibold text-[var(--mint)]">형성평가 점수: {score}점</p>
      )}
      {error && <p className="text-sm text-[var(--coral)]">{error}</p>}
    </section>
  );
}
