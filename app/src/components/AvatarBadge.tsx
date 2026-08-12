"use client";

import { avatarSvgDataUrl } from "@/lib/avatar";
import type { StudentPresence } from "@/types";

export function AvatarBadge({
  student,
  compact = false,
}: {
  student: StudentPresence;
  compact?: boolean;
}) {
  return (
    <div
      className={`glass rounded-2xl ${compact ? "p-3" : "p-4"} flex gap-3 items-center`}
      style={{ minWidth: compact ? 200 : 240 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={avatarSvgDataUrl(student.avatar)}
        alt={student.name}
        width={compact ? 48 : 64}
        height={compact ? 58 : 76}
        className="floaty"
      />
      <div className="min-w-0">
        <div className="font-semibold truncate">{student.name}</div>
        <div className="text-xs opacity-70 truncate">{student.locationLabel}</div>
        <div className="text-sm mt-1">
          형성평가 <span className="font-bold text-[var(--mint)]">{student.score}</span>점
        </div>
        {student.handRaised && (
          <div className="text-xs mt-1 text-[var(--coral)] font-semibold">손들기 중 ✋</div>
        )}
      </div>
    </div>
  );
}
