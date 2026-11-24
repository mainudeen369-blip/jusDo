"use client";

import { useState } from "react";
import type { StarId } from "@/lib/types";

const EXTS = ["jpg", "jpeg", "png", "webp"] as const;

/**
 * Respectful portrait for alerts.
 * Put fan-art at: public/portraits/vijay.jpg (or .png / .jpeg / .webp)
 * and the same for ajith.*
 */
export function StarPortrait({
  star,
  size = 112,
}: {
  star: StarId;
  size?: number;
}) {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const isVijay = star === "vijay";
  const src = `/portraits/${star}.${EXTS[extIndex]}`;
  const skin = isVijay ? "#e8b989" : "#d9b08c";
  const hair = isVijay ? "#1a1208" : "#2a3038";
  const accent = isVijay ? "#f4c95f" : "#9fb7d4";

  return (
    <div
      className="relative overflow-hidden rounded-full border-2 shadow-lg"
      style={{ width: size, height: size, borderColor: accent }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 z-10 h-full w-full object-cover"
          onError={() => {
            if (extIndex < EXTS.length - 1) setExtIndex((i) => i + 1);
            else setFailed(true);
          }}
        />
      ) : null}
      <svg viewBox="0 0 120 120" width={size} height={size} className="block bg-[#0f1c28]" aria-hidden>
        <defs>
          <radialGradient id={`glow-${star}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0f1c28" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="120" height="120" fill={`url(#glow-${star})`} />
        <ellipse cx="60" cy="118" rx="48" ry="28" fill={isVijay ? "#1a1a1a" : "#243447"} />
        <ellipse cx="60" cy="112" rx="36" ry="18" fill={isVijay ? "#2a2a2a" : "#334155"} />
        <rect x="50" y="78" width="20" height="18" rx="4" fill={skin} />
        <ellipse cx="60" cy="58" rx="28" ry="32" fill={skin} />
        {isVijay ? (
          <path
            d="M32 55 C34 28, 50 18, 60 18 C74 18, 90 28, 88 55 C84 40, 74 34, 60 34 C46 34, 36 40, 32 55 Z"
            fill={hair}
          />
        ) : (
          <path
            d="M34 52 C36 26, 50 16, 60 16 C74 16, 88 26, 86 52 C82 38, 72 32, 60 32 C48 32, 38 38, 34 52 Z"
            fill={hair}
          />
        )}
        <path d="M42 52 q6 -3 12 0" stroke="#2a1f14" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M66 52 q6 -3 12 0" stroke="#2a1f14" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="48" cy="58" r="2.2" fill="#1a1208" />
        <circle cx="72" cy="58" r="2.2" fill="#1a1208" />
        <path d="M52 72 q8 5 16 0" stroke="#8b4518" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
