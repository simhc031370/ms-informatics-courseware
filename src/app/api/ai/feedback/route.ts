import { NextRequest, NextResponse } from "next/server";
import {
  algorithmFeedbackPrompt,
  callAi,
  essayFeedbackPrompt,
  pythonGradePrompt,
} from "@/lib/ai";
import { getRoom } from "@/lib/room-store";
import type { AiProvider } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type,
      provider: providerIn,
      apiKey: apiKeyIn,
      roomCode,
      problem,
      answer,
      question,
      rubric,
      sample,
      task,
      code,
      output,
    } = body as {
      type: "algorithm" | "essay" | "python";
      provider?: AiProvider;
      apiKey?: string;
      roomCode?: string;
      problem?: string;
      answer?: string;
      question?: string;
      rubric?: string;
      sample?: string;
      task?: string;
      code?: string;
      output?: string;
    };

    let provider: AiProvider = providerIn || "gpt";
    let apiKey = apiKeyIn || "";

    // 서버 세션 키가 있으면 우선, 없으면 요청에 실린 교사 세션 키 사용
    if (roomCode) {
      const room = getRoom(roomCode);
      if (room?.apiKey) {
        apiKey = room.apiKey;
        provider = room.aiProvider;
      } else if (!apiKey && room) {
        provider = room.aiProvider || provider;
      }
    }

    let prompts;
    if (type === "algorithm") {
      prompts = algorithmFeedbackPrompt(problem || "", answer || "");
    } else if (type === "python") {
      prompts = pythonGradePrompt(task || "", code || "", output || "");
    } else {
      prompts = essayFeedbackPrompt(question || "", answer || "", rubric, sample);
    }

    const feedback = await callAi({
      provider,
      apiKey,
      ...prompts,
    });

    const scoreMatch = feedback.match(/(\d{1,3})\s*점/);
    const score = scoreMatch ? Math.min(100, Number(scoreMatch[1])) : undefined;

    return NextResponse.json({ ok: true, feedback, score });
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI 요청 실패";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
