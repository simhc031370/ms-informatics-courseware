import type { AiProvider } from "@/types";

export interface AiGradeRequest {
  provider: AiProvider;
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
}

export async function callAi({
  provider,
  apiKey,
  systemPrompt,
  userPrompt,
}: AiGradeRequest): Promise<string> {
  if (!apiKey?.trim()) {
    throw new Error("API 키가 설정되지 않았습니다. 교사 설정에서 키를 입력하세요.");
  }

  if (provider === "gpt") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`GPT API 오류: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "응답이 비어 있습니다.";
  }

  if (provider === "gemini") {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini API 오류: ${await res.text()}`);
    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join("") ||
      "응답이 비어 있습니다."
    );
  }

  // Claude
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1200,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API 오류: ${await res.text()}`);
  const data = await res.json();
  return data.content?.map((c: { text?: string }) => c.text || "").join("") || "응답이 비어 있습니다.";
}

export function algorithmFeedbackPrompt(problem: string, answer: string) {
  return {
    systemPrompt:
      "당신은 경력 25년의 중학교 정보 교사입니다. 학생의 알고리즘을 친절하고 구체적으로 피드백하세요. 한국어로, 중학생 눈높이에 맞게, 잘한 점→보완점→다음 도전 순으로 작성하세요. 점수(100점 만점)도 제시하세요.",
    userPrompt: `문제 상황:\n${problem}\n\n학생이 작성한 알고리즘:\n${answer}\n\n피드백과 점수를 주세요.`,
  };
}

export function essayFeedbackPrompt(
  question: string,
  answer: string,
  rubric?: string,
  sample?: string
) {
  return {
    systemPrompt:
      "당신은 중학교 정보 교사이자 평가 전문가입니다. 서술형 답안을 루브릭에 따라 채점·피드백하세요. 한국어, 격려 포함, 점수(100점 만점)와 구체적 개선 조언을 주세요.",
    userPrompt: `문항: ${question}\n루브릭: ${rubric || "성취기준 이해, 논리, 구체성"}\n모범 답안 참고: ${sample || "없음"}\n\n학생 답안:\n${answer}`,
  };
}

export function pythonGradePrompt(task: string, code: string, output: string) {
  return {
    systemPrompt:
      "당신은 중학교 정보 파이썬 수업 교사입니다. 코드의 정확성, 가독성, 요구사항 충족을 평가하세요. 점수(100점)와 피드백을 한국어로 제시하세요. 보안상 위험한 코드가 있으면 경고하세요.",
    userPrompt: `과제:\n${task}\n\n학생 코드:\n\`\`\`python\n${code}\n\`\`\`\n\n실행 결과:\n${output || "(없음)"}`,
  };
}
