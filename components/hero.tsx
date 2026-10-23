import Link from "next/link";
import Image from "next/image";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "@/lib/tmdb";

function hrefOf(item: MediaItem) {
  return item.mediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
}

export function Hero({ item }: { item: MediaItem }) {
  const backdrop = item.backdrop
    ? `https://image.tmdb.org/t/p/w1280${item.backdrop}`
    : item.poster
      ? `https://image.tmdb.org/t/p/w1280${item.poster}`
      : null;

  return (
    <div className="relative">
      {backdrop && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src={backdrop}
            alt=""
            fill
            preload
            className="object-cover object-[center_20%] opacity-40"
            sizes="100vw"
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 md:px-6 md:pb-12 md:pt-16">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {item.mediaType === "movie" ? "Featured movie" : "Featured show"}
            {item.rating > 0 ? ` · ★ ${item.rating.toFixed(1)}` : ""}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
            {item.title}
          </h1>
          <div className="mt-6 flex items-center gap-3">
            <Button size="lg" className="gap-2" asChild>
              <Link
                href={
                  item.mediaType === "movie"
                    ? `/watch/movie/${item.id}`
                    : `/watch/tv/${item.id}`
                }
              >
                <PlayIcon className="size-4 fill-current" />
                Play
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href={hrefOf(item)}>Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
