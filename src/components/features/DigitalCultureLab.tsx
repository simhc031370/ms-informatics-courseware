"use client";

import { useState } from "react";

const personalInfoCards = [
  { item: "이름", type: "일반 개인정보" },
  { item: "주민등록번호", type: "고유식별정보" },
  { item: "건강정보/종교", type: "민감정보" },
  { item: "학교·학년·반", type: "일반 개인정보" },
  { item: "위치정보", type: "개인정보(결합 시 식별)" },
  { item: "생체정보(지문)", type: "민감·고유 성격" },
];

const cclOptions = [
  {
    id: "BY",
    title: "CC BY",
    desc: "저작자 표시하면 상업적 이용·수정 가능",
  },
  {
    id: "BY-NC",
    title: "CC BY-NC",
    desc: "저작자 표시, 비영리만 이용 가능",
  },
  {
    id: "BY-ND",
    title: "CC BY-ND",
    desc: "저작자 표시, 변경 금지",
  },
  {
    id: "BY-SA",
    title: "CC BY-SA",
    desc: "저작자 표시, 동일 조건 공유",
  },
  {
    id: "BY-NC-SA",
    title: "CC BY-NC-SA",
    desc: "표시 + 비영리 + 동일 조건",
  },
  {
    id: "BY-NC-ND",
    title: "CC BY-NC-ND",
    desc: "표시 + 비영리 + 변경 금지 (가장 제한적)",
  },
];

export function DigitalCultureLab() {
  const [past, setPast] = useState("");
  const [present, setPresent] = useState("");
  const [future, setFuture] = useState("");
  const [selectedCcl, setSelectedCcl] = useState("BY");
  const [privacyNote, setPrivacyNote] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 space-y-3">
        <h3 className="brand-display text-xl">정보사회 과거·현재·미래 활동</h3>
        <p className="text-sm opacity-80">각 시대의 특징과 나의 생각을 적어 보세요.</p>
        {[
          ["과거", past, setPast, "예: 컴퓨터실에서 검색·문서 작성이 중심이었다."],
          ["현재", present, setPresent, "예: 스마트폰·플랫폼·AI 추천이 일상을 바꾼다."],
          ["미래", future, setFuture, "예: 인간-AI 협업과 디지털 시민성이 더 중요해질 것이다."],
        ].map(([label, value, setter, placeholder]) => (
          <div key={label as string}>
            <label className="text-sm font-semibold">{label as string}</label>
            <textarea
              className="mt-1 w-full min-h-20 rounded-xl border p-3 bg-white"
              value={value as string}
              placeholder={placeholder as string}
              onChange={(e) => (setter as (v: string) => void)(e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold text-lg mb-3">개인정보의 종류와 분류</h3>
        <div className="grid md:grid-cols-2 gap-2">
          {personalInfoCards.map((c) => (
            <div key={c.item} className="rounded-xl border bg-white px-3 py-2 text-sm flex justify-between">
              <span>{c.item}</span>
              <span className="text-[var(--sky)] font-medium">{c.type}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm leading-relaxed space-y-1">
          <p>• 보호 방법: 최소 수집, 비밀번호·2단계 인증, 앱 권한 점검, 피싱 주의, 공용 PC 로그아웃</p>
          <p>• 실천: 불필요한 개인정보 공유 금지, 친구 사진 올리기 전 동의 구하기</p>
        </div>
        <textarea
          className="mt-3 w-full min-h-20 rounded-xl border p-3 bg-white"
          placeholder="내가 지키기로 한 개인정보 보호 실천 약속"
          value={privacyNote}
          onChange={(e) => setPrivacyNote(e.target.value)}
        />
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-lg">저작권과 CCL 고르기</h3>
        <p className="text-sm opacity-80">
          내가 만든 발표 자료·그림을 다른 사람이 이용하게 할 때, 어떤 조건을 붙일까요?
        </p>
        <div className="grid md:grid-cols-2 gap-2">
          {cclOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedCcl(opt.id)}
              className={`text-left rounded-xl border p-3 ${
                selectedCcl === opt.id ? "border-[var(--mint)] bg-[#e8f6ef]" : "bg-white"
              }`}
            >
              <div className="font-semibold">{opt.title}</div>
              <div className="text-sm opacity-80">{opt.desc}</div>
            </button>
          ))}
        </div>
        <div className="rounded-xl bg-[var(--sand)] p-3 text-sm">
          선택한 라이선스: <b>{cclOptions.find((c) => c.id === selectedCcl)?.title}</b> — 저작자 표시(BY)는
          거의 모든 CCL의 기본입니다. NC는 비영리, ND는 변경 금지, SA는 동일 조건 공유를 뜻합니다.
        </div>
        <button
          className="px-4 py-2 rounded-xl bg-[var(--coral)] text-white"
          onClick={() => setSaved(true)}
        >
          활동 응답 저장(로컬)
        </button>
        {saved && (
          <p className="text-sm text-[var(--mint)]">
            저장되었습니다. (이 브라우저에 입력 내용이 유지됩니다. 형성평가에도 핵심 내용을 작성하세요.)
          </p>
        )}
      </div>
    </div>
  );
}
