"use client";

import { useMemo, useState } from "react";
import type { AssessmentQuestion, AssessmentSubmission } from "@/types";
import { summarizeAiFeedback } from "@/lib/ai-summary";
import { v4 as uuid } from "uuid";

export function AssessmentPanel({
  lessonId,
  questions,
  studentId,
  studentName,
  myResult,
  onSaved,
}: {
  lessonId: string;
  questions: AssessmentQuestion[];
  studentId?: string;
  studentName?: string;
  /** 교사가 돌려준 채점 결과(이 수업) */
  myResult?: AssessmentSubmission | null;
  onSaved?: (submission: AssessmentSubmission) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => myResult?.answers || {});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const returned = myResult?.status === "returned" ? myResult : null;

  const displayAnswers = useMemo(() => {
    if (returned) return returned.answers;
    return answers;
  }, [returned, answers]);

  function save() {
    setLoading(true);
    setError("");
    try {
      const filled = Object.values(answers).some((a) => a.trim());
      if (!filled) {
        setError("답안을 작성한 뒤 저장해 주세요.");
        return;
      }
      const submission: AssessmentSubmission = {
        id: uuid(),
        studentId: studentId || "anonymous",
        studentName: studentName || "익명",
        lessonId,
        answers: { ...answers },
        submittedAt: Date.now(),
        graded: false,
        status: "saved",
      };
      onSaved?.(submission);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass rounded-2xl p-5 space-y-4">
      <h3 className="brand-display text-xl">형성평가</h3>
      <p className="text-sm opacity-80 leading-relaxed">
        답안을 작성한 뒤 <b>저장</b>하면 선생님에게 전달됩니다. 점수는 선생님이 채점해 돌려주면
        상단 <b>내 성적</b> 탭에서 확인할 수 있어요.
      </p>

      {returned && (
        <div className="rounded-xl border border-[var(--mint)] bg-[#e8f6ef] px-4 py-3 text-sm">
          <div className="font-semibold text-[var(--mint)]">
            채점 결과 · {returned.autoScore ?? "-"}점
          </div>
          <p className="opacity-80 mt-1">선생님이 점수를 돌려주었습니다.</p>
        </div>
      )}

      {!returned && saved && (
        <div className="rounded-xl border border-[#f0c48a] bg-[#fff4e8] px-4 py-3 text-sm">
          저장 완료 · 선생님 채점 대기 중입니다. 결과가 오면 이 화면에서 확인할 수 있습니다.
        </div>
      )}

      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-xl border bg-white p-4 space-y-2">
          <div className="text-sm font-semibold">
            {idx + 1}. [{q.type === "short" ? "주관식" : "서술형"}] {q.prompt}
          </div>
          <textarea
            className="w-full min-h-24 rounded-xl border p-3"
            value={displayAnswers[q.id] || ""}
            disabled={Boolean(returned)}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
          />
          {returned?.questionScores?.[q.id] != null && (
            <div className="text-xs font-semibold text-[var(--mint)]">
              문항 점수: {returned.questionScores[q.id]}점
            </div>
          )}
        </div>
      ))}

      {!returned && (
        <button
          onClick={save}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[var(--coral)] text-white disabled:opacity-50"
        >
          {loading ? "저장 중..." : saved ? "다시 저장" : "저장"}
        </button>
      )}

      {returned && (
        <div className="space-y-2">
          {returned.teacherFeedback && (
            <div className="feedback-card teacher">
              <div className="feedback-label">선생님 피드백</div>
              <p className="whitespace-pre-wrap text-sm">{returned.teacherFeedback}</p>
            </div>
          )}
          <div className="feedback-card ai">
            <div className="feedback-label">AI 피드백 (종합 · 5줄 이내)</div>
            <p className="ai-summary-text">
              {returned.aiSummary ||
                summarizeAiFeedback(returned.questionFeedback, returned.aiFeedback, 5)}
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-[var(--coral)]">{error}</p>}
    </section>
  );
}
