"use client";

import { useMemo, useState } from "react";
import { getLessonById, lessonPathLabel } from "@/data/curriculum";
import { summarizeAiFeedback } from "@/lib/ai-summary";
import type { AssessmentSubmission } from "@/types";

export function StudentGradesPanel({
  submissions,
}: {
  submissions: AssessmentSubmission[];
}) {
  const [focusId, setFocusId] = useState("");

  const sorted = useMemo(
    () =>
      [...submissions].sort(
        (a, b) => (b.returnedAt || b.submittedAt) - (a.returnedAt || a.submittedAt)
      ),
    [submissions]
  );

  const returned = sorted.filter((s) => s.status === "returned");
  const pending = sorted.filter((s) => s.status !== "returned");
  const focus = sorted.find((s) => s.id === focusId) || returned[0] || sorted[0];

  if (sorted.length === 0) {
    return (
      <section className="panel-card">
        <h2 className="section-title">내 성적</h2>
        <p className="text-muted">
          아직 저장된 형성평가가 없습니다. 수업에서 답안을 작성하고 저장하면 여기에 나타납니다.
          선생님이 점수를 돌려주면 점수와 짧은 피드백을 확인할 수 있어요.
        </p>
      </section>
    );
  }

  const aiText =
    focus?.aiSummary ||
    (focus ? summarizeAiFeedback(focus.questionFeedback, focus.aiFeedback, 5) : "");

  return (
    <section className="space-y-4">
      <div className="panel-card">
        <h2 className="section-title">내 성적</h2>
        <p className="text-muted">
          반환 {returned.length}건 · 대기 {pending.length}건 · 선생님이 돌려준 점수와 피드백을
          확인하세요.
        </p>
      </div>

      <div className="grades-layout">
        <div className="panel-card list-scroll">
          {sorted.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setFocusId(s.id)}
              className={`grade-item ${focus?.id === s.id ? "active" : ""}`}
            >
              <div className="font-semibold">
                {lessonPathLabel(s.lessonId).split(" › ").slice(-1)[0]}
              </div>
              <div className="text-xs opacity-70 mt-0.5">
                {s.status === "returned" ? (
                  <>
                    <span className="score-chip">{s.autoScore ?? "-"}점</span> · 확인 가능
                  </>
                ) : s.status === "graded" ? (
                  "채점 중 · 곧 결과가 도착해요"
                ) : (
                  "저장됨 · 선생님 채점 대기"
                )}
              </div>
            </button>
          ))}
        </div>

        {focus && (
          <div className="panel-card space-y-4 min-w-0">
            <div>
              <div className="text-xs opacity-60">수업</div>
              <div className="font-semibold text-lg">{lessonPathLabel(focus.lessonId)}</div>
              {focus.status === "returned" ? (
                <div className="mt-3 flex items-end gap-2">
                  <span className="score-hero">{focus.autoScore ?? "-"}</span>
                  <span className="text-sm opacity-70 mb-1">점 / 100</span>
                </div>
              ) : (
                <p className="mt-2 text-muted">아직 점수가 도착하지 않았습니다.</p>
              )}
            </div>

            {focus.status === "returned" && (
              <div className="space-y-3">
                {focus.teacherFeedback && (
                  <div className="feedback-card teacher">
                    <div className="feedback-label">선생님 피드백</div>
                    <p className="whitespace-pre-wrap">{focus.teacherFeedback}</p>
                  </div>
                )}
                <div className="feedback-card ai">
                  <div className="feedback-label">AI 피드백 (종합)</div>
                  <p className="ai-summary-text">{aiText}</p>
                </div>
              </div>
            )}

            <div>
              <div className="font-semibold text-sm mb-2">문항별 확인</div>
              <div className="space-y-2">
                {(getLessonById(focus.lessonId)?.assessment || []).map((q, idx) => (
                  <div key={q.id} className="answer-block">
                    <div className="text-xs opacity-60 mb-1">
                      {idx + 1}. {q.prompt}
                    </div>
                    <div className="whitespace-pre-wrap opacity-90">
                      {focus.answers[q.id] || "(빈 답안)"}
                    </div>
                    {focus.status === "returned" && focus.questionScores?.[q.id] != null && (
                      <div className="mt-2 text-xs font-semibold text-[var(--mint)]">
                        {focus.questionScores[q.id]}점
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
