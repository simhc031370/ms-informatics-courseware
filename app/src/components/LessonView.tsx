"use client";

import type { AiProvider, AssessmentSubmission, LessonContent } from "@/types";
import { Pc3DViewer } from "@/components/features/Pc3DViewer";
import { NumberBaseLab } from "@/components/features/NumberBaseLab";
import { AlgorithmAiLab } from "@/components/features/AlgorithmAiLab";
import { PythonLab } from "@/components/features/PythonLab";
import { AiModelLab } from "@/components/features/AiModelLab";
import { DigitalCultureLab } from "@/components/features/DigitalCultureLab";
import { AssessmentPanel } from "@/components/AssessmentPanel";

function Phase({
  phase,
  variant,
}: {
  phase: LessonContent["intro"];
  variant: "intro" | "dev" | "sum";
}) {
  return (
    <section className={`phase-card ${variant === "dev" ? "dev" : variant === "sum" ? "sum" : ""}`}>
      <h3 className="font-semibold text-lg mb-2">{phase.title}</h3>
      <ul className="space-y-2 text-sm leading-relaxed">
        {phase.content.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      {phase.activities && phase.activities.length > 0 && (
        <div className="mt-3 rounded-xl bg-[var(--sand)] p-3 text-sm">
          <div className="font-semibold mb-1">활동</div>
          <ul className="list-disc pl-5 space-y-1">
            {phase.activities.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function LessonView({
  lesson,
  provider,
  apiKey,
  roomCode,
  studentId,
  studentName,
  onSubmitted,
}: {
  lesson: LessonContent;
  provider: AiProvider;
  apiKey: string;
  roomCode?: string;
  studentId?: string;
  studentName?: string;
  onSubmitted?: (submission: AssessmentSubmission, score: number) => void;
}) {
  return (
    <div className="space-y-5">
      <header className="glass rounded-2xl p-5">
        <div className="text-xs opacity-70 mb-1">{lesson.standards.join(" · ")}</div>
        <h2 className="brand-display text-2xl md:text-3xl">{lesson.title}</h2>
        <ul className="mt-3 text-sm space-y-1">
          {lesson.objectives.map((o, i) => (
            <li key={i}>• {o}</li>
          ))}
        </ul>
      </header>

      <Phase phase={lesson.intro} variant="intro" />
      <Phase phase={lesson.development} variant="dev" />

      <section className="glass rounded-2xl p-5">
        <h3 className="font-semibold text-lg mb-2">연계 영상 (5분 내외 권장)</h3>
        <p className="text-sm opacity-80 mb-3">{lesson.youtubeTitle}</p>
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${lesson.youtubeId}`}
            title={lesson.youtubeTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>

      {lesson.specialFeature === "pc-3d" && <Pc3DViewer />}
      {lesson.specialFeature === "number-base" && <NumberBaseLab />}
      {lesson.specialFeature === "algorithm-ai" && (
        <AlgorithmAiLab provider={provider} apiKey={apiKey} roomCode={roomCode} />
      )}
      {lesson.specialFeature === "python-lab" && (
        <PythonLab provider={provider} apiKey={apiKey} roomCode={roomCode} />
      )}
      {lesson.specialFeature === "ai-model-lab" && <AiModelLab />}
      {lesson.specialFeature === "digital-culture" && <DigitalCultureLab />}

      <Phase phase={lesson.summary} variant="sum" />

      <AssessmentPanel
        lessonId={lesson.id}
        questions={lesson.assessment}
        provider={provider}
        apiKey={apiKey}
        roomCode={roomCode}
        studentId={studentId}
        studentName={studentName}
        onSubmitted={onSubmitted}
      />
    </div>
  );
}
