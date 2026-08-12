/**
 * 형성평가가 2문항인 수업에 q3·q4를 추가해 3~4문항(2~5 범위)으로 맞춥니다.
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../src/data/curriculum.ts");
let src = fs.readFileSync(file, "utf8");

const extrasByHint = [
  {
    short: "오늘 배운 핵심 용어 하나를 고르고, 그 뜻을 친구 말로 짧게 쓰시오.",
    essay: "오늘 내용 중 친구에게 가장 중요했던 점과 그 이유를 사례와 함께 서술하시오.",
  },
  {
    short: "수업에서 다룬 절차(또는 단계)를 순서대로 나열하시오.",
    essay: "잘못 이해하기 쉬운 부분을 하나 짚고, 올바른 이해를 설명해 보시오.",
  },
  {
    short: "이 개념이 실생활에서 쓰이는 예를 한 가지 쓰시오.",
    essay: "같은 주제를 친구에게 가르친다면 어떤 비유로 설명할지 서술하시오.",
  },
];

let i = 0;
let added = 0;

src = src.replace(/assessment:\s*\[([\s\S]*?)\n(\s*)\],/g, (full, body, indent) => {
  const qCount = (body.match(/\bid:\s*"(q\d+)"/g) || []).length;
  if (qCount >= 3 && qCount <= 5) return full;
  if (qCount > 5) return full;

  const pack = extrasByHint[i % extrasByHint.length];
  i += 1;

  let inject = "";
  if (qCount < 3) {
    inject += `,
${indent}  {
${indent}    id: "q3",
${indent}    type: "short",
${indent}    prompt: ${JSON.stringify(pack.short)},
${indent}    sampleAnswer: "수업 핵심을 자신의 언어로 요약한 답",
${indent}  }`;
  }
  if (qCount < 4) {
    inject += `,
${indent}  {
${indent}    id: "q4",
${indent}    type: "essay",
${indent}    prompt: ${JSON.stringify(pack.essay)},
${indent}    rubric: "개념 이해, 구체성, 논리성, 중학생 수준의 표현",
${indent}  }`;
  }

  if (!inject) return full;
  added += 1;
  const cleaned = body.replace(/,\s*$/, "");
  return `assessment: [${cleaned}${inject}\n${indent}],`;
});

fs.writeFileSync(file, src, "utf8");
console.log("expanded assessments:", added);
console.log("korean ok:", /[가-힣]/.test(src));
