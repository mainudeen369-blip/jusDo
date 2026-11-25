"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Spark = {
  id: number;
  left: string;
  delay: string;
  duration: string;
  color: string;
  size: string;
  x: string;
  y: string;
};

const COLORS = ["#f4c95f", "#2dd4bf", "#fb7185", "#a78bfa", "#38bdf8", "#f97316", "#fde68a"];

/** Cracker / fireworks burst overlay for quiz finish. */
export function CrackerBurst({ active, durationMs = 4500 }: { active: boolean; durationMs?: number }) {
  const [show, setShow] = useState(false);

  const sparks = useMemo(() => {
    const list: Spark[] = [];
    for (let i = 0; i < 48; i++) {
      const angle = (Math.PI * 2 * i) / 48 + (Math.random() - 0.5) * 0.4;
      const dist = 80 + Math.random() * 160;
      list.push({
        id: i,
        left: `${8 + Math.random() * 84}%`,
        delay: `${Math.random() * 0.55}s`,
        duration: `${1.4 + Math.random() * 1.2}s`,
        color: COLORS[i % COLORS.length],
        size: `${4 + Math.random() * 6}px`,
        x: `${Math.cos(angle) * dist}px`,
        y: `${Math.sin(angle) * dist - 40}px`,
      });
    }
    // Extra ground crackers
    for (let i = 0; i < 18; i++) {
      list.push({
        id: 100 + i,
        left: `${5 + Math.random() * 90}%`,
        delay: `${0.2 + Math.random() * 0.9}s`,
        duration: `${0.9 + Math.random() * 0.8}s`,
        color: COLORS[(i + 2) % COLORS.length],
        size: `${6 + Math.random() * 8}px`,
        x: `${(Math.random() - 0.5) * 60}px`,
        y: `${-120 - Math.random() * 180}px`,
      });
    }
    return list;
  }, [active]);

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => setShow(false), durationMs);
    return () => window.clearTimeout(t);
  }, [active, durationMs]);

  if (!show) return null;

  return (
    <div className="cracker-burst pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden>
      <div className="cracker-flash" />
      {sparks.map((s) => (
        <span
          key={s.id}
          className="cracker-spark"
          style={
            {
              left: s.left,
              bottom: "18%",
              width: s.size,
              height: s.size,
              background: s.color,
              boxShadow: `0 0 10px ${s.color}`,
              animationDelay: s.delay,
              animationDuration: s.duration,
              ["--dx" as string]: s.x,
              ["--dy" as string]: s.y,
            } as CSSProperties
          }
        />
      ))}
      <div className="cracker-boom cracker-boom-a" />
      <div className="cracker-boom cracker-boom-b" />
      <div className="cracker-boom cracker-boom-c" />
    </div>
  );
}
