import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { MediaRow } from "@/components/media-card";
import { ContinueRow } from "@/components/continue-row";
import { Skeleton } from "@/components/ui/skeleton";
import { getMovieList, getTrendingAll, getTVList } from "@/lib/tmdb";

function RowSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <Skeleton className="mb-3 h-4 w-40" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-[256px] w-[171px] shrink-0 rounded-lg"
          />
        ))}
      </div>
    </section>
  );
}

async function HeroSection() {
  const trending = await getTrendingAll("day");
  const item = trending.find((i) => i.backdrop) ?? trending[0];
  if (!item) return null;
  return <Hero item={item} />;
}

async function TrendingRow() {
  const items = await getTrendingAll("day");
  return <MediaRow title="Trending now" items={items} href="/browse/movie" />;
}

async function PopularMoviesRow() {
  const items = await getMovieList("/movie/popular");
  return (
    <MediaRow title="Popular movies" items={items} href="/browse/movie" />
  );
}

async function PopularTVRow() {
  const items = await getTVList("/tv/popular");
  return <MediaRow title="Popular shows" items={items} href="/browse/tv" />;
}

async function NowPlayingRow() {
  const items = await getMovieList("/movie/now_playing");
  return <MediaRow title="In theaters" items={items} />;
}

async function TopRatedMoviesRow() {
  const items = await getMovieList("/movie/top_rated");
  return <MediaRow title="Top rated movies" items={items} />;
}

async function TopRatedTVRow() {
  const items = await getTVList("/tv/top_rated");
  return <MediaRow title="Top rated shows" items={items} />;
}

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <Suspense fallback={<div className="h-[280px] md:h-[360px]" />}>
        <HeroSection />
      </Suspense>
      <ContinueRow />
      <Suspense fallback={<RowSkeleton />}>
        <TrendingRow />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <PopularMoviesRow />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <PopularTVRow />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <NowPlayingRow />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <TopRatedMoviesRow />
      </Suspense>
      <Suspense fallback={<RowSkeleton />}>
        <TopRatedTVRow />
      </Suspense>
    </div>
  );
}
