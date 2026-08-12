"use client";

import { useEffect, useMemo, useState } from "react";
import { curriculum, getLessonById, lessonPathLabel } from "@/data/curriculum";
import { getSocket } from "@/lib/socket";
import { useSession } from "@/store/session";
import { AvatarBadge } from "@/components/AvatarBadge";
import { LessonView } from "@/components/LessonView";
import type { AiProvider, AssessmentSubmission, StudentPresence } from "@/types";
import Link from "next/link";

type RoomState = {
  code: string;
  teacherName: string;
  focusMode: boolean;
  teacherScreen?: string;
  teacherLocation: string;
  aiProvider: AiProvider;
  hasApiKey: boolean;
  students: StudentPresence[];
  handQueue: string[];
  submissions: AssessmentSubmission[];
};

export function ClassroomApp() {
  const session = useSession();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [lessonId, setLessonId] = useState("lobby");
  const [apiKey, setApiKey] = useState("");
  const [aiProvider, setAiProvider] = useState<AiProvider>("gpt");
  const [handMsg, setHandMsg] = useState("질문이 있어요!");
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState("");

  const lesson = lessonId === "lobby" ? null : getLessonById(lessonId);

  const myStudent = useMemo(() => {
    if (session.role !== "student" || !session.student) return null;
    return room?.students.find((s) => s.id === session.student?.id) || session.student;
  }, [room, session]);

  useEffect(() => {
    if (!session.role || !session.roomCode) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (session.role === "teacher") {
      socket.emit(
        "teacher:join",
        { code: session.roomCode, password: session.password },
        (r: { ok: boolean; room?: RoomState; error?: string }) => {
          if (r.ok && r.room) {
            setRoom(r.room);
            setAiProvider(r.room.aiProvider);
          } else setToast(r.error || "교사 접속 실패");
        }
      );
    } else if (session.student) {
      socket.emit(
        "student:join",
        { code: session.roomCode, student: session.student },
        (r: { ok: boolean; room?: RoomState; error?: string }) => {
          if (r.ok && r.room) setRoom(r.room);
          else setToast(r.error || "학생 접속 실패");
        }
      );
    }

    socket.on("room:update", (r: RoomState) => setRoom(r));
    socket.on("hand:notify", (p: { name: string; message?: string }) => {
      if (session.role === "teacher") {
        setToast(`${p.name} 학생이 손을 들었습니다: ${p.message || ""}`);
      }
    });
    socket.on(
      "focus:changed",
      (p: { enabled: boolean; teacherScreen?: string; teacherLocation?: string }) => {
        if (session.role === "student" && p.enabled && p.teacherLocation) {
          setLessonId(p.teacherLocation);
          setToast("집중 모드: 교사 화면을 함께 봅니다. 다른 페이지로 이동할 수 없습니다.");
        }
        if (!p.enabled) setToast("집중 모드가 해제되었습니다.");
      }
    );
    socket.on("focus:blocked", (p: { teacherLocation?: string }) => {
      if (p.teacherLocation) setLessonId(p.teacherLocation);
      setToast("집중 모드 중에는 교사 승인 없이 이동할 수 없습니다.");
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:update");
      socket.off("hand:notify");
      socket.off("focus:changed");
      socket.off("focus:blocked");
    };
  }, [session.role, session.roomCode, session.password, session.student]);

  function goTo(nextId: string, label?: string) {
    if (session.role === "student" && room?.focusMode && nextId !== room.teacherLocation) {
      setToast("집중 모드 중에는 이동할 수 없습니다.");
      return;
    }
    setLessonId(nextId);
    const locationLabel = label || lessonPathLabel(nextId);
    const socket = getSocket();
    if (session.role === "teacher") {
      socket.emit("teacher:location", nextId);
      if (room?.focusMode) {
        socket.emit("focus:set", {
          enabled: true,
          teacherScreen: nextId,
          teacherLocation: nextId,
        });
      }
    } else if (session.student) {
      socket.emit("presence:update", {
        location: nextId,
        locationLabel,
      });
      session.updateStudentLocal({ location: nextId, locationLabel });
    }
  }

  function toggleFocus() {
    const socket = getSocket();
    const enabled = !room?.focusMode;
    socket.emit("focus:set", {
      enabled,
      teacherScreen: lessonId,
      teacherLocation: lessonId,
    });
  }

  function saveAiSettings() {
    getSocket().emit("teacher:ai-settings", { aiProvider, apiKey });
    setToast("AI 설정이 저장되었습니다.");
  }

  function raiseHand() {
    getSocket().emit("hand:raise", { message: handMsg });
    setToast("선생님에게 손을 들었습니다.");
  }

  function onSubmitted(submission: AssessmentSubmission, score: number) {
    getSocket().emit("assessment:submit", submission);
    if (session.role === "student") {
      session.updateStudentLocal({ score: Math.max(session.student?.score || 0, score) });
      getSocket().emit("presence:update", {
        score: Math.max(session.student?.score || 0, score),
      });
    }
    setToast("형성평가가 제출되었습니다.");
  }

  if (!session.role || !session.roomCode) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="glass rounded-2xl p-8 text-center space-y-3">
          <p>수업 세션이 없습니다.</p>
          <Link href="/" className="inline-block px-4 py-2 rounded-xl bg-[var(--mint)] text-white">
            메인으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_90%,transparent)] backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <div className="brand-display text-xl">중학교 정보 코스웨어</div>
            <div className="text-xs opacity-70">
              수업코드 <b>{session.roomCode}</b> · {connected ? "연결됨" : "연결 중..."} ·{" "}
              {session.role === "teacher" ? `교사 ${session.teacherName}` : `학생 ${session.student?.name}`}
              {room?.focusMode && (
                <span className="ml-2 text-[var(--coral)] font-semibold">FOCUS ON</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {session.role === "teacher" && (
              <>
                <button
                  onClick={toggleFocus}
                  className={`px-3 py-1.5 rounded-full text-sm text-white ${
                    room?.focusMode ? "bg-[var(--coral)] hand-pulse" : "bg-[var(--sky)]"
                  }`}
                >
                  {room?.focusMode ? "집중 해제" : "집중시키기"}
                </button>
                <Link href="/" className="px-3 py-1.5 rounded-full text-sm border bg-white">
                  나가기
                </Link>
              </>
            )}
            {session.role === "student" && (
              <>
                <input
                  className="rounded-full border px-3 py-1 text-sm bg-white"
                  value={handMsg}
                  onChange={(e) => setHandMsg(e.target.value)}
                />
                <button
                  onClick={raiseHand}
                  className="px-3 py-1.5 rounded-full text-sm bg-[var(--coral)] text-white"
                >
                  손들기
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {toast && (
        <div className="max-w-7xl mx-auto px-4 pt-3">
          <div className="rounded-xl bg-[#fff4e8] border border-[#f0c48a] px-4 py-2 text-sm flex justify-between gap-3">
            <span>{toast}</span>
            <button onClick={() => setToast("")}>닫기</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4 grid lg:grid-cols-[260px_1fr_240px] gap-4">
        <aside className="glass rounded-2xl p-3 h-fit sticky top-20 space-y-2">
          <button
            onClick={() => goTo("lobby", "수업 로비")}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm ${
              lessonId === "lobby" ? "bg-[var(--mint)] text-white" : "hover:bg-white"
            }`}
          >
            수업 로비
          </button>
          {curriculum.map((unit) => (
            <div key={unit.id} className="pt-2">
              <div className="px-2 text-xs font-bold" style={{ color: unit.color }}>
                {unit.number}. {unit.title}
              </div>
              {unit.subunits.map((sub) => (
                <div key={sub.id} className="mt-1">
                  <div className="px-2 text-[11px] opacity-70">{sub.title}</div>
                  {sub.lessons.map((les) => (
                    <button
                      key={les.id}
                      onClick={() => goTo(les.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs mt-0.5 ${
                        lessonId === les.id ? "bg-white border border-[var(--line)] font-semibold" : "hover:bg-white/70"
                      }`}
                    >
                      {les.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </aside>

        <main className="min-w-0">
          {lessonId === "lobby" ? (
            <div className="space-y-4">
              <section className="glass rounded-2xl p-6">
                <h2 className="brand-display text-3xl mb-2">수업 로비</h2>
                <p className="text-sm opacity-80 leading-relaxed">
                  2022 개정 교육과정 중학교 정보과 5개 영역 — 컴퓨팅 시스템, 데이터, 알고리즘과
                  프로그래밍, 인공지능, 디지털 문화. 왼쪽에서 중단원 수업을 선택하세요. 모든 수업은
                  도입-전개-정리와 연계 영상·형성평가로 구성됩니다.
                </p>
              </section>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {curriculum.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => {
                      const first = unit.subunits[0]?.lessons[0];
                      if (first) goTo(first.id);
                    }}
                    className="glass rounded-2xl p-5 text-left hover:-translate-y-0.5 transition"
                    style={{ borderTop: `4px solid ${unit.color}` }}
                  >
                    <div className="brand-display text-xl">{unit.number}. {unit.title}</div>
                    <p className="text-sm mt-2 opacity-80">{unit.description}</p>
                    <div className="text-xs mt-3 opacity-60">{unit.standards.join(" ")}</div>
                  </button>
                ))}
              </div>

              {session.role === "teacher" && (
                <section className="glass rounded-2xl p-5 space-y-3">
                  <h3 className="font-semibold text-lg">교사 AI 설정 (GPT / Gemini / Claude)</h3>
                  <p className="text-sm opacity-80">
                    서술형 형성평가·알고리즘·파이썬 채점에 사용됩니다. 키는 이 수업 세션 메모리에만
                    보관됩니다.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["gpt", "OpenAI GPT"],
                        ["gemini", "Google Gemini"],
                        ["claude", "Anthropic Claude"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        onClick={() => setAiProvider(id)}
                        className={`px-3 py-1.5 rounded-full text-sm border ${
                          aiProvider === id ? "bg-[var(--sky)] text-white border-transparent" : "bg-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="password"
                    className="w-full rounded-xl border px-3 py-2 bg-white"
                    placeholder="API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button onClick={saveAiSettings} className="px-4 py-2 rounded-xl bg-[var(--mint)] text-white">
                    저장
                  </button>
                  <div className="text-xs opacity-70">
                    비밀번호(공유용): <b>{session.password}</b>
                  </div>
                </section>
              )}
            </div>
          ) : lesson ? (
            <LessonView
              lesson={lesson}
              provider={room?.aiProvider || aiProvider}
              apiKey={apiKey}
              roomCode={session.roomCode}
              studentId={session.student?.id}
              studentName={session.student?.name}
              onSubmitted={onSubmitted}
            />
          ) : (
            <div className="glass rounded-2xl p-6">수업을 찾을 수 없습니다.</div>
          )}
        </main>

        <aside className="space-y-3 h-fit sticky top-20">
          {myStudent && session.role === "student" && <AvatarBadge student={myStudent} />}

          {session.role === "teacher" && (
            <div className="glass rounded-2xl p-3 space-y-2">
              <div className="font-semibold text-sm">실시간 학생 ({room?.students.length || 0})</div>
              <div className="max-h-[50vh] overflow-auto space-y-2">
                {(room?.students || []).map((s) => (
                  <div key={s.id} className="rounded-xl border bg-white p-2">
                    <AvatarBadge student={s} compact />
                    {s.handRaised && (
                      <button
                        className="mt-2 w-full text-xs px-2 py-1 rounded-lg bg-[var(--coral)] text-white"
                        onClick={() => getSocket().emit("hand:lower", s.id)}
                      >
                        손들기 확인 완료
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t">
                <div className="font-semibold text-sm mb-1">최근 제출</div>
                <div className="max-h-40 overflow-auto space-y-1 text-xs">
                  {(room?.submissions || []).slice(0, 8).map((sub) => (
                    <div key={sub.id} className="rounded-lg bg-[var(--sand)] p-2">
                      <b>{sub.studentName}</b> · {lessonPathLabel(sub.lessonId).split(" › ").pop()} ·{" "}
                      {sub.autoScore ?? "-"}점
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {session.role === "student" && (
            <div className="glass rounded-2xl p-3 text-xs leading-relaxed opacity-80">
              어려우면 <b>손들기</b>로 선생님께 질문하세요. 집중 모드에서는 교사 화면을 함께 보게
              됩니다.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
