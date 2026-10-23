import { MediaRow } from "@/components/media-card";
import { getSimilar } from "@/lib/tmdb";

export async function SimilarRow({
  type,
  id,
  title = "More like this",
}: {
  type: "movie" | "tv";
  id: number;
  title?: string;
}) {
  const items = await getSimilar(type, id);
  return <MediaRow title={title} items={items} />;
}
