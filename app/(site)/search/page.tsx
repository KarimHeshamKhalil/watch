import type { Metadata } from "next";
import { Suspense } from "react";
import { MediaGrid } from "@/components/media-card";
import { Skeleton } from "@/components/ui/skeleton";
import { searchMulti } from "@/lib/tmdb";

export const metadata: Metadata = { title: "Search" };

type SearchParams = Promise<{ q?: string | string[] }>;

async function Results({ sp }: { sp: SearchParams }) {
  const { q } = await sp;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  if (!query) {
    return (
      <p className="text-sm text-muted-foreground">
        Start typing in the search bar find movies and shows.
      </p>
    );
  }
  const items = await searchMulti(query);
  const filtered = items.filter((i) => i.poster);
  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No results for “{query}”.</p>
    );
  }
  return <MediaGrid items={filtered} />;
}

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Search</h1>
      <Suspense
        fallback={
          <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
            {Array.from({ length: 14 }).map((_, i) => (
              <Skeleton key={i} className="h-[256px] rounded-lg" />
            ))}
          </div>
        }
      >
        <Results sp={searchParams} />
      </Suspense>
    </div>
  );
}
