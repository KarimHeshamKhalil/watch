"use client";

import Link from "next/link";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import { XIcon } from "lucide-react";
import {
  type ProgressItem,
  clearProgress,
  fmtClock,
  getProgressCached,
  invalidateProgressCache,
  removeProgress,
  subscribeProgress,
} from "@/lib/progress";

const EMPTY: ProgressItem[] = [];

function subscribe(cb: () => void) {
  return subscribeProgress(() => {
    invalidateProgressCache();
    cb();
  });
}

function snapshot(): ProgressItem[] {
  return getProgressCached();
}

function serverSnapshot(): ProgressItem[] {
  return EMPTY;
}

function resumeHref(item: ProgressItem) {
  const resume =
    item.position > 30 && item.duration - item.position > 30
      ? `&t=${item.position}`
      : "";
  return item.type === "movie"
    ? `/watch/movie/${item.tmdbId}${resume ? `?t=${item.position}` : ""}`
    : `/watch/tv/${item.tmdbId}?s=${item.season ?? 1}&e=${item.episode ?? 1}${resume}`;
}

export function ContinueRow() {
  const items = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[15px] font-medium tracking-tight text-foreground/90">
          Continue watching
        </h2>
        <button
          onClick={clearProgress}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:-mx-6 md:px-6 pb-1 snap-x snap-mandatory">
        {items.map((item) => {
          const pct = item.duration
            ? Math.min(100, Math.round((item.position / item.duration) * 100))
            : 0;
          return (
            <div
              key={`${item.type}-${item.tmdbId}`}
              className="group relative w-[210px] shrink-0 snap-start"
            >
              <Link
                href={resumeHref(item)}
                className="relative block h-[118px] w-[210px] overflow-hidden rounded-lg bg-muted/40 ring-1 ring-inset ring-white/5 transition-all hover:ring-white/25"
                aria-label={`Continue ${item.title} at ${fmtClock(item.position)}`}
              >
                {item.backdrop ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w780${item.backdrop}`}
                    alt=""
                    fill
                    loading="lazy"
                    className="object-cover transition-opacity group-hover:opacity-90"
                    sizes="210px"
                  />
                ) : item.poster ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w342${item.poster}`}
                    alt=""
                    fill
                    loading="lazy"
                    className="object-cover object-top transition-opacity group-hover:opacity-90"
                    sizes="210px"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="clamp-1 text-xs font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/70">
                    {item.type === "tv"
                      ? `S${item.season ?? 1} · E${item.episode ?? 1} · `
                      : ""}
                    {fmtClock(item.position)} / {fmtClock(item.duration)}
                    {pct > 0 ? ` · ${pct}%` : ""}
                  </p>
                  <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              </Link>
              <button
                onClick={() => removeProgress(item.type, item.tmdbId)}
                className="absolute right-2 top-2 hidden size-6 items-center justify-center rounded-full bg-black/70 text-white/80 hover:text-white group-hover:flex"
                aria-label={`Remove ${item.title} from continue watching`}
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
