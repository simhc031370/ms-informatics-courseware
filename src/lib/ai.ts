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
        model: "gpt-5.6",
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
    const models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"];
    let lastErr = "";

    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt++) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

        if (res.ok) {
          const data = await res.json();
          return (
            data.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join("") ||
            "응답이 비어 있습니다."
          );
        }

        const body = await res.text();
        lastErr = body;

        // 과부하(503)면 잠시 후 재시도 → 다음 모델로 폴백
        if (res.status === 503 || /high demand|UNAVAILABLE/i.test(body)) {
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
          continue;
        }
        // 404 등 모델 미지원이면 바로 다음 모델
        if (res.status === 404 || /NOT_FOUND|no longer available/i.test(body)) {
          break;
        }
        throw new Error(`Gemini API 오류: ${body}`);
      }
    }

    throw new Error(
      `Gemini 서버가 일시적으로 혼잡합니다(503). 잠시 후 다시 시도하거나, 개인설정에서 GPT/Claude로 바꿔 채점하세요.\n${lastErr}`
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
      model: "claude-sonnet-5",
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
      "당신은 중학교 정보 교사입니다. 답안을 채점하되 피드백은 짧고 친절한 문장 2~3개만 쓰세요. 점수(100점 만점)를 한 줄에 명시하세요. 불릿·장황한 나열은 금지합니다.",
    userPrompt: `문항: ${question}\n루브릭: ${rubric || "성취기준 이해, 논리, 구체성"}\n모범 답안 참고: ${sample || "없음"}\n\n학생 답안:\n${answer}\n\n형식 예:\n78점\n잘한 점을 한 문장으로.\n보완할 점을 한 문장으로.`,
  };
}

export function pythonGradePrompt(task: string, code: string, output: string) {
  return {
    systemPrompt:
      "당신은 중학교 정보 파이썬 수업 교사입니다. 코드의 정확성, 가독성, 요구사항 충족을 평가하세요. 점수(100점)와 피드백을 한국어로 제시하세요. 보안상 위험한 코드가 있으면 경고하세요.",
    userPrompt: `과제:\n${task}\n\n학생 코드:\n\`\`\`python\n${code}\n\`\`\`\n\n실행 결과:\n${output || "(없음)"}`,
  };
}
