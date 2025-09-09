import { db } from "../lib/firebase";
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER as string | undefined;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;

const STORAGE_KEY = "adminToken";
const COLLECTION = "adminSessions"; // custom auth collection
const DEFAULT_TTL_MIN = 720; // 12 hours
const TTL_MIN = Number(import.meta.env.VITE_ADMIN_SESSION_TTL_MINUTES ?? DEFAULT_TTL_MIN);

function nowMs() {
  return Date.now();
}

function generateToken(username: string) {
  const rnd = Math.random().toString(36).slice(2);
  const raw = `${username}:${nowMs()}:${rnd}`;
  if (typeof btoa === "function") return `adm-${btoa(raw)}`;
  return `adm-${raw}`;
}

function setLocalToken(token: string) {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {}
}

function getLocalToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function clearLocalToken() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function isAdminConfigured() {
  return Boolean(ADMIN_USER && ADMIN_PASSWORD);
}

export async function loginWithPassword(username: string, password: string): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) return false;

  const token = generateToken(username);
  const expiresAt = nowMs() + TTL_MIN * 60_000;

  // persist locally
  setLocalToken(token);

  // persist in Firestore (serverTimestamp for createdAt/lastSeenAt)
  const ref = doc(db, COLLECTION, token);
  await setDoc(ref, {
    token,
    username,
    createdAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
    expiresAt, // epoch ms; client compares for expiry
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  });

  return true;
}

export async function requireAdminAuth(): Promise<boolean> {
  const token = getLocalToken();
  if (!token) return false;
  const ref = doc(db, COLLECTION, token);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  const data = snap.data() as any;
  const exp = Number(data?.expiresAt ?? 0);
  const valid = exp > nowMs();
  return Boolean(valid);
}

export async function logoutAdmin(): Promise<void> {
  const token = getLocalToken();
  if (token) {
    try {
      await deleteDoc(doc(db, COLLECTION, token));
    } catch {}
  }
  clearLocalToken();
}

export function isAdminAuthenticated(): boolean {
  // best-effort sync check from local only; route loader should call requireAdminAuth()
  return Boolean(getLocalToken());
}

