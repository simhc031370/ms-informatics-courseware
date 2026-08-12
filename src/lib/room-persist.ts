import fs from "fs";
import path from "path";
import type { ClassroomRoom } from "@/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "rooms.json");

type PersistShape = {
  rooms: ClassroomRoom[];
  savedAt: number;
};

export function loadRoomsFromDisk(into: Map<string, ClassroomRoom>) {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const data = JSON.parse(raw) as PersistShape;
    for (const room of data.rooms || []) {
      if (!room?.code) continue;
      // 재시작 시 전원 오프라인으로
      for (const s of Object.values(room.students || {})) {
        s.online = false;
        s.handRaised = false;
      }
      room.handQueue = [];
      room.focusMode = false;
      // API 키는 디스크에 저장하지 않음(보안)
      delete room.apiKey;
      into.set(room.code.toUpperCase(), room);
    }
  } catch (e) {
    console.warn("[room-persist] load failed:", e);
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSaveRooms(rooms: Map<string, ClassroomRoom>) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      const payload: PersistShape = {
        savedAt: Date.now(),
        rooms: [...rooms.values()].map((r) => {
          const { apiKey: _omit, ...rest } = r;
          return { ...rest, apiKey: undefined };
        }),
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
    } catch (e) {
      console.warn("[room-persist] save failed:", e);
    }
  }, 400);
}
