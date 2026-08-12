"use client";

import { useState } from "react";
import {
  doubleDecryptApiKey,
  doubleEncryptApiKey,
  maskApiKey,
} from "@/lib/api-key-crypto";
import type { AiProvider } from "@/types";

export function TeacherSettingsPanel({
  aiProvider,
  setAiProvider,
  roomPassword,
  hasServerKey,
  maskedKey,
  onSavePlainKey,
  onClearKey,
}: {
  aiProvider: AiProvider;
  setAiProvider: (p: AiProvider) => void;
  roomPassword: string;
  hasServerKey: boolean;
  maskedKey: string;
  onSavePlainKey: (plainKey: string, provider: AiProvider) => Promise<void> | void;
  onClearKey: () => void;
}) {
  const [draftKey, setDraftKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function save() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const plain = draftKey.trim();
      if (!plain) {
        setErr("API 키를 입력하세요.");
        return;
      }
      if (!roomPassword) {
        setErr("수업 비밀번호가 없어 암호화할 수 없습니다.");
        return;
      }

      // 이중 암호화 검증(저장 전 암·복호화 라운드트립)
      const enc = await doubleEncryptApiKey(plain, roomPassword);
      const roundtrip = await doubleDecryptApiKey(enc, roomPassword);
      if (roundtrip !== plain) throw new Error("암호화 검증에 실패했습니다.");

      // 서버 세션 메모리에는 평문 키만 잠시 보관(페이지 종료 시 삭제)
      // 전송 직전·직후에도 화면 입력란은 비웁니다.
      await onSavePlainKey(plain, aiProvider);
      setDraftKey("");
      setMsg(
        "API 키가 이중 암호화 검증 후 세션에 등록되었습니다. 페이지를 닫으면 즉시 삭제됩니다."
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass rounded-2xl p-6 space-y-4 max-w-xl">
      <div>
        <h2 className="brand-display text-2xl mb-1">개인설정</h2>
        <p className="text-sm opacity-70">교사 전용 AI API 키와 채점 엔진을 설정합니다.</p>
      </div>

      <div
        className="rounded-xl border px-4 py-3 text-sm leading-relaxed"
        style={{ background: "#fff4e8", borderColor: "#f0c48a" }}
      >
        <b>주의</b>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>API 키는 <b>이중 암호화(AES-GCM × 2)</b>로 검증·보호합니다.</li>
          <li>키는 <b>이 브라우저 세션 메모리</b>와 수업 서버 메모리에만 잠시 보관됩니다.</li>
          <li>
            <b>웹페이지를 나가거나 닫으면 키가 삭제</b>됩니다. 새로고침·탭 종료 후에도 다시
            입력해야 합니다.
          </li>
          <li>학생에게 키를 공유하거나 채팅·캡처로 남기지 마세요.</li>
          <li>학교·개인 발급 키 사용 규정을 지키고, 유출 시 즉시 재발급하세요.</li>
        </ul>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">AI 제공자</div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["gpt", "OpenAI GPT-5.6"],
              ["gemini", "Google Gemini 3.6 Flash"],
              ["claude", "Anthropic Claude Sonnet 5"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setAiProvider(id)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                aiProvider === id ? "bg-[var(--sky)] text-white border-transparent" : "bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm">
        API 키
        <input
          type="password"
          autoComplete="off"
          className="mt-1 w-full rounded-xl border px-3 py-2.5 bg-white font-mono"
          placeholder="발급받은 API 키 입력"
          value={draftKey}
          onChange={(e) => setDraftKey(e.target.value)}
        />
      </label>

      <div className="text-xs opacity-70">
        현재 세션:{" "}
        {hasServerKey || maskedKey ? (
          <span className="text-[var(--mint)] font-semibold">
            등록됨 {maskedKey ? `(${maskApiKey(maskedKey)})` : ""}
          </span>
        ) : (
          <span className="text-[var(--coral)]">미등록</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={save}
          className="px-4 py-2 rounded-xl bg-[var(--mint)] text-white text-sm disabled:opacity-50"
        >
          {busy ? "암호화·저장 중..." : "이중 암호화 후 저장"}
        </button>
        <button
          type="button"
          onClick={() => {
            setDraftKey("");
            onClearKey();
            setMsg("API 키가 세션에서 삭제되었습니다.");
          }}
          className="px-4 py-2 rounded-xl border bg-white text-sm"
        >
          지금 삭제
        </button>
      </div>

      {msg && <p className="text-sm text-[var(--mint)]">{msg}</p>}
      {err && <p className="text-sm text-[var(--coral)]">{err}</p>}
    </section>
  );
}
