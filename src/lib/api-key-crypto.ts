/**
 * 교사 API 키 이중 암호화 (브라우저 Web Crypto)
 * 1차: PBKDF2(세션 비밀) → AES-GCM
 * 2차: PBKDF2(수업 비밀번호) → AES-GCM
 * 평문은 메모리에만 보관하고, 페이지 종료 시 폐기합니다.
 */

function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(b64: string): Uint8Array {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 120000,
      hash: "SHA-256",
    },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function aesEncrypt(plain: string, secret: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(secret, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plain)
  );
  return `${toB64(salt.buffer)}.${toB64(iv.buffer)}.${toB64(cipher)}`;
}

async function aesDecrypt(payload: string, secret: string): Promise<string> {
  const [saltB64, ivB64, dataB64] = payload.split(".");
  if (!saltB64 || !ivB64 || !dataB64) throw new Error("암호문 형식이 올바르지 않습니다.");
  const salt = fromB64(saltB64);
  const iv = fromB64(ivB64);
  const data = fromB64(dataB64);
  const key = await deriveKey(secret, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(plain);
}

export type DoubleEncryptedPayload = {
  v: 1;
  layer1: string;
  layer2: string;
  /** 복호화에 필요한 세션 비밀 — 메모리/세션에만 존재, 저장소 장기 보관 금지 */
  sessionSecret: string;
};

export async function doubleEncryptApiKey(
  apiKey: string,
  roomPassword: string
): Promise<DoubleEncryptedPayload> {
  const sessionSecret = toB64(crypto.getRandomValues(new Uint8Array(32)).buffer);
  const layer1 = await aesEncrypt(apiKey, sessionSecret);
  const layer2 = await aesEncrypt(layer1, `room:${roomPassword}`);
  return { v: 1, layer1: "", layer2, sessionSecret };
}

export async function doubleDecryptApiKey(
  payload: Pick<DoubleEncryptedPayload, "layer2" | "sessionSecret">,
  roomPassword: string
): Promise<string> {
  const layer1 = await aesDecrypt(payload.layer2, `room:${roomPassword}`);
  return aesDecrypt(layer1, payload.sessionSecret);
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 3)}••••${key.slice(-4)}`;
}
