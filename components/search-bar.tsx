"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { MediaItem } from "@/lib/tmdb";

const POSTER_BASE = "https://image.tmdb.org/t/p/w92";

function mediaHref(item: MediaItem) {
  return item.mediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;
}

type SearchState = {
  q: string;
  results: MediaItem[];
};

function showingLoading(current: MediaItem[] | null, loading: boolean) {
  if (!loading) return false;
  return current === null;
}

export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchState | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const q = query.trim();

  useEffect(() => {
    if (q.length < 2) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const results = (await res.json()) as MediaItem[];
        if (!cancelled) setData({ q, results });
      } catch {
        if (!cancelled) setData({ q, results: [] });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const showDropdown = open && q.length >= 2;
  const current = data?.q === q ? data.results : null;
  const showLoading = showingLoading(current, loading);

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q) {
            setOpen(false);
            router.push(`/search?q=${encodeURIComponent(q)}`);
          }
          if (e.key === "Escape") e.currentTarget.blur();
        }}
        placeholder="Search movies & shows"
        className="h-8 rounded-lg border-transparent bg-muted/50 pl-8 pr-8 text-sm focus-visible:bg-muted/70"
        aria-label="Search"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-10 z-50 overflow-hidden rounded-xl border bg-card shadow-xl">
          {showLoading ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">Searching…</p>
          ) : current && current.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto no-scrollbar">
              {current.map((r) => (
                <li key={`${r.mediaType}-${r.id}`}>
                  <Link
                    href={mediaHref(r)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 transition-colors hover:bg-accent"
                  >
                    {r.poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${POSTER_BASE}${r.poster}`}
                        alt=""
                        width={30}
                        height={45}
                        className="h-[45px] w-[30px] rounded bg-muted object-cover"
                      />
                    ) : (
                      <div className="h-[45px] w-[30px] rounded bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.mediaType === "movie" ? "Movie" : "TV"}
                        {r.date ? ` · ${r.date.slice(0, 4)}` : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              No results for “{q}”
            </p>
          )}
        </div>
      )}
    </div>
  );
}
