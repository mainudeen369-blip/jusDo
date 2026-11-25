import { promises as fs } from "fs";
import {
  githubStoreConfigured,
  readGithubJsonFile,
  writeGithubJsonFile,
} from "./github-data";
import { getScenes, pickRound } from "./scenes-store";
import { writableDataPath } from "./runtime-fs";

export type RoomStatus = "lobby" | "playing" | "question_result" | "finished";

export interface RoomPlayer {
  id: string;
  name: string;
}

export interface RoomPublicQuestion {
  id: string;
  prompt: string;
  promptTa?: string;
  options: { id: string; text: string; textTa?: string }[];
}

export interface SceneRoom {
  code: string;
  hostId: string;
  players: RoomPlayer[];
  status: RoomStatus;
  questionIds: string[];
  questionIndex: number;
  /** current answers: playerId -> optionId */
  answers: Record<string, string>;
  /** last result: playerId -> correct|wrong (no answer key exposed) */
  lastResults: Record<string, "correct" | "wrong">;
  resultAt?: string;
  scores: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

type RoomMap = Record<string, SceneRoom>;

const GITHUB_PATH = "data/scene-rooms.json";
const LOCAL_PATH = () => writableDataPath("scene-rooms.json");
const TEAM_SIZE = 3;
const ROUND_SIZE = 15;
const RESULT_HOLD_MS = 4000;

function pathDirname(filePath: string) {
  const i = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
  return i >= 0 ? filePath.slice(0, i) : ".";
}

function codeGen() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function loadMap(): Promise<RoomMap> {
  if (githubStoreConfigured()) {
    try {
      const remote = await readGithubJsonFile<RoomMap>(GITHUB_PATH);
      if (remote && typeof remote === "object") return remote;
    } catch {
      // fall through
    }
  }
  try {
    const raw = await fs.readFile(LOCAL_PATH(), "utf8");
    return JSON.parse(raw) as RoomMap;
  } catch {
    return {};
  }
}

async function saveMap(map: RoomMap): Promise<void> {
  // prune old rooms (>6h)
  const now = Date.now();
  for (const [k, r] of Object.entries(map)) {
    if (now - Date.parse(r.updatedAt || r.createdAt) > 6 * 3600_000) delete map[k];
  }
  const target = LOCAL_PATH();
  try {
    await fs.mkdir(pathDirname(target), { recursive: true });
    await fs.writeFile(target, JSON.stringify(map), "utf8");
  } catch {
    // ignore
  }
  if (githubStoreConfigured()) {
    try {
      await writeGithubJsonFile(GITHUB_PATH, map, "jusDo: sync scene rooms");
    } catch {
      // room sync best-effort
    }
  }
}

function publicQuestion(
  room: SceneRoom,
  byId: Map<string, { prompt: string; promptTa?: string; options: RoomPublicQuestion["options"]; correctOptionId: string }>,
): RoomPublicQuestion | null {
  const qid = room.questionIds[room.questionIndex];
  const q = byId.get(qid);
  if (!q) return null;
  return {
    id: qid,
    prompt: q.prompt,
    promptTa: q.promptTa,
    options: q.options,
  };
}

export function sanitizeRoom(room: SceneRoom, question: RoomPublicQuestion | null) {
  return {
    code: room.code,
    hostId: room.hostId,
    players: room.players,
    status: room.status,
    questionIndex: room.questionIndex,
    totalQuestions: room.questionIds.length,
    answersCount: Object.keys(room.answers).length,
    answeredBy: Object.keys(room.answers),
    lastResults: room.status === "question_result" || room.status === "finished" ? room.lastResults : {},
    resultAt: room.resultAt,
    scores: room.scores,
    question,
    teamFull: room.players.length >= TEAM_SIZE,
    canStart: room.players.length >= TEAM_SIZE && room.status === "lobby",
  };
}

async function questionIndex() {
  const scenes = await getScenes();
  const byId = new Map(scenes.map((s) => [s.id, s]));
  return { scenes, byId };
}

function maybeAdvance(room: SceneRoom, byId: Map<string, { correctOptionId: string }>): boolean {
  if (room.status !== "question_result" || !room.resultAt) return false;
  if (Date.now() - Date.parse(room.resultAt) < RESULT_HOLD_MS) return false;
  if (room.questionIndex + 1 >= room.questionIds.length) {
    room.status = "finished";
    room.answers = {};
    return true;
  }
  room.questionIndex += 1;
  room.answers = {};
  room.lastResults = {};
  room.resultAt = undefined;
  room.status = "playing";
  return true;
}

function settleQuestion(room: SceneRoom, byId: Map<string, { correctOptionId: string }>) {
  const qid = room.questionIds[room.questionIndex];
  const q = byId.get(qid);
  if (!q) return;
  const results: Record<string, "correct" | "wrong"> = {};
  for (const p of room.players) {
    const ans = room.answers[p.id];
    const ok = Boolean(ans && ans === q.correctOptionId);
    results[p.id] = ok ? "correct" : "wrong";
    if (ok) room.scores[p.id] = (room.scores[p.id] || 0) + 1;
  }
  room.lastResults = results;
  room.resultAt = new Date().toISOString();
  room.status = "question_result";
}

export async function createRoom(playerId: string, playerName: string) {
  const map = await loadMap();
  let code = codeGen();
  while (map[code]) code = codeGen();
  const room: SceneRoom = {
    code,
    hostId: playerId,
    players: [{ id: playerId, name: playerName.slice(0, 24) }],
    status: "lobby",
    questionIds: [],
    questionIndex: 0,
    answers: {},
    lastResults: {},
    scores: { [playerId]: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  map[code] = room;
  await saveMap(map);
  return room;
}

export async function joinRoom(code: string, playerId: string, playerName: string) {
  const map = await loadMap();
  const room = map[code.toUpperCase()];
  if (!room) throw Object.assign(new Error("Room not found"), { status: 404 });
  if (room.status !== "lobby") throw Object.assign(new Error("Game already started"), { status: 400 });
  const existing = room.players.find((p) => p.id === playerId);
  if (existing) {
    existing.name = playerName.slice(0, 24);
  } else {
    if (room.players.length >= TEAM_SIZE) {
      throw Object.assign(new Error("Room is full (3 players)"), { status: 400 });
    }
    room.players.push({ id: playerId, name: playerName.slice(0, 24) });
    room.scores[playerId] = 0;
  }
  room.updatedAt = new Date().toISOString();
  map[room.code] = room;
  await saveMap(map);
  return room;
}

export async function startRoom(code: string, playerId: string) {
  const map = await loadMap();
  const room = map[code.toUpperCase()];
  if (!room) throw Object.assign(new Error("Room not found"), { status: 404 });
  if (room.hostId !== playerId) throw Object.assign(new Error("Only host can start"), { status: 403 });
  if (room.players.length < TEAM_SIZE) {
    throw Object.assign(new Error("Need 3 players"), { status: 400 });
  }
  const { scenes } = await questionIndex();
  const round = pickRound(scenes, ROUND_SIZE);
  room.questionIds = round.map((q) => q.id);
  room.questionIndex = 0;
  room.answers = {};
  room.lastResults = {};
  room.scores = Object.fromEntries(room.players.map((p) => [p.id, 0]));
  room.status = "playing";
  room.updatedAt = new Date().toISOString();
  map[room.code] = room;
  await saveMap(map);
  return room;
}

export async function submitAnswer(code: string, playerId: string, optionId: string) {
  const map = await loadMap();
  const room = map[code.toUpperCase()];
  if (!room) throw Object.assign(new Error("Room not found"), { status: 404 });
  if (room.status !== "playing") throw Object.assign(new Error("Not accepting answers now"), { status: 400 });
  if (!room.players.some((p) => p.id === playerId)) {
    throw Object.assign(new Error("Not in room"), { status: 403 });
  }
  if (room.answers[playerId]) return room; // already answered
  room.answers[playerId] = optionId;
  room.updatedAt = new Date().toISOString();

  const { byId } = await questionIndex();
  if (Object.keys(room.answers).length >= room.players.length) {
    settleQuestion(room, byId);
  }
  map[room.code] = room;
  await saveMap(map);
  return room;
}

export async function getRoomView(code: string) {
  const map = await loadMap();
  const room = map[code.toUpperCase()];
  if (!room) throw Object.assign(new Error("Room not found"), { status: 404 });

  const { byId } = await questionIndex();
  if (maybeAdvance(room, byId)) {
    room.updatedAt = new Date().toISOString();
    map[room.code] = room;
    await saveMap(map);
  }

  const q = room.status === "lobby" || room.status === "finished"
    ? null
    : publicQuestion(room, byId);
  return sanitizeRoom(room, q);
}
