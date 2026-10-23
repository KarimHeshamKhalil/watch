import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Player } from "@/components/player";
import { getSeason, getTVDetails, type SeasonSummary } from "@/lib/tmdb";

export async function generateMetadata({
  params,
}: PageProps<"/watch/tv/[id]">): Promise<Metadata> {
  const { id } = await params;
  const details = await getTVDetails(+id);
  return { title: `Watch ${details?.title ?? "show"}` };
}

async function WatchSection({
  tvId,
  title,
  poster,
  backdrop,
  seasons,
  sp,
}: {
  tvId: number;
  title: string;
  poster: string | null;
  backdrop: string | null;
  seasons: SeasonSummary[];
  sp: Promise<{ s?: string | string[]; e?: string | string[] }>;
}) {
  const { s: sRaw, e: eRaw } = await sp;
  const sNum = Number(Array.isArray(sRaw) ? sRaw[0] : sRaw);
  const eNum = Number(Array.isArray(eRaw) ? eRaw[0] : eRaw);
  const season =
    seasons.find((x) => x.season_number === sNum)?.season_number ??
    (seasons[0]?.season_number ?? 1);
  const seasonIndex = seasons.findIndex((x) => x.season_number === season);

  const episodes = await getSeason(tvId, season);
  const episode = Math.min(
    Math.max(Number.isFinite(eNum) ? eNum : 1, 1),
    Math.max(episodes.length, 1),
  );
  const epMeta = episodes.find((x) => x.number === episode);

  const nextSeason =
    seasonIndex < seasons.length - 1 ? seasons[seasonIndex + 1] : null;
  const prevHrefUrl =
    episode > 1 ? `/watch/tv/${tvId}?s=${season}&e=${episode - 1}` : null;
  const nextHref =
    episode < episodes.length
      ? `/watch/tv/${tvId}?s=${season}&e=${episode + 1}`
      : nextSeason
        ? `/watch/tv/${tvId}?s=${nextSeason.season_number}&e=1`
        : null;

  return (
    <div>
      <Player
        type="tv"
        tmdbId={tvId}
        title={title}
        poster={poster}
        backdrop={backdrop}
        season={season}
        episode={episode}
      />
      <div className="mt-4 flex items-center gap-3">
        <div className="min-w-0">
          <h1 className="clamp-1 text-lg font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {`S${season} E${episode}`}
            {epMeta?.name ? ` · ${epMeta.name}` : ""}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {prevHrefUrl && (
            <Button variant="outline" size="sm" asChild>
              <Link href={prevHrefUrl}>← Prev</Link>
            </Button>
          )}
          {nextHref && (
            <Button variant="outline" size="sm" asChild>
              <Link href={nextHref}>Next →</Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/tv/${tvId}?s=${season}`}>Episodes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default async function WatchTVPage({
  params,
  searchParams,
}: PageProps<"/watch/tv/[id]">) {
  const { id } = await params;
  const tvId = Number(id);
  if (!Number.isInteger(tvId)) notFound();
  const details = await getTVDetails(tvId);
  if (!details) notFound();
  const seasons = details.seasons ?? [];
  const firstSeason = seasons[0]?.season_number ?? 1;

  return (
    <div className="min-h-svh">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-4 md:px-6">
        <Link
          href={`/tv/${tvId}?s=${firstSeason}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeftIcon className="size-4" />
          {details.title}
        </Link>
        <Link
          href="/"
          className="ml-auto font-semibold text-[15px] tracking-tight text-foreground/70 hover:text-foreground transition-colors"
        >
          watch<span className="text-red-500">.</span>
        </Link>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 pb-10">
        <Suspense
          fallback={
            <div className="aspect-video w-full rounded-xl bg-muted/30 ring-1 ring-inset ring-white/10" />
          }
        >
          <WatchSection
            tvId={tvId}
            title={details.title}
            poster={details.poster}
            backdrop={details.backdrop}
            seasons={seasons}
            sp={searchParams}
          />
        </Suspense>
      </div>
    </div>
  );
}
