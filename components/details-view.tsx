import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { PlayIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Details } from "@/lib/tmdb";

function year(d: string | null) {
  return d ? d.slice(0, 4) : null;
}

export function DetailsView({
  details,
  watchHref,
  children,
}: {
  details: Details;
  watchHref: string;
  children?: ReactNode;
}) {
  const backdrop = details.backdrop
    ? `https://image.tmdb.org/t/p/original${details.backdrop}`
    : null;

  return (
    <div className="relative">
      {backdrop && (
        <div className="absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden">
          <Image
            src={backdrop}
            alt=""
            fill
            className="object-cover object-top opacity-25"
            sizes="100vw"
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
      )}
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-12 pt-6 md:flex-row md:px-6">
        <div className="hidden w-[220px] shrink-0 md:block">
          {details.poster ? (
            <Image
              src={`https://image.tmdb.org/t/p/w500${details.poster}`}
              alt={details.title}
              width={220}
              height={330}
              className="rounded-lg object-cover ring-1 ring-inset ring-white/10"
            />
          ) : (
            <div className="h-[330px] w-[220px] rounded-lg bg-muted/40" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {details.title}
          </h1>
          {details.tagline && (
            <p className="mt-1.5 text-sm italic text-muted-foreground">
              “{details.tagline}”
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {year(details.date) && <span>{year(details.date)}</span>}
            {details.runtime ? (
              <span>
                · {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
              </span>
            ) : null}
            {details.rating > 0 && (
              <span className="text-foreground/80">
                · ★ {details.rating.toFixed(1)}
              </span>
            )}
            {details.status && <span>· {details.status}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {details.genres.map((g) => (
              <Link
                key={g.id}
                href={
                  details.type === "movie"
                    ? `/browse/movie?genre=${g.id}`
                    : `/browse/tv?genre=${g.id}`
                }
                className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </div>
          <p className="clamp-3 mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {details.overview || "No synopsis available."}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Button size="lg" className="gap-2" asChild>
              <Link href={watchHref}>
                <PlayIcon className="size-4 fill-current" />
                Play
              </Link>
            </Button>
          </div>
          {details.cast.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Top billed cast
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
                {details.cast.map((person) => (
                  <div key={person.id} className="w-16 shrink-0 text-center">
                    <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-muted/40">
                      {person.profile ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://image.tmdb.org/t/p/w138_and_h175_face${person.profile}`}
                          alt={person.name}
                          width={64}
                          height={64}
                          loading="lazy"
                          className="h-16 w-16 object-cover"
                        />
                      ) : null}
                    </div>
                    <p className="clamp-1 mt-2 text-[11px] font-medium text-foreground/90">
                      {person.name}
                    </p>
                    <p className="clamp-1 text-[11px] text-muted-foreground">
                      {person.character}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
