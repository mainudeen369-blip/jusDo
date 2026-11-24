"use client";

import type { CompanionMood, StarId } from "@/lib/types";

const MOOD_EYES: Record<CompanionMood, { left: string; right: string }> = {
  happy: { left: "M28 46 q4 5 8 0", right: "M52 46 q4 5 8 0" },
  sleepy: { left: "M28 48 h8", right: "M52 48 h8" },
  hyped: { left: "M30 44 a4 5 0 1 0 0.1 0", right: "M54 44 a4 5 0 1 0 0.1 0" },
  proud: { left: "M28 45 q4 6 8 0", right: "M52 45 q4 6 8 0" },
  nudge: { left: "M30 45 a3.5 4 0 1 0 0.1 0", right: "M54 45 a3.5 4 0 1 0 0.1 0" },
};

export function StarAnimatic({
  star,
  mood,
  speaking,
  offeringWater,
}: {
  star: StarId;
  mood: CompanionMood;
  speaking?: string | null;
  offeringWater?: boolean;
}) {
  const isVijay = star === "vijay";
  const skin = isVijay ? "#e8b989" : "#d9b08c";
  const hair = isVijay ? "#1a1208" : "#2a3038";
  const shirt = isVijay ? "#f4c95f" : "#8fa9c4";
  const shirtDark = isVijay ? "#c9922a" : "#5f7a98";
  const pants = isVijay ? "#1a1a1a" : "#243447";
  const title = isVijay ? "Thalapathy Vijay" : "Thala Ajith";
  const eyes = MOOD_EYES[mood];

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c2233] to-[#081018]">
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_18%_18%,#2dd4bf33,transparent_42%),radial-gradient(circle_at_85%_8%,#f4c95f28,transparent_38%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-10 h-px bg-white/15" />
      <div className="pointer-events-none absolute inset-x-8 bottom-8 h-3 rounded-full bg-black/25 blur-[1px]" />

      <div
        className={`absolute bottom-4 ${offeringWater ? "star-offer" : "star-walk"}`}
        aria-hidden={!speaking}
      >
        <div className="relative">
          {speaking ? (
            <div className="absolute -top-2 left-1/2 z-10 w-52 -translate-x-1/2 -translate-y-full rounded-xl border border-white/15 bg-[#102433]/95 px-3 py-2 text-center text-xs text-teal-50 shadow-lg">
              {speaking}
            </div>
          ) : null}

          <svg
            width="168"
            height="210"
            viewBox="0 0 168 210"
            className="drop-shadow-xl"
            role="img"
            aria-label={`${isVijay ? "Thalapathy" : "Thala"} stylized animatic`}
          >
            {/* shadow */}
            <ellipse cx="84" cy="198" rx="42" ry="7" fill="#000" opacity="0.28" />

            {/* legs */}
            <g className={offeringWater ? undefined : "star-leg"}>
              <rect x="68" y="148" width="14" height="42" rx="5" fill={pants} />
              <rect x="64" y="186" width="22" height="8" rx="3" fill="#0f1720" />
            </g>
            <g className={offeringWater ? undefined : "star-leg star-leg-delay"}>
              <rect x="88" y="148" width="14" height="42" rx="5" fill={pants} />
              <rect x="84" y="186" width="22" height="8" rx="3" fill="#0f1720" />
            </g>

            {/* torso */}
            <path
              d="M58 92 C58 78, 110 78, 110 92 L116 150 C116 158, 52 158, 52 150 Z"
              fill={shirt}
            />
            <path d="M72 92 L84 150 L96 92" fill={shirtDark} opacity="0.35" />

            {/* left arm (back) */}
            <g className={offeringWater ? "star-arm-idle" : "star-arm-swing"}>
              <rect x="42" y="96" width="12" height="40" rx="6" fill={skin} transform="rotate(12 48 96)" />
            </g>

            {/* right arm — holds / offers water */}
            <g className={offeringWater ? "star-arm-offer" : "star-arm-swing-delay"}>
              <rect x="108" y="94" width="12" height="38" rx="6" fill={skin} />
              {/* water bottle */}
              <g transform="translate(112, 124)">
                <rect x="0" y="8" width="18" height="28" rx="4" fill="#5eead4" />
                <rect x="4" y="0" width="10" height="10" rx="2" fill="#99f6e4" />
                <rect x="6" y="12" width="6" height="16" rx="1" fill="#ccfbf1" opacity="0.7" />
                {offeringWater ? (
                  <>
                    <circle className="star-drop" cx="9" cy="42" r="2.5" fill="#67e8f9" />
                    <circle className="star-drop star-drop-delay" cx="14" cy="46" r="2" fill="#67e8f9" />
                  </>
                ) : null}
              </g>
            </g>

            {/* neck */}
            <rect x="76" y="78" width="16" height="16" rx="4" fill={skin} />

            {/* head */}
            <ellipse cx="84" cy="58" rx="30" ry="34" fill={skin} />

            {/* hair — distinct silhouettes, not photo likeness */}
            {isVijay ? (
              <>
                <path
                  d="M54 52 C52 28, 74 18, 84 18 C98 18, 116 28, 114 52 C110 40, 98 34, 84 34 C70 34, 58 40, 54 52 Z"
                  fill={hair}
                />
                <path d="M54 50 C48 58, 50 70, 56 74 L58 58 Z" fill={hair} />
                <path d="M114 50 C120 58, 118 70, 112 74 L110 58 Z" fill={hair} />
              </>
            ) : (
              <>
                <path
                  d="M52 48 C54 24, 72 16, 84 16 C100 16, 118 26, 116 50 C112 36, 100 30, 84 30 C68 30, 56 36, 52 48 Z"
                  fill={hair}
                />
                <path d="M56 44 C50 50, 52 64, 58 70" stroke={hair} strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M112 44 C118 50, 116 64, 110 70" stroke={hair} strokeWidth="8" fill="none" strokeLinecap="round" />
              </>
            )}

            {/* brows + eyes + smile */}
            <path d="M28 40 q6 -4 12 0" transform="translate(28,0)" stroke="#2a1f14" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M52 40 q6 -4 12 0" transform="translate(28,0)" stroke="#2a1f14" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d={eyes.left} stroke="#1a1208" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d={eyes.right} stroke="#1a1208" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path
              d={mood === "sleepy" ? "M74 68 h20" : "M72 66 q12 10 24 0"}
              stroke="#8b4518"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />

            {/* tiny title badge on chest */}
            <circle cx="84" cy="118" r="7" fill={isVijay ? "#1a1a1a" : "#1e293b"} />
            <text
              x="84"
              y="121"
              textAnchor="middle"
              fontSize="8"
              fill={isVijay ? "#f4c95f" : "#cbd5e1"}
              fontFamily="system-ui,sans-serif"
            >
              {isVijay ? "V" : "A"}
            </text>
          </svg>

          {offeringWater ? (
            <div className="pointer-events-none absolute -right-2 top-24 rounded-full border border-teal-300/40 bg-teal-400/15 px-2 py-1 text-[10px] tracking-wide text-teal-100">
              Water, with care
            </div>
          ) : null}
        </div>
      </div>

      {/* your glass — receives water during offer */}
      <div
        className={`absolute bottom-8 right-8 flex flex-col items-center transition ${
          offeringWater ? "opacity-100 scale-100" : "opacity-40 scale-95"
        }`}
      >
        <div className="relative h-16 w-10 overflow-hidden rounded-b-md rounded-t-sm border-2 border-white/30 bg-white/10">
          <div
            className={`absolute inset-x-0 bottom-0 bg-sky-400/70 transition-all duration-700 ${
              offeringWater ? "h-10" : "h-3"
            }`}
          />
        </div>
        <span className="mt-1 text-[10px] text-slate-400">you</span>
      </div>

      <div className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-wider text-slate-200">
        {title}
      </div>
      <div className="absolute left-3 top-3 max-w-[55%] text-[10px] leading-snug text-slate-400">
        Respectful stylized tribute — not an official likeness.
      </div>
    </div>
  );
}
