import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailsView } from "@/components/details-view";
import { SimilarRow } from "@/components/similar-row";
import {
  EpisodesSection,
  EpisodesSkeleton,
} from "@/components/episodes";
import { getTVDetails } from "@/lib/tmdb";

export async function generateMetadata({
  params,
}: PageProps<"/tv/[id]">): Promise<Metadata> {
  const { id } = await params;
  const details = await getTVDetails(+id);
  return { title: details?.title ?? "Not found" };
}

export default async function TVPage({
  params,
  searchParams,
}: PageProps<"/tv/[id]">) {
  const { id } = await params;
  const tvId = Number(id);
  if (!Number.isInteger(tvId)) notFound();
  const details = await getTVDetails(tvId);
  if (!details) notFound();

  const seasons = details.seasons ?? [];
  const firstSeason = seasons[0]?.season_number ?? 1;

  return (
    <>
      <DetailsView
        details={details}
        watchHref={`/watch/tv/${tvId}?s=${firstSeason}&e=1`}
      />
      <Suspense fallback={<EpisodesSkeleton />}>
        <EpisodesSection
          tvId={tvId}
          seasons={seasons}
          sParam={(await searchParams).s}
        />
      </Suspense>
      <div className="mt-12" />
      <Suspense fallback={null}>
        <SimilarRow type="tv" id={tvId} />
      </Suspense>
    </>
  );
}
