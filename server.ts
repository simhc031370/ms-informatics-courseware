import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import {
  addSubmission,
  clearTeacherApiKey,
  createRoom,
  getRoom,
  patchSubmission,
  removeStudent,
  returnSubmissions,
  roomPublicState,
  setFocusMode,
  setTeacherAi,
  updateStudent,
  upsertStudent,
} from "./src/lib/room-store";
import type { AssessmentSubmission, StudentPresence } from "./src/types";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
    maxHttpBufferSize: 5e6,
  });

  function emitRoomUpdate(code: string) {
    const room = getRoom(code);
    if (!room) return;
    const teacherView = roomPublicState(room, { includeSubmissions: true });
    for (const sid of io.sockets.adapter.rooms.get(code) || []) {
      const s = io.sockets.sockets.get(sid);
      if (!s) continue;
      const isTeacher = (s as typeof s & { data: { role?: string } }).data?.role === "teacher";
      if (isTeacher) {
        s.emit("room:update", teacherView);
      } else {
        const sidStudent =
          (s as typeof s & { data: { studentId?: string } }).data?.studentId || "";
        s.emit(
          "room:update",
          roomPublicState(room, { studentId: sidStudent || undefined })
        );
      }
    }
  }

  io.on("connection", (socket) => {
    let role: "teacher" | "student" | null = null;
    let roomCode = "";
    let studentId = "";

    socket.on(
      "teacher:create",
      (
        payload: { teacherName: string; password?: string },
        cb: (r: {
          ok: boolean;
          room?: ReturnType<typeof roomPublicState>;
          password?: string;
          error?: string;
        }) => void
      ) => {
        const room = createRoom(payload.teacherName || "선생님", payload.password);
        role = "teacher";
        roomCode = room.code;
        socket.data.role = "teacher";
        socket.join(room.code);
        cb({
          ok: true,
          room: roomPublicState(room, { includeSubmissions: true }),
          password: room.password,
        });
      }
    );

    socket.on(
      "teacher:join",
      (
        payload: { code: string; password: string },
        cb: (r: {
          ok: boolean;
          room?: ReturnType<typeof roomPublicState>;
          error?: string;
        }) => void
      ) => {
        const room = getRoom(payload.code);
        if (!room) return cb({ ok: false, error: "수업 코드를 찾을 수 없습니다." });
        if (room.password !== payload.password)
          return cb({ ok: false, error: "비밀번호가 올바르지 않습니다." });
        role = "teacher";
        roomCode = room.code;
        socket.data.role = "teacher";
        socket.join(room.code);
        cb({ ok: true, room: roomPublicState(room, { includeSubmissions: true }) });
      }
    );

    socket.on(
      "student:join",
      (
        payload: { code: string; student: StudentPresence },
        cb: (r: {
          ok: boolean;
          room?: ReturnType<typeof roomPublicState>;
          error?: string;
        }) => void
      ) => {
        const room = getRoom(payload.code);
        if (!room) return cb({ ok: false, error: "수업 코드를 찾을 수 없습니다." });
        role = "student";
        roomCode = room.code;
        studentId = payload.student.id;
        socket.data.role = "student";
        socket.data.studentId = studentId;
        const student = {
          ...payload.student,
          online: true,
          joinedAt: Date.now(),
          lastSeen: Date.now(),
        };
        upsertStudent(room.code, student);
        socket.join(room.code);
        emitRoomUpdate(room.code);
        cb({ ok: true, room: roomPublicState(room, { studentId }) });
      }
    );

    socket.on("presence:update", (patch: Partial<StudentPresence>) => {
      if (!roomCode || !studentId) return;
      const room = getRoom(roomCode);
      if (!room) return;
      if (room.focusMode && patch.location && patch.location !== room.teacherLocation) {
        socket.emit("focus:blocked", {
          teacherScreen: room.teacherScreen,
          teacherLocation: room.teacherLocation,
        });
        return;
      }
      updateStudent(roomCode, studentId, patch);
      emitRoomUpdate(roomCode);
    });

    socket.on(
      "hand:raise",
      (payload: { message?: string }, cb?: (r: { ok: boolean }) => void) => {
        if (!roomCode || !studentId) return;
        const room = getRoom(roomCode);
        if (!room) return;
        updateStudent(roomCode, studentId, {
          handRaised: true,
          handMessage: payload.message || "질문이 있어요!",
        });
        if (!room.handQueue.includes(studentId)) room.handQueue.push(studentId);
        emitRoomUpdate(roomCode);
        io.to(roomCode).emit("hand:notify", {
          studentId,
          name: room.students[studentId]?.name,
          message: payload.message,
        });
        cb?.({ ok: true });
      }
    );

    socket.on("hand:lower", (targetId?: string) => {
      if (!roomCode) return;
      const room = getRoom(roomCode);
      if (!room) return;
      const id = role === "teacher" ? targetId || "" : studentId;
      if (!id) return;
      updateStudent(roomCode, id, { handRaised: false, handMessage: undefined });
      room.handQueue = room.handQueue.filter((x) => x !== id);
      emitRoomUpdate(roomCode);
    });

    socket.on(
      "focus:set",
      (payload: { enabled: boolean; teacherScreen?: string; teacherLocation?: string }) => {
        if (role !== "teacher" || !roomCode) return;
        const room = setFocusMode(roomCode, payload.enabled, payload.teacherScreen);
        if (!room) return;
        if (payload.teacherLocation) room.teacherLocation = payload.teacherLocation;
        emitRoomUpdate(roomCode);
        io.to(roomCode).emit("focus:changed", {
          enabled: room.focusMode,
          teacherScreen: room.teacherScreen,
          teacherLocation: room.teacherLocation,
        });
      }
    );

    socket.on(
      "teacher:ai-settings",
      (payload: { aiProvider: "gpt" | "gemini" | "claude"; apiKey: string }) => {
        if (role !== "teacher" || !roomCode) return;
        const room = setTeacherAi(roomCode, payload.aiProvider, payload.apiKey);
        if (room) emitRoomUpdate(roomCode);
      }
    );

    socket.on("teacher:clear-api-key", () => {
      if (role !== "teacher" || !roomCode) return;
      const room = clearTeacherApiKey(roomCode);
      if (room) emitRoomUpdate(roomCode);
    });

    socket.on("teacher:location", (location: string) => {
      if (role !== "teacher" || !roomCode) return;
      const room = getRoom(roomCode);
      if (!room) return;
      room.teacherLocation = location;
      if (room.focusMode) {
        room.teacherScreen = location;
        io.to(roomCode).emit("focus:changed", {
          enabled: true,
          teacherScreen: location,
          teacherLocation: location,
        });
      }
      emitRoomUpdate(roomCode);
    });

    socket.on("assessment:submit", (submission: AssessmentSubmission) => {
      if (!roomCode) return;
      const payload: AssessmentSubmission = {
        ...submission,
        graded: false,
        status: "saved",
        autoScore: undefined,
        aiFeedback: undefined,
        questionFeedback: undefined,
        questionScores: undefined,
        gradedAt: undefined,
        returnedAt: undefined,
      };
      addSubmission(roomCode, payload);
      emitRoomUpdate(roomCode);
      for (const sid of io.sockets.adapter.rooms.get(roomCode) || []) {
        const s = io.sockets.sockets.get(sid);
        if (s && (s as typeof s & { data: { role?: string } }).data?.role === "teacher") {
          s.emit("assessment:new", payload);
        }
      }
    });

    socket.on(
      "assessment:grade",
      (
        payload: {
          id: string;
          autoScore?: number;
          aiFeedback?: string;
          aiSummary?: string;
          questionFeedback?: Record<string, string>;
          questionScores?: Record<string, number>;
          teacherFeedback?: string;
          graded?: boolean;
          gradedAt?: number;
          status?: AssessmentSubmission["status"];
        }
      ) => {
        if (role !== "teacher" || !roomCode) return;
        const existing = getRoom(roomCode)?.submissions.find((s) => s.id === payload.id);
        if (!existing) return;

        const patch: Partial<AssessmentSubmission> = {};
        if (payload.autoScore !== undefined) patch.autoScore = payload.autoScore;
        if (payload.aiFeedback !== undefined) patch.aiFeedback = payload.aiFeedback;
        if (payload.aiSummary !== undefined) patch.aiSummary = payload.aiSummary;
        if (payload.questionFeedback !== undefined) patch.questionFeedback = payload.questionFeedback;
        if (payload.questionScores !== undefined) patch.questionScores = payload.questionScores;
        if (payload.teacherFeedback !== undefined) patch.teacherFeedback = payload.teacherFeedback;
        if (payload.graded !== undefined) patch.graded = payload.graded;
        if (payload.gradedAt !== undefined) patch.gradedAt = payload.gradedAt;
        if (payload.status !== undefined) patch.status = payload.status;
        else if (existing.status === "saved") {
          patch.graded = true;
          patch.gradedAt = payload.gradedAt || Date.now();
          patch.status = "graded";
        }

        const updated = patchSubmission(roomCode, payload.id, patch);
        if (!updated) return;
        emitRoomUpdate(roomCode);
        // 이미 반환된 건이면 학생 화면도 즉시 갱신
        if (updated.status === "returned") {
          io.to(roomCode).emit("assessment:returned", updated);
        }
      }
    );

    socket.on("assessment:return", (ids: string[]) => {
      if (role !== "teacher" || !roomCode) return;
      const result = returnSubmissions(roomCode, ids || []);
      if (!result) return;
      emitRoomUpdate(roomCode);
      for (const sub of result.returned) {
        io.to(roomCode).emit("assessment:returned", sub);
      }
    });

    socket.on("monitor:start", () => {
      if (role !== "teacher" || !roomCode) return;
      io.to(roomCode).emit("monitor:request", { enabled: true });
    });

    socket.on("monitor:stop", () => {
      if (role !== "teacher" || !roomCode) return;
      io.to(roomCode).emit("monitor:request", { enabled: false });
    });

    socket.on(
      "monitor:frame",
      (payload: { studentId: string; name: string; locationLabel: string; image: string }) => {
        if (role !== "student" || !roomCode) return;
        io.to(roomCode).emit("monitor:frame", {
          ...payload,
          studentId: studentId || payload.studentId,
          at: Date.now(),
        });
      }
    );

    socket.on("disconnect", () => {
      if (role === "teacher" && roomCode) {
        clearTeacherApiKey(roomCode);
        emitRoomUpdate(roomCode);
      }
      if (roomCode && studentId) {
        removeStudent(roomCode, studentId);
        emitRoomUpdate(roomCode);
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> 중학교 정보 교과 코스웨어 (Informatics Courseware) ready on http://${hostname}:${port}`);
  });
});
