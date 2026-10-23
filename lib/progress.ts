export type ProgressItem = {
  type: "movie" | "tv";
  tmdbId: number;
  title: string;
  season?: number;
  episode?: number;
  position: number;
  duration: number;
  poster: string | null;
  backdrop: string | null;
  updatedAt: number;
};

const KEY = "watch:progress";
const EVENT = "watch:progress-changed";

const canStore = () =>
  typeof window !== "undefined" && typeof localStorage !== "undefined";

export function getProgress(): ProgressItem[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (i): i is ProgressItem =>
            i &&
            typeof i.tmdbId === "number" &&
            (i.type === "movie" || i.type === "tv") &&
            typeof i.position === "number",
        )
      : [];
  } catch {
    return [];
  }
}

function persist(items: ProgressItem[]) {
  items.sort((a, b) => b.updatedAt - a.updatedAt);
  const limited = items.slice(0, 20);
  localStorage.setItem(KEY, JSON.stringify(limited));
  cached = limited;
  window.dispatchEvent(new Event(EVENT));
}

let cached: ProgressItem[] | null = null;

export function getProgressCached(): ProgressItem[] {
  if (cached === null) cached = getProgress();
  return cached;
}

export function invalidateProgressCache() {
  cached = null;
}

function keyOf(type: string, tmdbId: number) {
  return `${type}:${tmdbId}`;
}

export function saveProgress(item: ProgressItem) {
  if (!canStore()) return;
  const rest = getProgress().filter(
    (i) => keyOf(i.type, i.tmdbId) !== keyOf(item.type, item.tmdbId),
  );
  persist([item, ...rest]);
}

export function removeProgress(type: "movie" | "tv", tmdbId: number) {
  if (!canStore()) return;
  const rest = getProgress().filter(
    (i) => keyOf(i.type, i.tmdbId) !== keyOf(type, tmdbId),
  );
  if (rest.length !== getProgress().length) persist(rest);
}

export function clearProgress() {
  if (!canStore()) return;
  persist([]);
}

export function subscribeProgress(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
