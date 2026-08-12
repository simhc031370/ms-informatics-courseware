"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import { createRandomAvatar, avatarSvgDataUrl } from "@/lib/avatar";
import { getSocket } from "@/lib/socket";
import { useSession } from "@/store/session";
import type { Gender } from "@/types";

function randomPassword(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join(
    ""
  );
}

export default function HomePage() {
  const router = useRouter();
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
      setError("서버 연결에 실패했습니다. npm run dev로 서버를 실행하세요.");
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
      setError("서버 연결 실패");
      setLoading(false);
    }
  }

  async function joinStudent() {
    if (!gender) {
      setError("성별을 선택하세요. 선택 후 아바타가 생성됩니다.");
      return;
    }
    if (!studentName.trim() || !studentCode.trim()) {
      setError("수업 코드와 이름을 입력하세요.");
      return;
    }
    setLoading(true);
    setError("");
    const avatar = createRandomAvatar(studentName.trim(), gender);
    const id = uuid();
    try {
      const socket = await ensureSocket();
      const student = {
        id,
        name: studentName.trim(),
        gender,
        avatar,
        location: "lobby",
        locationLabel: "수업 로비",
        score: 0,
        handRaised: false,
        online: true,
        joinedAt: Date.now(),
        lastSeen: Date.now(),
      };
      socket.emit(
        "student:join",
        { code: studentCode.trim().toUpperCase(), student },
        (r: { ok: boolean; error?: string }) => {
          if (!r.ok) {
            setError(r.error || "입장 실패");
            setLoading(false);
            return;
          }
          setStudent({
            roomCode: studentCode.trim().toUpperCase(),
            name: studentName.trim(),
            gender,
            avatar,
            id,
          });
          router.push("/classroom");
        }
      );
    } catch {
      setError("서버 연결 실패");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 60L60 0M30 60L60 30M0 30L30 0' stroke='%230b6e4f22' stroke-width='1' fill='none'/%3E%3C/svg%3E\")",
        }}
      />
      <main className="relative max-w-6xl mx-auto px-4 py-10 md:py-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
        <section className="space-y-5">
          <p className="text-sm font-semibold tracking-wide text-[var(--mint)]">
            2022 개정 교육과정 · NCIC 성취기준
          </p>
          <h1 className="brand-display text-4xl md:text-6xl leading-[1.05]">
            중학교 정보
            <br />
            코스웨어
          </h1>
          <p className="text-base md:text-lg opacity-80 max-w-xl leading-relaxed">
            교사와 학생이 한 교실에서 만나, 컴퓨팅 시스템부터 디지털 문화까지 도입·전개·정리로
            배우고, 실습·형성평가·AI 피드백으로 성장하는 실시간 수업 공간입니다.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {["컴퓨팅 시스템", "데이터", "알고리즘과 프로그래밍", "인공지능", "디지털 문화"].map(
              (t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-white/80 border border-[var(--line)]">
                  {t}
                </span>
              )
            )}
          </div>
        </section>

        <section className="glass rounded-3xl p-6 md:p-8 space-y-5">
          <div className="flex gap-2 p-1 rounded-full bg-[var(--sand)]">
            <button
              className={`flex-1 py-2 rounded-full text-sm font-semibold ${
                tab === "student" ? "bg-white shadow" : ""
              }`}
              onClick={() => setTab("student")}
            >
              학생 입장
            </button>
            <button
              className={`flex-1 py-2 rounded-full text-sm font-semibold ${
                tab === "teacher" ? "bg-white shadow" : ""
              }`}
              onClick={() => setTab("teacher")}
            >
              교사 입장
            </button>
          </div>

          {tab === "student" ? (
            <div className="space-y-3">
              <label className="block text-sm">
                수업 코드
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 bg-white uppercase"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="예: AB12CD"
                />
              </label>
              <label className="block text-sm">
                이름
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 bg-white"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="홍길동"
                />
              </label>
              <label className="block text-sm">
                성별
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2 bg-white"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | "")}
                >
                  <option value="">선택하세요</option>
                  <option value="남">남</option>
                  <option value="여">여</option>
                </select>
              </label>
              {previewAvatar && (
                <div className="rounded-2xl bg-[var(--sand)] p-4 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarSvgDataUrl(previewAvatar)}
                    alt="avatar preview"
                    width={64}
                    height={76}
                    className="floaty"
                  />
                  <div className="text-sm">
                    <div className="font-semibold">아바타 미리보기</div>
                    <div className="opacity-70">입장 시 수업 화면에 표시됩니다.</div>
                  </div>
                </div>
              )}
              <button
                disabled={loading}
                onClick={joinStudent}
                className="w-full py-3 rounded-2xl bg-[var(--mint)] text-white font-semibold disabled:opacity-50"
              >
                수업 입장하기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm">
                  교사 이름
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 bg-white"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  수업 비밀번호 (임의 생성 가능)
                  <div className="mt-1 flex gap-2">
                    <input
                      className="w-full rounded-xl border px-3 py-2 bg-white font-mono"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="px-3 rounded-xl border bg-white text-sm"
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
                  새 수업 만들기
                </button>
              </div>
              <div className="border-t pt-4 space-y-3">
                <div className="text-sm font-semibold">기존 수업 재접속</div>
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
                  className="w-full py-2.5 rounded-2xl border bg-white font-semibold disabled:opacity-50"
                >
                  교사로 재접속
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-[var(--coral)]">{error}</p>}
        </section>
      </main>
    </div>
  );
}
