export const GUEST_KEY = "jusdo.guest.v1";

export interface GuestSession {
  id: string;
  name: string;
  createdAt: string;
}

const ADJECTIVES = [
  "Swift",
  "Golden",
  "Brave",
  "Calm",
  "Mighty",
  "Lucky",
  "Neon",
  "Royal",
  "Silent",
  "Bright",
  "Cosmic",
  "Thunder",
];

const NOUNS = [
  "Tiger",
  "Lion",
  "Star",
  "Wave",
  "Falcon",
  "Comet",
  "Fan",
  "Ace",
  "Spark",
  "Hero",
  "Legend",
  "Pulse",
];

export function randomGuestName(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `Guest ${a}${n}${num}`;
}

export function createGuestSession(name?: string): GuestSession {
  return {
    id: `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: (name?.trim() || randomGuestName()).slice(0, 32),
    createdAt: new Date().toISOString(),
  };
}

export function loadGuest(): GuestSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestSession;
    if (!parsed?.id || !parsed?.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGuest(guest: GuestSession) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  window.dispatchEvent(new CustomEvent("jusdo:guest-changed", { detail: guest }));
}

export function clearGuest() {
  localStorage.removeItem(GUEST_KEY);
  window.dispatchEvent(new CustomEvent("jusdo:guest-changed", { detail: null }));
}
