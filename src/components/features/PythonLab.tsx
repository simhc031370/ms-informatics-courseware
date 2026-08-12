"use client";

import { useEffect, useRef, useState } from "react";
import type { AiProvider } from "@/types";

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<{
      runPythonAsync: (code: string) => Promise<unknown>;
      setStdout: (opts: { batched: (s: string) => void }) => void;
      setStderr: (opts: { batched: (s: string) => void }) => void;
    }>;
  }
}

export function PythonLab({
  provider,
  apiKey,
  roomCode,
  task = "과제에 맞는 프로그램을 직접 작성하세요.",
}: {
  provider: AiProvider;
  apiKey: string;
  roomCode?: string;
  task?: string;
}) {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const pyodideRef = useRef<Awaited<ReturnType<NonNullable<typeof window.loadPyodide>>> | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Pyodide 로드 실패"));
          document.body.appendChild(script);
        });
      }
      if (cancelled || !window.loadPyodide) return;
      const py = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
      });
      pyodideRef.current = py;
      setReady(true);
    }
    boot().catch((e) => setError(e instanceof Error ? e.message : "초기화 실패"));
    return () => {
      cancelled = true;
    };
  }, []);

  async function run() {
    if (!pyodideRef.current) return;
    setRunning(true);
    setError("");
    let out = "";
    try {
      pyodideRef.current.setStdout({
        batched: (s) => {
          out += s + "\n";
        },
      });
      pyodideRef.current.setStderr({
        batched: (s) => {
          out += s + "\n";
        },
      });
      await pyodideRef.current.runPythonAsync(code);
      setOutput(out.trim() || "(출력 없음)");
    } catch (e) {
      setOutput(out);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  async function grade() {
    setFeedback("");
    setError("");
    try {
      const res = await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "python",
          provider,
          apiKey,
          roomCode,
          task,
          code,
          output: output + (error ? `\n[오류]\n${error}` : ""),
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "채점 실패");
      setFeedback(data.feedback);
    } catch (e) {
      setError(e instanceof Error ? e.message : "채점 실패");
    }
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <h3 className="brand-display text-xl">파이썬 실습 랩</h3>
      <p className="text-sm opacity-80">과제: {task}</p>
      <textarea
        className="w-full min-h-56 rounded-xl border p-3 font-mono text-sm bg-[#0f172a] text-[#e2e8f0]"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="# 여기에 직접 코드를 작성하세요"
        spellCheck={false}
      />
      <div className="flex flex-wrap gap-2">
        <button
          onClick={run}
          disabled={!ready || running}
          className="px-4 py-2 rounded-xl bg-[var(--sky)] text-white disabled:opacity-50"
        >
          {!ready ? "엔진 준비 중..." : running ? "실행 중..." : "실행"}
        </button>
        <button
          onClick={grade}
          className="px-4 py-2 rounded-xl bg-[var(--mint)] text-white disabled:opacity-50"
        >
          AI 채점·피드백
        </button>
      </div>
      <pre className="rounded-xl bg-black text-green-300 p-3 text-sm min-h-24 overflow-auto">
        {output || "실행 결과가 여기에 표시됩니다."}
      </pre>
      {error && <p className="text-sm text-[var(--coral)] whitespace-pre-wrap">{error}</p>}
      {feedback && (
        <div className="rounded-xl border bg-white p-4 text-sm whitespace-pre-wrap">{feedback}</div>
      )}
    </div>
  );
}
