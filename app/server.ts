import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import {
  addSubmission,
  createRoom,
  getRoom,
  removeStudent,
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
  });

  io.on("connection", (socket) => {
    let role: "teacher" | "student" | null = null;
    let roomCode = "";
    let studentId = "";

    socket.on(
      "teacher:create",
      (
        payload: { teacherName: string; password?: string },
        cb: (r: { ok: boolean; room?: ReturnType<typeof roomPublicState>; password?: string; error?: string }) => void
      ) => {
        const room = createRoom(payload.teacherName || "선생님", payload.password);
        role = "teacher";
        roomCode = room.code;
        socket.join(room.code);
        cb({ ok: true, room: roomPublicState(room), password: room.password });
      }
    );

    socket.on(
      "teacher:join",
      (
        payload: { code: string; password: string },
        cb: (r: { ok: boolean; room?: ReturnType<typeof roomPublicState>; error?: string }) => void
      ) => {
        const room = getRoom(payload.code);
        if (!room) return cb({ ok: false, error: "수업 코드를 찾을 수 없습니다." });
        if (room.password !== payload.password)
          return cb({ ok: false, error: "비밀번호가 올바르지 않습니다." });
        role = "teacher";
        roomCode = room.code;
        socket.join(room.code);
        cb({ ok: true, room: roomPublicState(room) });
      }
    );

    socket.on(
      "student:join",
      (
        payload: { code: string; student: StudentPresence },
        cb: (r: { ok: boolean; room?: ReturnType<typeof roomPublicState>; error?: string }) => void
      ) => {
        const room = getRoom(payload.code);
        if (!room) return cb({ ok: false, error: "수업 코드를 찾을 수 없습니다." });
        role = "student";
        roomCode = room.code;
        studentId = payload.student.id;
        const student = {
          ...payload.student,
          online: true,
          joinedAt: Date.now(),
          lastSeen: Date.now(),
        };
        upsertStudent(room.code, student);
        socket.join(room.code);
        io.to(room.code).emit("room:update", roomPublicState(room));
        cb({ ok: true, room: roomPublicState(room) });
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
      const updated = getRoom(roomCode);
      if (updated) io.to(roomCode).emit("room:update", roomPublicState(updated));
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
        io.to(roomCode).emit("room:update", roomPublicState(room));
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
      io.to(roomCode).emit("room:update", roomPublicState(room));
    });

    socket.on(
      "focus:set",
      (payload: { enabled: boolean; teacherScreen?: string; teacherLocation?: string }) => {
        if (role !== "teacher" || !roomCode) return;
        const room = setFocusMode(roomCode, payload.enabled, payload.teacherScreen);
        if (!room) return;
        if (payload.teacherLocation) room.teacherLocation = payload.teacherLocation;
        io.to(roomCode).emit("room:update", roomPublicState(room));
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
        if (room) io.to(roomCode).emit("room:update", roomPublicState(room));
      }
    );

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
      io.to(roomCode).emit("room:update", roomPublicState(room));
    });

    socket.on("assessment:submit", (submission: AssessmentSubmission) => {
      if (!roomCode) return;
      addSubmission(roomCode, submission);
      const room = getRoom(roomCode);
      if (!room) return;
      if (submission.autoScore != null && studentId) {
        const prev = room.students[studentId]?.score || 0;
        updateStudent(roomCode, studentId, {
          score: Math.max(prev, submission.autoScore),
        });
      }
      io.to(roomCode).emit("room:update", roomPublicState(getRoom(roomCode)!));
      io.to(roomCode).emit("assessment:new", submission);
    });

    socket.on("disconnect", () => {
      if (roomCode && studentId) {
        removeStudent(roomCode, studentId);
        const room = getRoom(roomCode);
        if (room) io.to(roomCode).emit("room:update", roomPublicState(room));
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> 중학교 정보 코스웨어 ready on http://${hostname}:${port}`);
  });
});
