import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MediaGrid } from "@/components/media-card";
import { Skeleton } from "@/components/ui/skeleton";
import { type MediaType, getDiscover, getGenreList } from "@/lib/tmdb";

type Props = PageProps<"/browse/[type]">;
type RawParams = { type: string };
type BrowseParams = Promise<RawParams>;
type BrowseSearchParams = Promise<{
  genre?: string | string[];
  page?: string | string[];
}>;

function val(v?: string | string[]): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export const metadata: Metadata = { title: "Browse" };

async function resolveType(params: BrowseParams): Promise<MediaType> {
  const { type } = await params;
  if (type !== "movie" && type !== "tv") {
    notFound();
  }
  return type;
}

async function BrowseHeader({ params }: { params: BrowseParams }) {
  const type = await resolveType(params);
  return (
    <h1 className="text-2xl font-semibold tracking-tight">
      {type === "movie" ? "Movies" : "TV shows"}
    </h1>
  );
}

async function Genres({
  params,
  sp,
}: {
  params: BrowseParams;
  sp: BrowseSearchParams;
}) {
  const [type, { genre }] = await Promise.all([resolveType(params), sp]);
  const active = val(genre);
  const genres = await getGenreList(type);
  const chips: { id: number | null; name: string }[] = [
    { id: null, name: "All" },
    ...genres,
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((g) => {
        const href = g.id
          ? `/browse/${type}?genre=${g.id}`
          : `/browse/${type}`;
        const isActive = g.id === null ? !active : String(g.id) === active;
        return (
          <Link
            key={g.name}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                : "rounded-full border px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            }
          >
            {g.name}
          </Link>
        );
      })}
    </div>
  );
}

async function Items({
  params,
  sp,
}: {
  params: BrowseParams;
  sp: BrowseSearchParams;
}) {
  const [type, { genre, page }] = await Promise.all([
    resolveType(params),
    sp,
  ]);
  const genreNum = Number(val(genre)) || 0;
  const pageNum = Math.max(1, Number(val(page)) || 1);
  const { items, loadedAll } = await getDiscover(type, genreNum, pageNum);
  const filtered = items.filter((i) => i.poster);
  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nothing to show here.</p>
    );
  }
  const base = genreNum ? `/browse/${type}?genre=${genreNum}` : `/browse/${type}`;
  return (
    <>
      <MediaGrid items={filtered} />
      {!loadedAll && (
        <div className="mt-8 flex justify-center gap-3 text-sm">
          {pageNum > 1 && (
            <Link
              href={pageNum > 2 ? `${base}&page=${pageNum - 1}` : base}
              className="rounded-full border px-4 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Previous
            </Link>
          )}
          <Link
            href={`${base}&page=${pageNum + 1}`}
            className="rounded-full border px-4 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            Next →
          </Link>
        </div>
      )}
    </>
  );
}

export default async function BrowsePage({ params, searchParams }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="h-[30px]">
        <Suspense fallback={<div className="h-7 w-40 rounded bg-muted/40" />}>
          <BrowseHeader params={params} />
        </Suspense>
      </div>
      <div className="mt-5 mb-8">
        <Suspense fallback={<div className="h-7 w-72 rounded-full bg-muted/40" />}>
          <Genres params={params} sp={searchParams} />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {Array.from({ length: 21 }).map((_, i) => (
              <Skeleton key={i} className="h-[256px] rounded-lg" />
            ))}
          </div>
        }
      >
        <Items params={params} sp={searchParams} />
      </Suspense>
    </div>
  );
}
