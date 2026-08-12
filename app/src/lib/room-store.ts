import type { AiProvider, AssessmentSubmission, ClassroomRoom, StudentPresence } from "@/types";

const rooms = new Map<string, ClassroomRoom>();

function randomCode(len = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function createRoom(teacherName: string, password?: string): ClassroomRoom {
  let code = randomCode();
  while (rooms.has(code)) code = randomCode();
  const room: ClassroomRoom = {
    code,
    password: password || randomCode(8),
    teacherName,
    createdAt: Date.now(),
    students: {},
    focusMode: false,
    teacherLocation: "lobby",
    aiProvider: "gpt",
    submissions: [],
    handQueue: [],
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code: string) {
  return rooms.get(code.toUpperCase());
}

export function upsertStudent(code: string, student: StudentPresence) {
  const room = getRoom(code);
  if (!room) return null;
  room.students[student.id] = student;
  return room;
}

export function updateStudent(
  code: string,
  studentId: string,
  patch: Partial<StudentPresence>
) {
  const room = getRoom(code);
  if (!room || !room.students[studentId]) return null;
  room.students[studentId] = {
    ...room.students[studentId],
    ...patch,
    lastSeen: Date.now(),
  };
  return room.students[studentId];
}

export function setFocusMode(code: string, enabled: boolean, teacherScreen?: string) {
  const room = getRoom(code);
  if (!room) return null;
  room.focusMode = enabled;
  room.teacherScreen = enabled ? teacherScreen : undefined;
  return room;
}

export function setTeacherAi(
  code: string,
  aiProvider: AiProvider,
  apiKey: string
) {
  const room = getRoom(code);
  if (!room) return null;
  room.aiProvider = aiProvider;
  room.apiKey = apiKey;
  return room;
}

export function addSubmission(code: string, submission: AssessmentSubmission) {
  const room = getRoom(code);
  if (!room) return null;
  room.submissions.unshift(submission);
  return room;
}

export function roomPublicState(room: ClassroomRoom) {
  return {
    code: room.code,
    teacherName: room.teacherName,
    focusMode: room.focusMode,
    teacherScreen: room.teacherScreen,
    teacherLocation: room.teacherLocation,
    aiProvider: room.aiProvider,
    hasApiKey: Boolean(room.apiKey),
    students: Object.values(room.students).filter((s) => s.online),
    handQueue: room.handQueue,
    submissions: room.submissions,
  };
}

export function removeStudent(code: string, studentId: string) {
  const room = getRoom(code);
  if (!room) return;
  if (room.students[studentId]) {
    room.students[studentId].online = false;
    room.students[studentId].handRaised = false;
  }
  room.handQueue = room.handQueue.filter((id) => id !== studentId);
}
