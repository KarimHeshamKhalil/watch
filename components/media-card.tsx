import Link from "next/link";
import Image from "next/image";
import type { MediaItem } from "@/lib/tmdb";
import { cn } from "cn";

const ROW_SIZES = "(max-width: 640px) 38vw, 171px";
const GRID_SIZES =
  "(max-width: 640px) 31vw, (max-width: 768px) 23vw, (max-width: 1024px) 19vw, (max-width: 1280px) 14vw, 165px";

export function MediaCard({
  item,
  className,
  variant = "row",
}: {
  item: MediaItem;
  className?: string;
  variant?: "row" | "grid";
}) {
  const src = item.poster ? `https://image.tmdb.org/t/p/w342${item.poster}` : null;
  return (
    <Link
      href={item.mediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`}
      className={cn("group block shrink-0 snap-start", className)}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted/40 ring-1 ring-inset ring-white/5 transition-all group-hover:ring-white/20">
        {src ? (
          <Image
            src={src}
            alt={item.title}
            fill
            loading="lazy"
            className="object-cover transition-opacity group-hover:opacity-80"
            sizes={variant === "row" ? ROW_SIZES : GRID_SIZES}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-xs text-muted-foreground">
            {item.title}
          </div>
        )}
      </div>
      <div className="mt-1.5 space-y-0.5">
        <p className="clamp-1 text-[13px] font-medium text-foreground/90">
          {item.title}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {item.mediaType === "movie" ? "Movie" : "TV Show"}
          {item.date ? ` · ${item.date.slice(0, 4)}` : ""}
        </p>
      </div>
    </Link>
  );
}

export function MediaRow({
  title,
  items,
  href,
}: {
  title: string;
  items: MediaItem[];
  href?: string;
}) {
  const cards = items.filter((i) => i.poster !== null).slice(0, 20);
  if (cards.length === 0) return null;
  return (
    <section className="w-full">
      <div className="mx-auto mb-3 flex max-w-7xl items-baseline justify-between px-4 md:px-6">
        <h2 className="text-[15px] font-medium tracking-tight text-foreground/90">
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        )}
      </div>
      <div className="flex snap-x gap-3 overflow-x-auto pb-1 no-scrollbar -mx-0 px-4 md:px-6 [scroll-padding-inline:1rem] md:[scroll-padding-inline:1.5rem]">
        {cards.map((item) => (
          <MediaCard
            key={`${item.mediaType}-${item.id}`}
            item={item}
            variant="row"
            className="w-[150px] md:w-[171px]"
          />
        ))}
      </div>
    </section>
  );
}

export function MediaGrid({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {items.map((item) => (
        <MediaCard key={`${item.mediaType}-${item.id}`} item={item} variant="grid" />
      ))}
    </div>
  );
}
