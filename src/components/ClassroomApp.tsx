"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { curriculum, getLessonById, lessonPathLabel } from "@/data/curriculum";
import { getSocket } from "@/lib/socket";
import { useSession } from "@/store/session";
import { AvatarBadge } from "@/components/AvatarBadge";
import { BrandMark } from "@/components/BrandMark";
import { GradesPanel } from "@/components/GradesPanel";
import { LessonView } from "@/components/LessonView";
import { StudentGradesPanel } from "@/components/StudentGradesPanel";
import { TeacherSettingsPanel } from "@/components/TeacherSettingsPanel";
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

type MonitorFrame = {
  studentId: string;
  name: string;
  locationLabel: string;
  image: string;
  at: number;
};

type TeacherMainTab = "class" | "grades" | "settings";
type StudentMainTab = "class" | "grades";

function gradesStorageKey(roomCode: string, studentId: string) {
  return `ms-grades:${roomCode}:${studentId}`;
}

function loadCachedGrades(roomCode: string, studentId: string): Record<string, AssessmentSubmission> {
  try {
    const raw = localStorage.getItem(gradesStorageKey(roomCode, studentId));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, AssessmentSubmission>;
  } catch {
    return {};
  }
}

function saveCachedGrades(
  roomCode: string,
  studentId: string,
  map: Record<string, AssessmentSubmission>
) {
  try {
    localStorage.setItem(gradesStorageKey(roomCode, studentId), JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

export function ClassroomApp() {
  const session = useSession();
  const [hydrated, setHydrated] = useState(false);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [lessonId, setLessonId] = useState("lobby");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [teacherTab, setTeacherTab] = useState<TeacherMainTab>("class");
  const [studentTab, setStudentTab] = useState<StudentMainTab>("class");
  const [apiKey, setApiKey] = useState("");
  const [aiProvider, setAiProvider] = useState<AiProvider>("gpt");
  const [handMsg, setHandMsg] = useState("질문이 있어요!");
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState("");
  const [showPanel, setShowPanel] = useState(true);
  const [monitorMode, setMonitorMode] = useState(false);
  const [frames, setFrames] = useState<Record<string, MonitorFrame>>({});
  const [sharing, setSharing] = useState(false);
  const [sharePrompt, setSharePrompt] = useState(false);
  const [myResults, setMyResults] = useState<Record<string, AssessmentSubmission>>({});
  const shareTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lessonIdRef = useRef(lessonId);
  lessonIdRef.current = lessonId;

  useEffect(() => {
    const unsub = useSession.persist.onFinishHydration(() => setHydrated(true));
    if (useSession.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated || session.role !== "student" || !session.roomCode || !session.student?.id) return;
    const cached = loadCachedGrades(session.roomCode, session.student.id);
    if (Object.keys(cached).length) setMyResults(cached);
  }, [hydrated, session.role, session.roomCode, session.student?.id]);

  useEffect(() => {
    if (session.role !== "student" || !session.roomCode || !session.student?.id) return;
    if (!Object.keys(myResults).length) return;
    saveCachedGrades(session.roomCode, session.student.id, myResults);
  }, [myResults, session.role, session.roomCode, session.student?.id]);

  const lesson = lessonId === "lobby" ? null : getLessonById(lessonId);
  const selectedUnit = curriculum.find((u) => u.id === selectedUnitId);

  const myStudent = useMemo(() => {
    if (session.role !== "student" || !session.student) return null;
    return room?.students.find((s) => s.id === session.student?.id) || session.student;
  }, [room, session]);

  const studentSubmissions = useMemo(() => {
    if (session.role !== "student" || !session.student) return [];
    const fromRoom = (room?.submissions || []).filter((s) => s.studentId === session.student?.id);
    const map = new Map<string, AssessmentSubmission>();
    for (const s of Object.values(myResults)) map.set(s.id, s);
    for (const s of fromRoom) map.set(s.id, s);
    return [...map.values()].sort(
      (a, b) => (b.returnedAt || b.submittedAt) - (a.returnedAt || a.submittedAt)
    );
  }, [room?.submissions, myResults, session.role, session.student]);

  const returnedCount = studentSubmissions.filter((s) => s.status === "returned").length;

  function stopSharing() {
    if (shareTimer.current) {
      clearInterval(shareTimer.current);
      shareTimer.current = null;
    }
    mediaRef.current?.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setSharing(false);
    setSharePrompt(false);
  }

  async function startSharing() {
    if (!session.student) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 2 },
        audio: false,
      });
      mediaRef.current = stream;
      stream.getVideoTracks()[0]?.addEventListener("ended", () => stopSharing());

      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await video.play();
      videoRef.current = video;

      const canvas = document.createElement("canvas");
      const send = () => {
        if (!video.videoWidth) return;
        const w = 480;
        const h = Math.max(270, Math.round((video.videoHeight / video.videoWidth) * w));
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);
        const image = canvas.toDataURL("image/jpeg", 0.55);
        getSocket().emit("monitor:frame", {
          studentId: session.student!.id,
          name: session.student!.name,
          locationLabel: lessonPathLabel(lessonIdRef.current),
          image,
        });
      };

      send();
      shareTimer.current = setInterval(send, 1200);
      setSharing(true);
      setSharePrompt(false);
      setToast("화면 공유가 시작되었습니다.");
    } catch {
      setToast("화면 공유가 취소되었거나 지원되지 않습니다.");
      stopSharing();
    }
  }

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

    socket.on("room:update", (r: RoomState) => {
      setRoom(r);
      if (session.role === "student" && session.student) {
        const mine = r.submissions.filter((s) => s.studentId === session.student?.id);
        if (mine.length) {
          setMyResults((prev) => {
            const next = { ...prev };
            for (const s of mine) next[s.lessonId] = s;
            return next;
          });
        }
      }
    });
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
          const found = getLessonById(p.teacherLocation);
          if (found) setSelectedUnitId(found.unitId);
          setToast("집중 모드: 교사 화면을 함께 봅니다.");
        }
        if (!p.enabled) setToast("집중 모드가 해제되었습니다.");
      }
    );
    socket.on("focus:blocked", (p: { teacherLocation?: string }) => {
      if (p.teacherLocation) {
        setLessonId(p.teacherLocation);
        const found = getLessonById(p.teacherLocation);
        if (found) setSelectedUnitId(found.unitId);
      }
      setToast("집중 모드 중에는 이동할 수 없습니다.");
    });

    socket.on("monitor:request", (p: { enabled: boolean }) => {
      if (session.role !== "student") return;
      if (p.enabled) {
        setSharePrompt(true);
        setToast("선생님이 화면 모니터링을 요청했습니다. [공유 허용]을 눌러 주세요.");
      } else {
        stopSharing();
        setSharePrompt(false);
        setToast("모니터링이 종료되었습니다.");
      }
    });

    socket.on("monitor:frame", (frame: MonitorFrame) => {
      if (session.role !== "teacher") return;
      setFrames((prev) => ({ ...prev, [frame.studentId]: frame }));
    });

    socket.on("assessment:new", (submission: AssessmentSubmission) => {
      if (session.role !== "teacher") return;
      setToast(`${submission.studentName} 학생이 형성평가를 저장했습니다.`);
      setRoom((prev) => {
        if (!prev) return prev;
        const without = prev.submissions.filter(
          (s) =>
            !(
              s.studentId === submission.studentId &&
              s.lessonId === submission.lessonId &&
              s.status !== "returned"
            )
        );
        return { ...prev, submissions: [submission, ...without] };
      });
    });

    socket.on("assessment:returned", (submission: AssessmentSubmission) => {
      if (session.role === "student" && session.student?.id === submission.studentId) {
        setMyResults((prev) => ({ ...prev, [submission.lessonId]: submission }));
        const score = submission.autoScore ?? 0;
        session.updateStudentLocal({ score: Math.max(session.student?.score || 0, score) });
        setStudentTab("grades");
        setToast(
          `형성평가 결과가 도착했습니다: ${lessonPathLabel(submission.lessonId)} · ${score}점`
        );
      }
      if (session.role === "teacher") {
        setRoom((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            submissions: prev.submissions.map((s) => (s.id === submission.id ? submission : s)),
          };
        });
      }
    });

    return () => {
      if (session.role === "teacher") {
        socket.emit("teacher:clear-api-key");
        setApiKey("");
      }
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("room:update");
      socket.off("hand:notify");
      socket.off("focus:changed");
      socket.off("focus:blocked");
      socket.off("monitor:request");
      socket.off("monitor:frame");
      socket.off("assessment:new");
      socket.off("assessment:returned");
      stopSharing();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.role, session.roomCode, session.password, session.student]);

  useEffect(() => {
    if (session.role !== "teacher") return;

    const wipeKey = () => {
      setApiKey("");
      try {
        getSocket().emit("teacher:clear-api-key");
      } catch {
        /* ignore */
      }
    };

    const onLeave = () => wipeKey();
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("beforeunload", onLeave);
      wipeKey();
    };
  }, [session.role]);

  function goTo(nextId: string, label?: string) {
    if (session.role === "student" && room?.focusMode && nextId !== room.teacherLocation) {
      setToast("집중 모드 중에는 이동할 수 없습니다.");
      return;
    }
    setTeacherTab("class");
    setStudentTab("class");
    setLessonId(nextId);
    if (nextId === "lobby") setSelectedUnitId("");
    setMonitorMode(false);
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
      socket.emit("presence:update", { location: nextId, locationLabel });
      session.updateStudentLocal({ location: nextId, locationLabel });
    }
  }

  function toggleUnit(unitId: string) {
    setSelectedUnitId((prev) => (prev === unitId ? "" : unitId));
  }

  function toggleFocus() {
    getSocket().emit("focus:set", {
      enabled: !room?.focusMode,
      teacherScreen: lessonId,
      teacherLocation: lessonId,
    });
  }

  async function saveTeacherApiKey(plainKey: string, provider: AiProvider) {
    setAiProvider(provider);
    setApiKey(plainKey);
    getSocket().emit("teacher:ai-settings", { aiProvider: provider, apiKey: plainKey });
    setToast("API 키가 이중 암호화 검증 후 세션에 등록되었습니다. 페이지를 나가면 삭제됩니다.");
  }

  function clearTeacherApiKeyLocal() {
    setApiKey("");
    getSocket().emit("teacher:clear-api-key");
    setToast("API 키가 세션에서 삭제되었습니다.");
  }

  function leaveClassroom(): boolean {
    if (!window.confirm("수업에서 나가시겠습니까?\n(※ 새로고침은 나가기가 아니며, 다시 이어서 볼 수 있습니다.)")) {
      return false;
    }
    if (session.role === "teacher") {
      clearTeacherApiKeyLocal();
    }
    stopSharing();
    if (session.role === "student" && session.roomCode && session.student?.id) {
      try {
        localStorage.removeItem(gradesStorageKey(session.roomCode, session.student.id));
      } catch {
        /* ignore */
      }
    }
    session.clear();
    return true;
  }

  function raiseHand() {
    getSocket().emit("hand:raise", { message: handMsg });
    setToast("선생님에게 손을 들었습니다.");
  }

  function toggleMonitor() {
    if (session.role !== "teacher") return;
    const next = !monitorMode;
    setMonitorMode(next);
    if (next) {
      setSelectedUnitId("");
      getSocket().emit("monitor:start");
      setToast("학생 화면 모니터링을 시작했습니다. 학생이 공유를 허용해야 보입니다.");
    } else {
      getSocket().emit("monitor:stop");
      setFrames({});
      setToast("모니터링을 종료했습니다.");
    }
  }

  function onAssessmentSaved(submission: AssessmentSubmission) {
    getSocket().emit("assessment:submit", submission);
    if (session.role === "student") {
      setMyResults((prev) => ({ ...prev, [submission.lessonId]: submission }));
    }
    setToast("형성평가가 저장되어 선생님에게 전달되었습니다.");
  }

  function onTeacherGrade(
    id: string,
    patch: Partial<AssessmentSubmission>
  ) {
    getSocket().emit("assessment:grade", { id, ...patch });
    setRoom((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        submissions: prev.submissions.map((s) => {
          if (s.id !== id) return s;
          // status를 명시하지 않으면 기존 상태 유지 (반환됨 유지)
          const next = { ...s, ...patch };
          if (patch.status === undefined) next.status = s.status;
          return next;
        }),
      };
    });
  }

  function onTeacherReturn(ids: string[]) {
    getSocket().emit("assessment:return", ids);
    setToast(`${ids.length}건의 점수를 학생에게 돌려주었습니다.`);
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="glass rounded-2xl p-8 text-center soft-card">
          <p className="opacity-70">수업 화면을 불러오는 중…</p>
        </div>
      </div>
    );
  }

  if (!session.role || !session.roomCode) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="glass rounded-2xl p-8 text-center space-y-3 soft-card">
          <p>저장된 수업 세션이 없습니다.</p>
          <Link href="/" className="inline-block px-4 py-2 rounded-xl bg-[var(--mint)] text-white">
            메인으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-header-row">
            <div>
              <BrandMark size="md" />
              <div className="text-xs opacity-70 mt-1">
                {session.roomCode} · {connected ? "연결됨" : "연결 중"} ·{" "}
                {session.role === "teacher" ? session.teacherName : session.student?.name}
                {room?.focusMode && <span className="ml-2 text-[var(--coral)] font-semibold">집중</span>}
                {sharing && <span className="ml-2 text-[var(--sky)] font-semibold">화면공유</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {session.role === "teacher" && (
                <>
                  <button
                    onClick={toggleMonitor}
                    className={`px-3 py-1.5 rounded-lg text-sm text-white ${
                      monitorMode ? "bg-[var(--coral)]" : "bg-[var(--mint)]"
                    }`}
                  >
                    {monitorMode ? "모니터링 종료" : "화면 모니터링"}
                  </button>
                  <button
                    onClick={toggleFocus}
                    className={`px-3 py-1.5 rounded-lg text-sm text-white ${
                      room?.focusMode ? "bg-[var(--coral)]" : "bg-[var(--sky)]"
                    }`}
                  >
                    {room?.focusMode ? "집중 해제" : "집중시키기"}
                  </button>
                </>
              )}
              {session.role === "student" && (
                <>
                  <input
                    className="rounded-lg border px-2 py-1 text-sm bg-white w-36"
                    value={handMsg}
                    onChange={(e) => setHandMsg(e.target.value)}
                  />
                  <button
                    onClick={raiseHand}
                    className="px-3 py-1.5 rounded-lg text-sm bg-[var(--coral)] text-white"
                  >
                    손들기
                  </button>
                  <button
                    onClick={() => (sharing ? stopSharing() : startSharing())}
                    className="px-3 py-1.5 rounded-lg text-sm border bg-white"
                  >
                    {sharing ? "공유 중지" : "화면 공유"}
                  </button>
                </>
              )}
              <button
                onClick={() => setShowPanel((v) => !v)}
                className="px-3 py-1.5 rounded-lg text-sm border bg-white"
              >
                {showPanel ? "현황 숨기기" : "현황"}
              </button>
              <Link
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  if (leaveClassroom()) window.location.href = "/";
                }}
                className="px-3 py-1.5 rounded-lg text-sm border bg-white btn-soft"
              >
                나가기
              </Link>
            </div>
          </div>

          {session.role === "teacher" && (
            <div className="teacher-main-tabs" role="tablist" aria-label="교사 메뉴">
              {(
                [
                  ["class", "수업"],
                  ["grades", "성적(형성평가)"],
                  ["settings", "개인설정"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={teacherTab === id}
                  onClick={() => {
                    setTeacherTab(id);
                    if (id !== "class") setMonitorMode(false);
                  }}
                  className={`teacher-tab ${teacherTab === id ? "active" : ""}`}
                >
                  {label}
                  {id === "grades" && (room?.submissions?.length || 0) > 0 && (
                    <span className="teacher-tab-badge">{room?.submissions.length}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {session.role === "student" && (
            <div className="teacher-main-tabs" role="tablist" aria-label="학생 메뉴">
              {(
                [
                  ["class", "수업"],
                  ["grades", "내 성적"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={studentTab === id}
                  onClick={() => setStudentTab(id)}
                  className={`teacher-tab ${studentTab === id ? "active" : ""}`}
                >
                  {label}
                  {id === "grades" && returnedCount > 0 && (
                    <span className="teacher-tab-badge">{returnedCount}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {((session.role === "teacher" && teacherTab === "class") ||
            (session.role === "student" && studentTab === "class")) && (
            <>
              <div className="app-nav-units">
                <label className="app-check">
                  <input
                    type="checkbox"
                    checked={!monitorMode && lessonId === "lobby" && !selectedUnitId}
                    onChange={() => {
                      setMonitorMode(false);
                      goTo("lobby", "수업 로비");
                    }}
                  />
                  로비
                </label>
                {curriculum.map((unit) => (
                  <label key={unit.id} className="app-check">
                    <input
                      type="checkbox"
                      checked={!monitorMode && selectedUnitId === unit.id}
                      onChange={() => {
                        setMonitorMode(false);
                        toggleUnit(unit.id);
                      }}
                    />
                    <span style={{ color: unit.color, fontWeight: 700 }}>
                      {unit.number}.{unit.title}
                    </span>
                  </label>
                ))}
              </div>

              {!monitorMode && selectedUnit && (
                <div className="app-nav-lessons">
                  <div className="text-xs opacity-60 mb-2">{selectedUnit.title} · 수업 선택</div>
                  <div className="app-nav-lessons-grid">
                    {selectedUnit.subunits.flatMap((sub) =>
                      sub.lessons.map((les) => (
                        <label key={les.id} className="app-check">
                          <input
                            type="checkbox"
                            checked={lessonId === les.id}
                            onChange={() => {
                              if (lessonId !== les.id) goTo(les.id);
                            }}
                          />
                          <span style={{ fontWeight: lessonId === les.id ? 700 : 400 }}>
                            {les.title}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {sharePrompt && session.role === "student" && (
        <div className="app-main" style={{ paddingBottom: 0 }}>
          <div className="rounded-xl border border-[var(--sky)] bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm">선생님 모니터링 요청 — 이 창 또는 화면을 공유해 주세요.</span>
            <div className="flex gap-2">
              <button
                onClick={startSharing}
                className="px-3 py-1.5 rounded-lg text-sm bg-[var(--mint)] text-white"
              >
                공유 허용
              </button>
              <button
                onClick={() => setSharePrompt(false)}
                className="px-3 py-1.5 rounded-lg text-sm border bg-white"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="app-main" style={{ paddingBottom: 0 }}>
          <div className="rounded-xl bg-[#fff4e8] border border-[#f0c48a] px-4 py-2 text-sm flex justify-between gap-3">
            <span>{toast}</span>
            <button onClick={() => setToast("")}>닫기</button>
          </div>
        </div>
      )}

      <div className={`app-main app-layout ${showPanel ? "with-panel" : ""}`}>
        <main className="min-w-0">
          {session.role === "teacher" && teacherTab === "grades" ? (
            <GradesPanel
              submissions={room?.submissions || []}
              roomCode={session.roomCode}
              hasApiKey={Boolean(apiKey || room?.hasApiKey)}
              apiKey={apiKey}
              provider={aiProvider}
              onGrade={onTeacherGrade}
              onReturn={onTeacherReturn}
            />
          ) : session.role === "teacher" && teacherTab === "settings" ? (
            <TeacherSettingsPanel
              aiProvider={aiProvider}
              setAiProvider={setAiProvider}
              roomPassword={session.password || ""}
              hasServerKey={Boolean(room?.hasApiKey)}
              maskedKey={apiKey}
              onSavePlainKey={saveTeacherApiKey}
              onClearKey={clearTeacherApiKeyLocal}
            />
          ) : session.role === "student" && studentTab === "grades" ? (
            <StudentGradesPanel submissions={studentSubmissions} />
          ) : monitorMode && session.role === "teacher" ? (
            <section className="space-y-3">
              <div className="glass rounded-2xl p-4">
                <h2 className="brand-display text-2xl mb-1">학생 화면 모니터링</h2>
                <p className="text-sm opacity-70">
                  접속 {room?.students.length || 0}명 · 화면이 보이는 학생은 공유를 허용한 경우입니다.
                </p>
              </div>
              <div className="monitor-grid">
                {(room?.students || []).map((s) => {
                  const frame = frames[s.id];
                  return (
                    <div key={s.id} className="monitor-card">
                      <div className="monitor-screen">
                        {frame?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={frame.image} alt={`${s.name} 화면`} />
                        ) : (
                          <span>화면 대기 중</span>
                        )}
                      </div>
                      <div className="monitor-meta">
                        <div className="font-semibold">
                          {s.name} {s.handRaised ? "✋" : ""}
                        </div>
                        <div className="opacity-70 truncate">
                          {frame?.locationLabel || s.locationLabel}
                        </div>
                        <div className="opacity-60">형성평가 {s.score}점</div>
                      </div>
                    </div>
                  );
                })}
                {(room?.students || []).length === 0 && (
                  <div className="glass rounded-2xl p-6 text-sm opacity-70">접속한 학생이 없습니다.</div>
                )}
              </div>
            </section>
          ) : lessonId === "lobby" ? (
            <div className="space-y-4">
              <section className="glass rounded-2xl p-6">
                <h2 className="brand-display text-2xl mb-2">수업 로비</h2>
                <p className="text-sm opacity-80 leading-relaxed">
                  위쪽 체크박스로 대단원을 고른 뒤 수업을 선택하세요.
                  {session.role === "teacher" && (
                    <>
                      {" "}
                      AI API 키는 <b>개인설정</b> 탭에서 등록하세요. 페이지를 나가면 키가 삭제됩니다.
                    </>
                  )}
                </p>
              </section>
            </div>
          ) : lesson ? (
            <LessonView
              lesson={lesson}
              provider={room?.aiProvider || aiProvider}
              apiKey={apiKey}
              roomCode={session.roomCode}
              studentId={session.student?.id}
              studentName={session.student?.name}
              myResult={
                session.role === "student"
                  ? myResults[lesson.id] ||
                    room?.submissions.find(
                      (s) =>
                        s.lessonId === lesson.id &&
                        s.studentId === session.student?.id &&
                        s.status === "returned"
                    ) ||
                    null
                  : null
              }
              onSaved={onAssessmentSaved}
            />
          ) : (
            <div className="glass rounded-2xl p-6">수업을 찾을 수 없습니다.</div>
          )}
        </main>

        {showPanel && (
          <aside className="space-y-3 h-fit" style={{ position: "sticky", top: "1rem" }}>
            {myStudent && session.role === "student" && <AvatarBadge student={myStudent} compact />}
            {session.role === "teacher" && (
              <div className="glass rounded-2xl p-3 space-y-2">
                <div className="font-semibold text-sm">접속 {room?.students.length || 0}명</div>
                <div className="max-h-[45vh] overflow-auto space-y-2">
                  {(room?.students || []).map((s) => (
                    <div key={s.id} className="rounded-xl border bg-white p-2">
                      <AvatarBadge student={s} compact />
                      {s.handRaised && (
                        <button
                          className="mt-2 w-full text-xs px-2 py-1 rounded-lg bg-[var(--coral)] text-white"
                          onClick={() => getSocket().emit("hand:lower", s.id)}
                        >
                          확인 완료
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
