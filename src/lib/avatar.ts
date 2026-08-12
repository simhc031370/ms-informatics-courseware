import type { AvatarConfig, Gender } from "@/types";

const maleSkins = ["#F5C9A8", "#E0A878", "#C68642", "#8D5524"];
const femaleSkins = ["#F6D0B1", "#E8B892", "#C68642", "#A67B5B"];
const hairs = ["#1C1C1C", "#3B2F2F", "#6B4423", "#C9A227", "#D4573A", "#2E4057"];
const shirtsMale = ["#1B4F72", "#0B6E4F", "#6C3483", "#922B21", "#1F618D"];
const shirtsFemale = ["#C0392B", "#8E44AD", "#16A085", "#D35400", "#2980B9"];
const accessories = ["none", "glasses", "headphones", "cap", "bow"];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return h | 0;
}

export function createRandomAvatar(name: string, gender: Gender): AvatarConfig {
  const seed = `${name}-${gender}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const h = hash(seed);
  return {
    seed,
    gender,
    skin: pick(gender === "남" ? maleSkins : femaleSkins, h),
    hair: pick(hairs, h >> 3),
    shirt: pick(gender === "남" ? shirtsMale : shirtsFemale, h >> 5),
    accessory: pick(accessories, h >> 7),
  };
}

export function avatarSvgDataUrl(avatar: AvatarConfig): string {
  const glasses =
    avatar.accessory === "glasses"
      ? `<g stroke="#222" stroke-width="2" fill="none"><circle cx="38" cy="48" r="7"/><circle cx="62" cy="48" r="7"/><path d="M45 48h10"/></g>`
      : "";
  const headphones =
    avatar.accessory === "headphones"
      ? `<g fill="#333"><rect x="18" y="40" width="8" height="18" rx="3"/><rect x="74" y="40" width="8" height="18" rx="3"/><path d="M26 42c0-16 48-16 48 0" stroke="#333" stroke-width="4" fill="none"/></g>`
      : "";
  const cap =
    avatar.accessory === "cap"
      ? `<path d="M25 34c10-16 40-16 50 0v4H25z" fill="#2C3E50"/><rect x="20" y="36" width="40" height="6" rx="2" fill="#34495E"/>`
      : "";
  const bow =
    avatar.accessory === "bow"
      ? `<g fill="#E91E63"><circle cx="42" cy="22" r="5"/><circle cx="58" cy="22" r="5"/><circle cx="50" cy="22" r="3"/></g>`
      : "";

  const hairPath =
    avatar.gender === "여"
      ? `<path d="M28 40c0-22 44-22 44 0v28c-8 4-14 2-22 2s-14 2-22-2V40z" fill="${avatar.hair}"/>`
      : `<path d="M30 38c2-20 38-20 40 0v8H30z" fill="${avatar.hair}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="100" height="120">
  <ellipse cx="50" cy="112" rx="28" ry="6" fill="#00000022"/>
  <rect x="30" y="72" width="40" height="36" rx="10" fill="${avatar.shirt}"/>
  <circle cx="50" cy="48" r="24" fill="${avatar.skin}"/>
  ${hairPath}
  <circle cx="40" cy="48" r="2.5" fill="#222"/><circle cx="60" cy="48" r="2.5" fill="#222"/>
  <path d="M42 58c4 4 12 4 16 0" stroke="#222" stroke-width="2" fill="none" stroke-linecap="round"/>
  ${glasses}${headphones}${cap}${bow}
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
