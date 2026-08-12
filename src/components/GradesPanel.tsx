"use client";

import { useEffect, useMemo, useState } from "react";
import { getLessonById, lessonPathLabel } from "@/data/curriculum";
import { summarizeAiFeedback } from "@/lib/ai-summary";
import type { AssessmentSubmission } from "@/types";

type GradePatch = Partial<
  Pick<
    AssessmentSubmission,
    | "autoScore"
    | "aiFeedback"
    | "aiSummary"
    | "questionFeedback"
    | "questionScores"
    | "teacherFeedback"
    | "graded"
    | "gradedAt"
    | "status"
  >
>;

type DetailPanel = "answers" | "ai" | "teacher";

export function GradesPanel({
  submissions,
  roomCode,
  hasApiKey,
  apiKey,
  provider,
  onGrade,
  onReturn,
}: {
  submissions: AssessmentSubmission[];
  roomCode: string;
  hasApiKey: boolean;
  apiKey: string;
  provider: "gpt" | "gemini" | "claude";
  onGrade: (id: string, patch: GradePatch) => void;
  onReturn: (ids: string[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focusId, setFocusId] = useState("");
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [draftScores, setDraftScores] = useState<Record<string, string>>({});
  const [draftTeacherFb, setDraftTeacherFb] = useState<Record<string, string>>({});
  const [panel, setPanel] = useState<DetailPanel>("answers");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return submissions;
    return submissions.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        lessonPathLabel(s.lessonId).toLowerCase().includes(q)
    );
  }, [submissions, filter]);

  const focus = filtered.find((s) => s.id === focusId) || filtered[0];
  const pending = filtered.filter((s) => s.status === "saved");
  const gradedReady = filtered.filter((s) => s.status === "graded");
  const selected = filtered.filter((s) => selectedIds.includes(s.id));

  useEffect(() => {
    if (!focus) return;
    setDraftTeacherFb((prev) =>
      prev[focus.id] !== undefined ? prev : { ...prev, [focus.id]: focus.teacherFeedback || "" }
    );
  }, [focus?.id, focus?.teacherFeedback]);

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAllPending() {
    setSelectedIds(pending.map((s) => s.id));
  }

  function selectAllGraded() {
    setSelectedIds(gradedReady.map((s) => s.id));
  }

  function statusLabel(s: AssessmentSubmission) {
    if (s.status === "returned") return "반환됨";
    if (s.status === "graded") return "채점됨(미반환)";
    return "채점 대기";
  }

  async function gradeOne(sub: AssessmentSubmission): Promise<GradePatch> {
    const lesson = getLessonById(sub.lessonId);
    if (!lesson) throw new Error(`수업을 찾을 수 없습니다: ${sub.lessonId}`);

    const questionFeedback: Record<string, string> = {};
    const questionScores: Record<string, number> = {};
    let total = 0;
    let count = 0;

    for (const q of lesson.assessment) {
      const answer = (sub.answers[q.id] || "").trim();
      if (!answer) {
        questionFeedback[q.id] = "답안이 비어 있습니다.";
        questionScores[q.id] = 0;
        total += 0;
        count += 1;
        continue;
      }

      const res = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "essay",
          roomCode,
          provider,
          apiKey,
          question: q.prompt,
          answer,
          rubric: q.rubric || (q.type === "short" ? "핵심 개념 정확성" : "성취기준 이해, 논리, 구체성"),
          sample: q.sampleAnswer,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "AI 채점 실패");

      const score =
        typeof data.score === "number"
          ? data.score
          : Number(String(data.feedback).match(/(\d{1,3})\s*점/)?.[1] || 70);

      questionFeedback[q.id] = data.feedback;
      questionScores[q.id] = Math.min(100, Math.max(0, score));
      total += questionScores[q.id];
      count += 1;
    }

    const autoScore = count ? Math.round(total / count) : 0;
    const aiFeedback = Object.entries(questionFeedback)
      .map(([qid, fb]) => `[${qid}] ${fb}`)
      .join("\n\n");
    return {
      autoScore,
      aiFeedback,
      aiSummary: summarizeAiFeedback(questionFeedback, aiFeedback, 5),
      questionFeedback,
      questionScores,
      graded: true,
      gradedAt: Date.now(),
      status: "graded",
    };
  }

  async function runAiGrade() {
    const targets = selected.filter((s) => s.status === "saved" || s.status === "graded");
    if (targets.length === 0) {
      setErr("채점할 제출을 선택하세요. (채점 대기 또는 재채점)");
      return;
    }
    if (!hasApiKey && !apiKey.trim()) {
      setErr("개인설정에서 API 키를 먼저 등록하세요.");
      return;
    }

    setBusy(true);
    setErr("");
    setMsg("");
    let ok = 0;
    try {
      for (const sub of targets) {
        const patch = await gradeOne(sub);
        onGrade(sub.id, patch);
        setDraftScores((prev) => ({ ...prev, [sub.id]: String(patch.autoScore ?? 0) }));
        ok += 1;
      }
      setMsg(`AI 보조교사 채점 완료: ${ok}건. AI 코멘트를 확인하고 교사 피드백을 적은 뒤 돌려주세요.`);
      setPanel("ai");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "채점 실패");
    } finally {
      setBusy(false);
    }
  }

  function applyDraftScore(id: string) {
    const raw = draftScores[id];
    if (raw == null || raw === "") return;
    const n = Math.min(100, Math.max(0, Math.round(Number(raw))));
    if (Number.isNaN(n)) return;
    const current = submissions.find((s) => s.id === id);
    onGrade(id, {
      autoScore: n,
      graded: true,
      gradedAt: Date.now(),
      ...(current?.status === "returned" ? { status: "returned" as const } : { status: "graded" as const }),
    });
    setMsg("점수를 저장했습니다.");
  }

  function saveTeacherFeedback(id: string) {
    const text = (draftTeacherFb[id] ?? "").trim();
    const current = submissions.find((s) => s.id === id);
    onGrade(id, {
      teacherFeedback: text,
      ...(current?.status === "returned" ? { status: "returned" as const } : {}),
    });
    setMsg(
      current?.status === "returned"
        ? "교사 피드백을 저장했고 학생 화면에 바로 반영됩니다."
        : "교사 피드백을 저장했습니다. 돌려주기 시 학생에게 보입니다."
    );
  }

  function returnSelected() {
    const ids = selected.filter((s) => s.graded && s.status !== "returned").map((s) => s.id);
    if (ids.length === 0) {
      setErr("돌려줄 채점 완료 건을 선택하세요.");
      return;
    }
    for (const id of ids) {
      applyDraftScore(id);
      const fb = (draftTeacherFb[id] ?? "").trim();
      if (fb) onGrade(id, { teacherFeedback: fb });
    }
    onReturn(ids);
    setMsg(`${ids.length}건의 점수·피드백을 학생에게 돌려주었습니다.`);
    setErr("");
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  }

  const hasAi =
    Boolean(focus?.aiFeedback) ||
    Boolean(focus?.questionFeedback && Object.keys(focus.questionFeedback).length);

  if (submissions.length === 0) {
    return (
      <section className="glass rounded-2xl p-6 soft-card">
        <h2 className="brand-display text-2xl mb-2">성적 (형성평가)</h2>
        <p className="text-sm opacity-70">아직 저장된 형성평가가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="glass rounded-2xl p-5 space-y-3 soft-card">
        <div>
          <h2 className="brand-display text-2xl mb-1">성적 (형성평가)</h2>
          <p className="text-sm opacity-70">
            대기 {pending.length} · 채점됨 {gradedReady.length} · 전체 {submissions.length}건 · AI
            코멘트 확인 후 교사 피드백을 적어 돌려주세요.
          </p>
        </div>
        <input
          className="w-full rounded-xl border px-3 py-2 bg-white text-sm"
          placeholder="학생 이름 또는 수업명 검색"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={selectAllPending} className="px-3 py-1.5 rounded-lg text-sm border bg-white">
            대기분 전체 선택
          </button>
          <button type="button" onClick={selectAllGraded} className="px-3 py-1.5 rounded-lg text-sm border bg-white">
            미반환 채점분 선택
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="px-3 py-1.5 rounded-lg text-sm border bg-white"
          >
            선택 해제
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={runAiGrade}
            className="px-3 py-1.5 rounded-lg text-sm bg-[var(--sky)] text-white disabled:opacity-50"
          >
            {busy ? "AI 채점 중..." : `선택 ${selected.length}건 AI 채점`}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={returnSelected}
            className="px-3 py-1.5 rounded-lg text-sm bg-[var(--mint)] text-white disabled:opacity-50"
          >
            학생에게 돌려주기
          </button>
        </div>
        {msg && <p className="text-sm text-[var(--mint)]">{msg}</p>}
        {err && <p className="text-sm text-[var(--coral)]">{err}</p>}
      </div>

      <div className="grades-layout">
        <div className="glass rounded-2xl p-2 max-h-[70vh] overflow-auto space-y-1 soft-card">
          {filtered.map((s) => (
            <div
              key={s.id}
              className={`rounded-xl px-2 py-2 text-sm border flex gap-2 items-start ${
                focus?.id === s.id ? "bg-[#e8f6ef] border-[var(--mint)]" : "bg-white"
              }`}
            >
              <input
                type="checkbox"
                className="mt-1"
                checked={selectedIds.includes(s.id)}
                onChange={() => toggle(s.id)}
              />
              <button type="button" className="flex-1 text-left min-w-0" onClick={() => setFocusId(s.id)}>
                <div className="font-semibold">{s.studentName}</div>
                <div className="text-xs opacity-70 truncate">
                  {lessonPathLabel(s.lessonId).split(" › ").slice(-1)[0]}
                </div>
                <div className="text-xs mt-0.5">
                  <span className="text-[var(--mint)] font-bold">{s.autoScore ?? "-"}</span>점 ·{" "}
                  {statusLabel(s)}
                  {s.teacherFeedback ? " · 교사FB" : ""}
                </div>
              </button>
            </div>
          ))}
        </div>

        {focus && (
          <div className="glass rounded-2xl p-5 space-y-4 min-w-0 soft-card">
            <div>
              <div className="text-xs opacity-60">학생</div>
              <div className="font-semibold text-lg">{focus.studentName}</div>
              <div className="text-sm opacity-80">{lessonPathLabel(focus.lessonId)}</div>
              <div className="mt-2 text-sm">{statusLabel(focus)}</div>
            </div>

            {focus.graded && (
              <label className="block text-sm">
                종합 점수 (수정 가능)
                <div className="flex gap-2 mt-1">
                  <input
                    className="w-28 rounded-xl border px-3 py-2 bg-white"
                    value={draftScores[focus.id] ?? String(focus.autoScore ?? "")}
                    onChange={(e) =>
                      setDraftScores((prev) => ({ ...prev, [focus.id]: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => applyDraftScore(focus.id)}
                    className="px-3 py-2 rounded-xl border bg-white text-sm"
                  >
                    점수 저장
                  </button>
                </div>
              </label>
            )}

            <div className="flex flex-wrap gap-2" role="tablist" aria-label="상세 메뉴">
              {(
                [
                  ["answers", "제출 답안"],
                  ["ai", "AI 코멘트"],
                  ["teacher", "교사 피드백"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={panel === id}
                  onClick={() => setPanel(id)}
                  className={`teacher-tab ${panel === id ? "active" : ""}`}
                >
                  {label}
                  {id === "ai" && hasAi && <span className="teacher-tab-badge">·</span>}
                  {id === "teacher" && focus.teacherFeedback && (
                    <span className="teacher-tab-badge">·</span>
                  )}
                </button>
              ))}
            </div>

            {panel === "answers" && (
              <div className="space-y-2">
                {(getLessonById(focus.lessonId)?.assessment || []).map((q, idx) => (
                  <div key={q.id} className="rounded-xl border bg-white p-3 text-sm">
                    <div className="text-xs opacity-60 mb-1">
                      {idx + 1}. {q.prompt}
                    </div>
                    <div className="whitespace-pre-wrap">{focus.answers[q.id] || "(빈 답안)"}</div>
                    {focus.questionScores?.[q.id] != null && (
                      <div className="mt-2 text-xs font-semibold text-[var(--mint)]">
                        {focus.questionScores[q.id]}점
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {panel === "ai" && (
              <div className="space-y-3">
                {!hasAi ? (
                  <p className="text-sm opacity-70">
                    아직 AI 코멘트가 없습니다. 위에서 <b>AI 채점</b>을 실행하면 여기에 표시됩니다.
                  </p>
                ) : (
                  <>
                    <div className="feedback-card">
                      <div className="text-xs font-semibold opacity-60 mb-2">종합 피드백 (5줄 이내)</div>
                      <p className="ai-summary-text">
                        {focus.aiSummary ||
                          summarizeAiFeedback(focus.questionFeedback, focus.aiFeedback, 5)}
                      </p>
                    </div>
                    <details className="rounded-xl border bg-white p-3 text-sm">
                      <summary className="cursor-pointer font-semibold text-xs opacity-70">
                        문항별 상세 코멘트 보기
                      </summary>
                      <div className="mt-3 space-y-3">
                        {(getLessonById(focus.lessonId)?.assessment || []).map((q, idx) => (
                          <div key={q.id} className="rounded-lg bg-[var(--sand)] p-3 space-y-1">
                            <div className="font-semibold text-xs opacity-70">
                              {idx + 1}. {q.prompt}
                              {focus.questionScores?.[q.id] != null
                                ? ` · ${focus.questionScores[q.id]}점`
                                : ""}
                            </div>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {focus.questionFeedback?.[q.id] || "이 문항 코멘트 없음"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </>
                )}
              </div>
            )}

            {panel === "teacher" && (
              <div className="space-y-3">
                <p className="text-sm opacity-70 leading-relaxed">
                  학생 <b>내 성적</b> 탭에 보이는 선생님 코멘트입니다. AI 코멘트와 별도로 격려·보완점을
                  적어 주세요.
                </p>
                <textarea
                  className="w-full min-h-36 rounded-xl border p-3 bg-white text-sm leading-relaxed"
                  placeholder="예: 핵심 개념은 잘 잡았어요. RAM과 SSD의 ‘임시/영구’ 차이를 한 문장에 더 분명히 넣어 보면 좋겠어요."
                  value={draftTeacherFb[focus.id] ?? focus.teacherFeedback ?? ""}
                  onChange={(e) =>
                    setDraftTeacherFb((prev) => ({ ...prev, [focus.id]: e.target.value }))
                  }
                />
                <button
                  type="button"
                  onClick={() => saveTeacherFeedback(focus.id)}
                  className="px-4 py-2 rounded-xl bg-[var(--mint)] text-white text-sm"
                >
                  교사 피드백 저장
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
