"use client";

import { useEffect, useState } from "react";
import {
  deleteAlertMedia,
  listAlertMedia,
  MAX_BYTES,
  saveAlertMediaFromFile,
  type AlertMediaItem,
} from "@/lib/alert-media";
import type { AlertAnimaticMode, JusDoSettings, StarId } from "@/lib/types";

export function AlertMediaSettings({
  settings,
  onChange,
}: {
  settings: JusDoSettings;
  onChange: (partial: Partial<JusDoSettings>) => void;
}) {
  const [clips, setClips] = useState<AlertMediaItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploadStar, setUploadStar] = useState<AlertMediaItem["star"]>("any");

  async function refresh() {
    setClips(await listAlertMedia());
  }

  useEffect(() => {
    refresh().catch(() => setErr("Could not read saved clips on this device."));
  }, []);

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const item = await saveAlertMediaFromFile(file, uploadStar);
      await refresh();
      onChange({
        alertAnimaticMode: "upload",
        alertMediaId: item.id,
        ...(uploadStar === "vijay" ? { alertMediaIdVijay: item.id } : {}),
        ...(uploadStar === "ajith" ? { alertMediaIdAjith: item.id } : {}),
      });
      setMsg(`Uploaded “${item.name}” and set as active alert animatic.`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await deleteAlertMedia(id);
    await refresh();
    const patch: Partial<JusDoSettings> = {};
    if (settings.alertMediaId === id) patch.alertMediaId = undefined;
    if (settings.alertMediaIdVijay === id) patch.alertMediaIdVijay = undefined;
    if (settings.alertMediaIdAjith === id) patch.alertMediaIdAjith = undefined;
    if (
      !patch.alertMediaId &&
      !settings.alertMediaIdVijay &&
      !settings.alertMediaIdAjith &&
      Object.keys(patch).length
    ) {
      // keep mode; user can re-select
    }
    onChange(patch);
    setMsg("Clip removed.");
  }

  function selectClip(id: string, scope: "any" | StarId) {
    if (scope === "any") onChange({ alertAnimaticMode: "upload", alertMediaId: id });
    if (scope === "vijay") onChange({ alertAnimaticMode: "upload", alertMediaIdVijay: id });
    if (scope === "ajith") onChange({ alertAnimaticMode: "upload", alertMediaIdAjith: id });
    setMsg("Selected clip for alerts.");
  }

  return (
    <section className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div>
        <h2 className="text-lg text-teal-100">Alert animatic / dance clip</h2>
        <p className="mt-1 text-xs text-slate-400">
          Upload your own dance / water-alert video (mp4, webm) or gif/image. Stored on this device
          only (max {MAX_BYTES / (1024 * 1024)} MB). Choose built-in doodle or your upload for
          corner alerts.
        </p>
      </div>

      <fieldset className="flex flex-wrap gap-2">
        {(
          [
            ["builtin", "Built-in doodle"],
            ["upload", "My uploaded clip"],
          ] as [AlertAnimaticMode, string][]
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => onChange({ alertAnimaticMode: mode })}
            className={`rounded-lg px-3 py-2 text-sm ${
              settings.alertAnimaticMode === mode
                ? "bg-teal-400 text-[#062018]"
                : "border border-white/10 bg-black/20 text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-slate-400">Upload for</span>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            value={uploadStar}
            onChange={(e) => setUploadStar(e.target.value as AlertMediaItem["star"])}
          >
            <option value="any">Any / default</option>
            <option value="vijay">Thalapathy Vijay alerts</option>
            <option value="ajith">Thala Ajith alerts</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="text-slate-400">Choose file</span>
          <input
            type="file"
            accept="video/mp4,video/webm,image/gif,image/png,image/jpeg,image/webp"
            disabled={busy}
            className="mt-1 block w-full text-xs text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-teal-400 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#062018]"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      {err ? <p className="text-sm text-rose-300">{err}</p> : null}
      {msg ? <p className="text-sm text-teal-200">{msg}</p> : null}
      {busy ? <p className="text-xs text-slate-400">Uploading…</p> : null}

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-slate-500">Saved clips ({clips.length})</p>
        {clips.length === 0 ? (
          <p className="text-sm text-slate-400">No uploads yet — add a dance clip to use in alerts.</p>
        ) : (
          <ul className="space-y-2">
            {clips.map((c) => {
              const active =
                settings.alertMediaId === c.id ||
                settings.alertMediaIdVijay === c.id ||
                settings.alertMediaIdAjith === c.id;
              return (
                <li
                  key={c.id}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${
                    active ? "border-teal-400/40 bg-teal-400/10" : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="h-16 w-16 overflow-hidden rounded-lg bg-black/40">
                    {c.kind === "video" ? (
                      <video src={c.dataUrl} muted playsInline className="h-full w-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.dataUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{c.name}</p>
                    <p className="text-xs text-slate-400">
                      {c.kind} · {c.star} · {(c.bytes / 1024).toFixed(0)} KB
                      {active ? " · active" : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <button
                        type="button"
                        className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-slate-200"
                        onClick={() => selectClip(c.id, "any")}
                      >
                        Use default
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-[#f4c95f]"
                        onClick={() => selectClip(c.id, "vijay")}
                      >
                        Use for Vijay
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-white/15 px-2 py-1 text-[11px] text-[#9fb7d4]"
                        onClick={() => selectClip(c.id, "ajith")}
                      >
                        Use for Ajith
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-rose-400/30 px-2 py-1 text-[11px] text-rose-200"
                        onClick={() => remove(c.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
