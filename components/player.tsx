"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  getProgress,
  type ProgressItem,
  removeProgress,
  saveProgress,
} from "@/lib/progress";

export type PlayerProps = {
  type: "movie" | "tv";
  tmdbId: number;
  title: string;
  poster: string | null;
  backdrop: string | null;
  season?: number;
  episode?: number;
};

export function Player(props: PlayerProps) {
  const { type, tmdbId, title, poster, backdrop, season, episode } = props;
  const searchParams = useSearchParams();
  const resume = Number(searchParams.get("t")) || 0;
  const lastSaved = useRef(0);

  const src = useMemo(() => {
    const base = `https://cinesrc.st/embed/${type}/${tmdbId}`;
    const params = new URLSearchParams({ color: "#ffffff", autonext: "false" });
    if (type === "tv") {
      params.set("s", String(season ?? 1));
      params.set("e", String(episode ?? 1));
    }
    if (resume > 5) params.set("t", String(Math.floor(resume)));
    return `${base}?${params.toString()}`;
  }, [type, tmdbId, season, episode, resume]);

  useEffect(() => {
    function record(currentTime: number, duration: number) {
      if (!duration || duration <= 0 || currentTime < 5) return;
      const item: ProgressItem = {
        type,
        tmdbId,
        title,
        season,
        episode,
        position: Math.floor(currentTime),
        duration: Math.floor(duration),
        poster,
        backdrop,
        updatedAt: Date.now(),
      };
      saveProgress(item);
    }

    function onMessage(e: MessageEvent) {
      if (e.origin !== "https://cinesrc.st") return;
      const data = e.data;
      if (!data || typeof data !== "object" || typeof data.type !== "string")
        return;
      switch (data.type) {
        case "cinesrc:timeupdate": {
          const { currentTime, duration } = data;
          if (typeof currentTime === "number" && typeof duration === "number") {
            if (
              Math.abs(currentTime - lastSaved.current) >= 10 ||
              currentTime < lastSaved.current
            ) {
              lastSaved.current = currentTime;
              record(currentTime, duration);
            }
          }
          break;
        }
        case "cinesrc:pause": {
          if (typeof data.currentTime === "number") {
            lastSaved.current = data.currentTime;
            record(data.currentTime, data.duration);
          }
          break;
        }
        case "cinesrc:ended": {
          lastSaved.current = 0;
          removeProgress(type, tmdbId);
          break;
        }
        case "cinesrc:nextepisode": {
          if (
            type === "tv" &&
            typeof data.season === "number" &&
            typeof data.episode === "number"
          ) {
            lastSaved.current = 0;
            const current = getProgress().find(
              (p) => p.type === type && p.tmdbId === tmdbId,
            );
            if (current) {
              saveProgress({
                ...current,
                season: data.season,
                episode: data.episode,
              });
            }
          }
          break;
        }
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [type, tmdbId, title, season, episode, poster, backdrop]);

  return (
    <div className="overflow-hidden rounded-xl bg-black ring-1 ring-inset ring-white/10">
      <iframe
        src={src}
        title={`${title}${type === "tv" ? ` S${season} E${episode}` : ""}`}
        className="aspect-video w-full"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-orientation-lock"
        referrerPolicy="origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
