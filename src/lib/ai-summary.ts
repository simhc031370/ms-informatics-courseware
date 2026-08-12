/**
 * 문항별 AI 코멘트를 모아 학생이 읽기 쉬운 5줄 이내 문장으로 종합합니다.
 */
export function summarizeAiFeedback(
  questionFeedback?: Record<string, string>,
  aiFeedback?: string,
  maxLines = 5
): string {
  const chunks: string[] = [];

  if (questionFeedback) {
    for (const text of Object.values(questionFeedback)) {
      if (!text?.trim()) continue;
      chunks.push(text);
    }
  } else if (aiFeedback?.trim()) {
    chunks.push(aiFeedback);
  }

  const sentences: string[] = [];
  for (const chunk of chunks) {
    const cleaned = chunk
      .replace(/\[\s*q\d+\s*\]/gi, "")
      .replace(/\(?\s*\d{1,3}\s*점\s*\)?/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const parts = cleaned
      .split(/(?<=[.!?。])\s+|(?<=다\.)\s+|(?<=요\.)\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 10);

    for (const part of parts) {
      if (sentences.length >= maxLines) break;
      const line = part.length > 72 ? `${part.slice(0, 70).trim()}…` : part;
      if (!sentences.includes(line)) sentences.push(line);
    }
    if (sentences.length >= maxLines) break;
  }

  if (sentences.length === 0) {
    return "잘한 점을 바탕으로 조금 더 구체적으로 다듬어 보면 좋겠어요.";
  }

  return sentences.slice(0, maxLines).join("\n");
}
