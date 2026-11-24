export type AlertMediaKind = "video" | "image";

export interface AlertMediaItem {
  id: string;
  name: string;
  mime: string;
  kind: AlertMediaKind;
  /** data URL stored in IndexedDB */
  dataUrl: string;
  /** optional tag: which star this clip is for */
  star: "vijay" | "ajith" | "any";
  createdAt: string;
  bytes: number;
}

const DB_NAME = "jusdo-alert-media";
const STORE = "clips";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function mediaKindFromMime(mime: string): AlertMediaKind {
  return mime.startsWith("video/") ? "video" : "image";
}

export async function listAlertMedia(): Promise<AlertMediaItem[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const rows = (req.result as AlertMediaItem[]) || [];
      rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAlertMedia(id: string): Promise<AlertMediaItem | null> {
  if (typeof indexedDB === "undefined") return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as AlertMediaItem) || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAlertMedia(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAlertMediaFromFile(
  file: File,
  star: AlertMediaItem["star"] = "any",
): Promise<AlertMediaItem> {
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (max ${MAX_BYTES / (1024 * 1024)} MB). Compress or trim the clip.`);
  }
  const allowed = /^(video\/(mp4|webm|ogg)|image\/(gif|png|jpeg|jpg|webp))$/i;
  if (!allowed.test(file.type)) {
    throw new Error("Use mp4, webm, gif, png, jpg, or webp.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const item: AlertMediaItem = {
    id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: file.name,
    mime: file.type,
    kind: mediaKindFromMime(file.type),
    dataUrl,
    star,
    createdAt: new Date().toISOString(),
    bytes: file.size,
  };

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return item;
}

export { MAX_BYTES };
