"use client";

import { useEffect, useState } from "react";
import type { QuizQuestion, StarId } from "@/lib/types";

const EMPTY: QuizQuestion = {
  id: "",
  star: "both",
  prompt: "",
  options: [
    { id: "a", text: "" },
    { id: "b", text: "" },
    { id: "c", text: "" },
    { id: "d", text: "" },
  ],
  correctOptionId: "a",
  funFact: "",
};

const SAMPLE_JSON = `[
  {
    "id": "custom-1",
    "star": "vijay",
    "prompt": "Your question here?",
    "options": [
      { "id": "a", "text": "Option A" },
      { "id": "b", "text": "Option B" },
      { "id": "c", "text": "Option C" },
      { "id": "d", "text": "Option D" }
    ],
    "correctOptionId": "a",
    "funFact": "Optional fun fact"
  }
]`;

export function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [form, setForm] = useState<QuizQuestion>(EMPTY);
  const [jsonText, setJsonText] = useState(SAMPLE_JSON);
  const [replaceMode, setReplaceMode] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadQuestions() {
    const res = await fetch("/api/questions");
    const data = await res.json();
    setQuestions(data.questions || []);
  }

  useEffect(() => {
    loadQuestions().catch(() => setError("Could not load questions"));
  }, []);

  function headers() {
    return {
      "Content-Type": "application/json",
      "x-admin-password": password,
    };
  }

  async function unlock() {
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Wrong admin password");
      setAuthed(false);
      return;
    }
    setAuthed(true);
    setStatus("Admin unlocked");
    await loadQuestions();
  }

  async function saveSingle() {
    setError(null);
    setStatus(null);
    const q: QuizQuestion = {
      ...form,
      id: form.id.trim() || `q-${Date.now()}`,
      prompt: form.prompt.trim(),
      options: form.options.map((o) => ({ ...o, text: o.text.trim() })),
    };
    if (!q.prompt || q.options.some((o) => !o.text)) {
      setError("Fill prompt and all options");
      return;
    }
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ question: q }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Save failed");
      return;
    }
    setQuestions(data.questions);
    setForm(EMPTY);
    setStatus("Question saved");
  }

  async function importJson() {
    setError(null);
    setStatus(null);
    let parsed: QuizQuestion[];
    try {
      parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) throw new Error("Root must be an array");
    } catch (e) {
      setError(`JSON parse error: ${(e as Error).message}`);
      return;
    }
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        mode: replaceMode ? "replace" : "json",
        questions: parsed,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Import failed");
      return;
    }
    setQuestions(data.questions);
    setStatus(replaceMode ? "Replaced all questions from JSON" : "Merged JSON questions");
  }

  async function remove(id: string) {
    const res = await fetch(`/api/questions?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Delete failed");
      return;
    }
    setQuestions(data.questions);
    setStatus(`Deleted ${id}`);
  }

  function editExisting(q: QuizQuestion) {
    setForm(JSON.parse(JSON.stringify(q)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Admin</h1>
        <p className="mt-1 text-sm text-slate-300">
          Add quiz questions with a form or paste JSON. Default password:{" "}
          <code className="text-teal-200">jusdo-admin</code> (override with{" "}
          <code className="text-teal-200">ADMIN_PASSWORD</code>).
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-slate-400">Admin password</span>
          <input
            type="password"
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={unlock}
          className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-[#062018]"
        >
          Unlock
        </button>
        {authed ? <span className="text-sm text-teal-300">Unlocked</span> : null}
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {status ? <p className="text-sm text-teal-200">{status}</p> : null}

      <section className={`space-y-3 ${authed ? "" : "pointer-events-none opacity-40"}`}>
        <h2 className="text-lg text-white">Add / edit question</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="text-slate-400">ID</span>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
              value={form.id}
              placeholder="auto if empty"
              onChange={(e) => setForm({ ...form, id: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="text-slate-400">Star scope</span>
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
              value={form.star}
              onChange={(e) => setForm({ ...form, star: e.target.value as StarId | "both" })}
            >
              <option value="vijay">Vijay</option>
              <option value="ajith">Ajith</option>
              <option value="both">Both / rivalry</option>
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-slate-400">Prompt</span>
          <textarea
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            rows={2}
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {form.options.map((opt, i) => (
            <label key={opt.id} className="text-sm">
              <span className="text-slate-400">Option {opt.id}</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                value={opt.text}
                onChange={(e) => {
                  const options = [...form.options];
                  options[i] = { ...opt, text: e.target.value };
                  setForm({ ...form, options });
                }}
              />
            </label>
          ))}
        </div>
        <label className="block text-sm">
          <span className="text-slate-400">Correct option id</span>
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            value={form.correctOptionId}
            onChange={(e) => setForm({ ...form, correctOptionId: e.target.value })}
          >
            {form.options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-slate-400">Fun fact (optional)</span>
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            value={form.funFact || ""}
            onChange={(e) => setForm({ ...form, funFact: e.target.value })}
          />
        </label>
        <button
          type="button"
          onClick={saveSingle}
          className="rounded-lg bg-[#f4c95f] px-4 py-2 text-sm font-semibold text-[#1a1408]"
        >
          Save question
        </button>
      </section>

      <section className={`space-y-3 ${authed ? "" : "pointer-events-none opacity-40"}`}>
        <h2 className="text-lg text-white">JSON import</h2>
        <p className="text-xs text-slate-400">
          Paste an array of questions. Merge keeps existing IDs updated; Replace wipes the bank first.
        </p>
        <textarea
          className="min-h-48 w-full rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-slate-100"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={replaceMode}
            onChange={(e) => setReplaceMode(e.target.checked)}
          />
          Replace all questions (dangerous)
        </label>
        <button
          type="button"
          onClick={importJson}
          className="rounded-lg border border-teal-300/40 bg-teal-400/10 px-4 py-2 text-sm text-teal-100"
        >
          Import JSON
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg text-white">Question bank ({questions.length})</h2>
        <ul className="space-y-2">
          {questions.map((q) => (
            <li
              key={q.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div>
                <p className="text-sm text-white">{q.prompt}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {q.id} · {q.star} · answer {q.correctOptionId}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!authed}
                  onClick={() => editExisting(q)}
                  className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={!authed}
                  onClick={() => remove(q.id)}
                  className="rounded-md border border-rose-400/30 px-2 py-1 text-xs text-rose-200 disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
