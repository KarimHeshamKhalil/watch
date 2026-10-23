import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DetailsView } from "@/components/details-view";
import { SimilarRow } from "@/components/similar-row";
import { getMovieDetails } from "@/lib/tmdb";

export async function generateMetadata({
  params,
}: PageProps<"/movie/[id]">): Promise<Metadata> {
  const { id } = await params;
  const details = await getMovieDetails(+id);
  return { title: details?.title ?? "Not found" };
}

export default async function MoviePage({ params }: PageProps<"/movie/[id]">) {
  const { id } = await params;
  const movieId = Number(id);
  if (!Number.isInteger(movieId)) notFound();
  const details = await getMovieDetails(movieId);
  if (!details) notFound();

  return (
    <>
      <DetailsView details={details} watchHref={`/watch/movie/${movieId}`} />
      <Suspense fallback={null}>
        <SimilarRow type="movie" id={movieId} />
      </Suspense>
    </>
  );
}
