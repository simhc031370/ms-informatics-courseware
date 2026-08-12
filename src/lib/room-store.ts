import type { AiProvider, AssessmentSubmission, ClassroomRoom, StudentPresence } from "@/types";
import { loadRoomsFromDisk, scheduleSaveRooms } from "@/lib/room-persist";

/** Next API 라우트와 custom server(socket)가 서로 다른 모듈 인스턴스를 써도 같은 Map을 쓰도록 */
const globalForRooms = globalThis as typeof globalThis & {
  __msCoursewareRooms?: Map<string, ClassroomRoom>;
  __msCoursewareRoomsLoaded?: boolean;
};
const rooms = globalForRooms.__msCoursewareRooms ?? new Map<string, ClassroomRoom>();
globalForRooms.__msCoursewareRooms = rooms;

if (!globalForRooms.__msCoursewareRoomsLoaded) {
  loadRoomsFromDisk(rooms);
  globalForRooms.__msCoursewareRoomsLoaded = true;
}

function touchPersist() {
  scheduleSaveRooms(rooms);
}

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
  touchPersist();
  return room;
}

export function getRoom(code: string) {
  return rooms.get(code.toUpperCase());
}

export function upsertStudent(code: string, student: StudentPresence) {
  const room = getRoom(code);
  if (!room) return null;
  room.students[student.id] = student;
  touchPersist();
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
  touchPersist();
  return room.students[studentId];
}

export function setFocusMode(code: string, enabled: boolean, teacherScreen?: string) {
  const room = getRoom(code);
  if (!room) return null;
  room.focusMode = enabled;
  room.teacherScreen = enabled ? teacherScreen : undefined;
  touchPersist();
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
  // API 키는 디스크에 저장하지 않음
  return room;
}

export function clearTeacherApiKey(code: string) {
  const room = getRoom(code);
  if (!room) return null;
  room.apiKey = undefined;
  return room;
}

export function addSubmission(code: string, submission: AssessmentSubmission) {
  const room = getRoom(code);
  if (!room) return null;
  room.submissions = room.submissions.filter(
    (s) =>
      !(
        s.studentId === submission.studentId &&
        s.lessonId === submission.lessonId &&
        s.status !== "returned"
      )
  );
  room.submissions.unshift(submission);
  touchPersist();
  return room;
}

export function patchSubmission(
  code: string,
  id: string,
  patch: Partial<AssessmentSubmission>
) {
  const room = getRoom(code);
  if (!room) return null;
  const idx = room.submissions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  room.submissions[idx] = { ...room.submissions[idx], ...patch };
  touchPersist();
  return room.submissions[idx];
}

export function returnSubmissions(code: string, ids: string[]) {
  const room = getRoom(code);
  if (!room) return null;
  const now = Date.now();
  const returned: AssessmentSubmission[] = [];
  for (const id of ids) {
    const sub = room.submissions.find((s) => s.id === id);
    if (!sub || !sub.graded) continue;
    sub.status = "returned";
    sub.returnedAt = now;
    returned.push(sub);
    if (sub.autoScore != null && room.students[sub.studentId]) {
      const prev = room.students[sub.studentId].score || 0;
      room.students[sub.studentId].score = Math.max(prev, sub.autoScore);
    }
  }
  touchPersist();
  return { room, returned };
}

export function roomPublicState(
  room: ClassroomRoom,
  opts?: { includeSubmissions?: boolean; studentId?: string }
) {
  let submissions: AssessmentSubmission[] = [];
  if (opts?.includeSubmissions) {
    submissions = room.submissions;
  } else if (opts?.studentId) {
    // 학생은 본인 제출·채점·반환 내역만
    submissions = room.submissions.filter((s) => s.studentId === opts.studentId);
  }

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
    submissions,
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
  touchPersist();
}
