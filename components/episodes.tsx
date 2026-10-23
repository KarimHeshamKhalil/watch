import Link from "next/link";
import Image from "next/image";
import type { ReactElement } from "react";
import { getSeason, type Episode, type SeasonSummary } from "@/lib/tmdb";

function watchHref(tvId: number, s: number, e: number) {
  return `/watch/tv/${tvId}?s=${s}&e=${e}`;
}

function fmtRuntime(min: number | null) {
  if (!min) return null;
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function EpisodesSkeleton() {
  return (
    <div className="mt-12">
      <div className="flex gap-2 pb-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-20 rounded-full bg-muted/40" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-[92px] w-[164px] shrink-0 rounded-lg bg-muted/40" />
            <div className="flex flex-col gap-2 py-1.5">
              <div className="h-3.5 w-32 rounded bg-muted/40" />
              <div className="h-2.5 w-20 rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function EpisodesSection({
  tvId,
  seasons,
  sParam,
}: {
  tvId: number;
  seasons: SeasonSummary[];
  sParam?: string | string[] | undefined;
}) {
  const sVal = Array.isArray(sParam) ? sParam[0] : sParam;
  const parsed = parseInt(sVal ?? "", 10);
  const valid = seasons.find((s) => s.season_number === parsed);
  const season = valid ? valid.season_number : (seasons[0]?.season_number ?? 1);

  if (seasons.length === 0) {
    return (
      <p className="mx-auto max-w-7xl px-4 md:px-6 text-sm text-muted-foreground">
        No episodes available yet.
      </p>
    );
  }

  return (
    <SeasonPicker tvId={tvId} tvSeasons={seasons} season={season}>
      <EpisodeGrid
        tvId={tvId}
        season={season}
        seasonName={
          seasons.find((s) => s.season_number === season)?.name ??
          `Season ${season}`
        }
      />
    </SeasonPicker>
  );
}

function SeasonPicker({
  tvSeasons,
  season,
  tvId,
  children,
}: {
  tvSeasons: SeasonSummary[];
  season: number;
  tvId: number;
  children: ReactElement;
}) {
  return (
    <>
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 md:px-6 max-w-7xl mx-auto">
        {tvSeasons.map((s) => (
          <Link
            key={s.id}
            href={`/tv/${tvId}?s=${s.season_number}`}
            aria-current={s.season_number === season ? "page" : undefined}
            className={
              s.season_number === season
                ? "shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                : "shrink-0 rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {s.name}
          </Link>
        ))}
      </div>
      {children}
    </>
  );
}

async function EpisodeGrid({
  tvId,
  season,
  seasonName,
}: {
  tvId: number;
  season: number;
  seasonName: string;
}) {
  const episodes = await getSeason(tvId, season);
  const rows: Episode[] = episodes.filter((e) => e.name || e.overview);
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <h2 className="mb-4 mt-12 text-[15px] font-medium tracking-tight text-foreground/90">
        {seasonName}
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((ep) => (
          <Link
            key={ep.id}
            href={watchHref(tvId, season, ep.number)}
            className="group flex gap-3 rounded-lg p-1 -m-1 hover:bg-accent/40 transition-colors"
          >
            <div className="relative h-[92px] w-[164px] shrink-0 overflow-hidden rounded-md bg-muted/40">
              {ep.still ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w300${ep.still}`}
                  alt=""
                  fill
                  loading="lazy"
                  className="object-cover"
                  sizes="164px"
                />
              ) : null}
              <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[10px] text-white">
                {ep.number}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="clamp-1 text-sm font-medium text-foreground/90 group-hover:text-foreground">
                {ep.number}. {ep.name}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {[
                  ep.date,
                  fmtRuntime(ep.runtime),
                  ep.rating > 0 ? `★ ${ep.rating.toFixed(1)}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {ep.overview && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground clamp-3">
                  {ep.overview}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
