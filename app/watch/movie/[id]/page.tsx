import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeftIcon } from "lucide-react";
import { Player } from "@/components/player";
import { SimilarRow } from "@/components/similar-row";
import { getMovieDetails } from "@/lib/tmdb";

export async function generateMetadata({
  params,
}: PageProps<"/watch/movie/[id]">): Promise<Metadata> {
  const { id } = await params;
  const details = await getMovieDetails(+id);
  return { title: `Watch ${details?.title ?? "movie"}` };
}

export default async function WatchMoviePage({
  params,
}: PageProps<"/watch/movie/[id]">) {
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isInteger(movieId)) notFound();
  const details = await getMovieDetails(movieId);
  if (!details) notFound();

  return (
    <div className="min-h-svh">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-4 md:px-6">
        <Link
          href={`/movie/${movieId}`}
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
      <div className="flex flex-col gap-6 pb-10">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
          <Suspense
            fallback={
              <div className="aspect-video w-full rounded-xl bg-muted/30 ring-1 ring-inset ring-white/10" />
            }
          >
            <Player
              type="movie"
              tmdbId={movieId}
              title={details.title}
              poster={details.poster}
              backdrop={details.backdrop}
            />
          </Suspense>
          <div className="mt-4">
            <h1 className="text-lg font-semibold tracking-tight">
              {details.title}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {[
                details.date?.slice(0, 4),
                details.runtime
                  ? `${Math.floor(details.runtime / 60)}h ${details.runtime % 60}m`
                  : null,
                details.rating > 0 ? `★ ${details.rating.toFixed(1)}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
        <SimilarRow type="movie" id={movieId} />
      </div>
    </div>
  );
}
