export type Gender = "남" | "여";

export type AiProvider = "gpt" | "gemini" | "claude";

export interface AvatarConfig {
  seed: string;
  skin: string;
  hair: string;
  shirt: string;
  accessory: string;
  gender: Gender;
}

export interface StudentPresence {
  id: string;
  name: string;
  gender: Gender;
  avatar: AvatarConfig;
  location: string;
  locationLabel: string;
  score: number;
  handRaised: boolean;
  handMessage?: string;
  online: boolean;
  joinedAt: number;
  lastSeen: number;
}

export interface TeacherSettings {
  aiProvider: AiProvider;
  apiKey: string;
  focusMode: boolean;
  shareScreenUrl?: string;
}

export interface ClassroomRoom {
  code: string;
  password: string;
  teacherName: string;
  createdAt: number;
  students: Record<string, StudentPresence>;
  focusMode: boolean;
  teacherScreen?: string;
  teacherLocation: string;
  aiProvider: AiProvider;
  apiKey?: string;
  submissions: AssessmentSubmission[];
  handQueue: string[];
}

export interface AssessmentQuestion {
  id: string;
  type: "short" | "essay";
  prompt: string;
  sampleAnswer?: string;
  rubric?: string;
}

export interface AssessmentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string;
  answers: Record<string, string>;
  autoScore?: number;
  aiFeedback?: string;
  submittedAt: number;
  graded: boolean;
}

export interface LessonPhase {
  title: string;
  content: string[];
  activities?: string[];
}

export interface LessonContent {
  id: string;
  unitId: string;
  subunitId: string;
  title: string;
  standards: string[];
  objectives: string[];
  youtubeId: string;
  youtubeTitle: string;
  intro: LessonPhase;
  development: LessonPhase;
  summary: LessonPhase;
  assessment: AssessmentQuestion[];
  specialFeature?:
    | "pc-3d"
    | "number-base"
    | "algorithm-ai"
    | "python-lab"
    | "ai-model-lab"
    | "digital-culture";
}

export interface SubUnit {
  id: string;
  title: string;
  description: string;
  lessons: LessonContent[];
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  color: string;
  accent: string;
  description: string;
  standards: string[];
  subunits: SubUnit[];
}
