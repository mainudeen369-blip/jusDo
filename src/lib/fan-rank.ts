import type { StarId } from "./types";

export interface FanRank {
  title: string;
  tagline: string;
  stars: number; // 1–5 display
  vibe: "legend" | "hot" | "solid" | "rising" | "fresh";
}

/** Catchy Kollywood-style fan rating from score percent. */
export function rateFan(
  score: number,
  total: number,
  club: StarId,
  playerName: string,
): FanRank {
  const pct = total > 0 ? (score / total) * 100 : 0;
  const clubWord = club === "vijay" ? "Thalapathy" : "Thala";

  if (pct >= 100) {
    return {
      title: `${clubWord} Crown Fan`,
      tagline: `Fireworks for you, ${playerName} — full marks, pure mass!`,
      stars: 5,
      vibe: "legend",
    };
  }
  if (pct >= 90) {
    return {
      title: "Blockbuster Blood Fan",
      tagline: `${playerName}, that was first-day-first-show energy. Whistle worthy!`,
      stars: 5,
      vibe: "legend",
    };
  }
  if (pct >= 75) {
    return {
      title: "Whistle Kodukka Fan",
      tagline: `Big applause, ${playerName} — you know your ${clubWord} lore.`,
      stars: 4,
      vibe: "hot",
    };
  }
  if (pct >= 60) {
    return {
      title: "Theatre Front-Row Fan",
      tagline: `Nice one, ${playerName} — solid fan club vibes.`,
      stars: 4,
      vibe: "solid",
    };
  }
  if (pct >= 45) {
    return {
      title: "Rising Fan Club Star",
      tagline: `Good fight, ${playerName} — one more round and you’ll soar.`,
      stars: 3,
      vibe: "rising",
    };
  }
  if (pct >= 25) {
    return {
      title: "Interval Snack Fan",
      tagline: `${playerName}, warming up nicely — keep the fan fire going!`,
      stars: 2,
      vibe: "rising",
    };
  }
  return {
    title: "Ticket Queue Rookie Fan",
    tagline: `Welcome aboard, ${playerName} — every legend fan started somewhere.`,
    stars: 1,
    vibe: "fresh",
  };
}
