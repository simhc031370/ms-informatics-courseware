"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { createRandomAvatar, avatarSvgDataUrl } from "@/lib/avatar";
import { getSocket } from "@/lib/socket";
import { useSession } from "@/store/session";
import { BrandMark } from "@/components/BrandMark";
import type { Gender } from "@/types";

function randomPassword(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join(
    ""
  );
}

export default function HomePage() {
  const router = useRouter();
  const session = useSession();
  const setTeacher = useSession((s) => s.setTeacher);
  const setStudent = useSession((s) => s.setStudent);

  const [tab, setTab] = useState<"student" | "teacher">("student");
  const [teacherName, setTeacherName] = useState("정보 선생님");
  const [password, setPassword] = useState(randomPassword());
  const [joinCode, setJoinCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useSession.persist.onFinishHydration(() => setHydrated(true));
    if (useSession.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (session.role === "student" && session.student) {
      setStudentCode(session.roomCode);
      setStudentName(session.student.name);
      setGender(session.student.gender);
      setTab("student");
    } else if (session.role === "teacher") {
      setJoinCode(session.roomCode);
      setJoinPassword(session.password);
      setTeacherName(session.teacherName || "정보 선생님");
      setTab("teacher");
    }
  }, [hydrated, session.role, session.roomCode, session.password, session.teacherName, session.student]);

  const previewAvatar = useMemo(() => {
    if (!gender || !studentName.trim()) return null;
    return createRandomAvatar(studentName.trim(), gender);
  }, [gender, studentName]);

  async function ensureSocket() {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
      await new Promise<void>((resolve) => {
        if (socket.connected) resolve();
        else socket.once("connect", () => resolve());
      });
    }
    return socket;
  }

  async function createClass() {
    setLoading(true);
    setError("");
    try {
      const socket = await ensureSocket();
      socket.emit(
        "teacher:create",
        { teacherName, password },
        (r: {
          ok: boolean;
          room?: { code: string };
          password?: string;
          error?: string;
        }) => {
          if (!r.ok || !r.room) {
            setError(r.error || "수업 생성 실패");
            setLoading(false);
            return;
          }
          setTeacher({
            roomCode: r.room.code,
            password: r.password || password,
            teacherName,
          });
          router.push("/classroom");
        }
      );
    } catch {
      setError("서버에 연결할 수 없습니다.");
      setLoading(false);
    }
  }

  async function rejoinTeacher() {
    setLoading(true);
    setError("");
    try {
      const socket = await ensureSocket();
      socket.emit(
        "teacher:join",
        { code: joinCode.trim().toUpperCase(), password: joinPassword.trim() },
        (r: { ok: boolean; room?: { code: string }; error?: string }) => {
          if (!r.ok || !r.room) {
            setError(r.error || "재접속 실패");
            setLoading(false);
            return;
          }
          setTeacher({
            roomCode: r.room.code,
            password: joinPassword.trim(),
            teacherName,
          });
          router.push("/classroom");
        }
      );
    } catch {
      setError("서버에 연결할 수 없습니다.");
      setLoading(false);
    }
  }

  async function joinStudent() {
    if (!gender) {
      setError("성별을 선택하세요.");
      return;
    }
    if (!studentName.trim() || !studentCode.trim()) {
      setError("수업 코드와 이름을 입력하세요.");
      return;
    }
    setLoading(true);
    setError("");
    const code = studentCode.trim().toUpperCase();
    const name = studentName.trim();
    // 같은 수업·이름이면 기존 학생 ID 재사용 → 성적/제출 유지
    const prev = useSession.getState();
    const reuseId =
      prev.role === "student" &&
      prev.roomCode === code &&
      prev.student?.name === name &&
      prev.student?.id
        ? prev.student.id
        : uuid();
    const avatar =
      reuseId === prev.student?.id && prev.student?.avatar
        ? prev.student.avatar
        : createRandomAvatar(name, gender);
    const id = reuseId;
    try {
      const socket = await ensureSocket();
      const student = {
        id,
        name,
        gender,
        avatar,
        location: "lobby",
        locationLabel: "수업 로비",
        score: prev.student?.id === id ? prev.student.score || 0 : 0,
        handRaised: false,
        online: true,
        joinedAt: Date.now(),
        lastSeen: Date.now(),
      };
      socket.emit(
        "student:join",
        { code, student },
        (r: { ok: boolean; error?: string }) => {
          if (!r.ok) {
            setError(r.error || "입장 실패");
            setLoading(false);
            return;
          }
          setStudent({
            roomCode: code,
            name,
            gender,
            avatar,
            id,
          });
          router.push("/classroom");
        }
      );
    } catch {
      setError("서버에 연결할 수 없습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="home-shell">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center space-y-3">
          <p className="text-xs tracking-[0.18em] opacity-55">2022 개정 · 중학교 정보</p>
          <BrandMark size="hero" align="center" />
          <p className="text-sm text-muted" style={{ marginTop: "0.75rem" }}>
            교사와 학생이 함께하는 실시간 수업 공간
          </p>
        </header>

        {hydrated && session.role && session.roomCode && (
          <button
            type="button"
            onClick={() => router.push("/classroom")}
            className="w-full home-card text-sm text-left"
            style={{ padding: "0.95rem 1.1rem" }}
          >
            <div className="font-semibold text-[var(--sky)]">저장된 수업 이어하기</div>
            <div className="opacity-70 mt-0.5">
              {session.roomCode} ·{" "}
              {session.role === "teacher" ? session.teacherName : session.student?.name}
            </div>
          </button>
        )}

        <section className="home-card space-y-5">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-[var(--sand)]">
            <button
              className={`py-2 rounded-full text-sm font-semibold ${tab === "student" ? "bg-white shadow" : ""}`}
              onClick={() => setTab("student")}
            >
              학생
            </button>
            <button
              className={`py-2 rounded-full text-sm font-semibold ${tab === "teacher" ? "bg-white shadow" : ""}`}
              onClick={() => setTab("teacher")}
            >
              교사
            </button>
          </div>

          {tab === "student" ? (
            <div className="space-y-3">
              <label className="block text-sm">
                수업 코드
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 bg-white uppercase"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="ABCDEF"
                />
              </label>
              <label className="block text-sm">
                이름
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 bg-white"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                성별
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 bg-white"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | "")}
                >
                  <option value="">선택</option>
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </label>
              {previewAvatar && (
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--sand)] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarSvgDataUrl(previewAvatar)} alt="" width={52} height={62} />
                  <span className="text-sm opacity-70">아바타가 준비되었습니다</span>
                </div>
              )}
              <button
                disabled={loading}
                onClick={joinStudent}
                className="w-full py-3 rounded-2xl bg-[var(--mint)] text-white font-semibold disabled:opacity-50"
              >
                입장
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm">
                교사 이름
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2.5 bg-white"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                />
              </label>
              <label className="block text-sm">
                수업 비밀번호
                <div className="mt-1 flex gap-2">
                  <input
                    className="w-full rounded-xl border px-3 py-2.5 bg-white font-mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="shrink-0 px-3 rounded-xl border bg-white text-sm"
                    onClick={() => setPassword(randomPassword())}
                  >
                    생성
                  </button>
                </div>
              </label>
              <button
                disabled={loading}
                onClick={createClass}
                className="w-full py-3 rounded-2xl bg-[var(--sky)] text-white font-semibold disabled:opacity-50"
              >
                수업 만들기
              </button>

              <div className="border-t pt-4 space-y-2">
                <p className="text-xs opacity-60">이미 만든 수업이 있다면</p>
                <input
                  className="w-full rounded-xl border px-3 py-2 bg-white uppercase"
                  placeholder="수업 코드"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
                <input
                  className="w-full rounded-xl border px-3 py-2 bg-white"
                  placeholder="비밀번호"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                />
                <button
                  disabled={loading}
                  onClick={rejoinTeacher}
                  className="w-full py-2.5 rounded-xl border bg-white text-sm font-semibold"
                >
                  재접속
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-[var(--coral)]">{error}</p>}
        </section>
      </div>
    </div>
  );
}
