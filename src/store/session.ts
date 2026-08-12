"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AvatarConfig, Gender, StudentPresence } from "@/types";

interface SessionState {
  role: "teacher" | "student" | null;
  roomCode: string;
  password: string;
  teacherName: string;
  student: StudentPresence | null;
  setTeacher: (data: { roomCode: string; password: string; teacherName: string }) => void;
  setStudent: (data: {
    roomCode: string;
    name: string;
    gender: Gender;
    avatar: AvatarConfig;
    id: string;
  }) => void;
  updateStudentLocal: (patch: Partial<StudentPresence>) => void;
  clear: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      role: null,
      roomCode: "",
      password: "",
      teacherName: "",
      student: null,
      setTeacher: ({ roomCode, password, teacherName }) =>
        set({ role: "teacher", roomCode, password, teacherName, student: null }),
      setStudent: ({ roomCode, name, gender, avatar, id }) =>
        set({
          role: "student",
          roomCode,
          password: "",
          teacherName: "",
          student: {
            id,
            name,
            gender,
            avatar,
            location: "lobby",
            locationLabel: "수업 로비",
            score: 0,
            handRaised: false,
            online: true,
            joinedAt: Date.now(),
            lastSeen: Date.now(),
          },
        }),
      updateStudentLocal: (patch) => {
        const s = get().student;
        if (!s) return;
        set({ student: { ...s, ...patch } });
      },
      clear: () =>
        set({
          role: null,
          roomCode: "",
          password: "",
          teacherName: "",
          student: null,
        }),
    }),
    { name: "ms-info-session" }
  )
);
