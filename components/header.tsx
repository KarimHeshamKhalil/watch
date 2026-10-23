import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { cn } from "cn";

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-background/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 md:px-6">
        <Link
          href="/"
          className="font-semibold text-[15px] tracking-tight text-foreground hover:opacity-80 transition-opacity shrink-0"
        >
          watch<span className="text-red-500">.</span>
        </Link>
        <SearchBar />
        <div className="ml-auto flex items-center gap-5 text-sm text-muted-foreground">
          <Link
            href="/browse/movie"
            className="hover:text-foreground transition-colors hidden sm:block"
          >
            Movies
          </Link>
          <Link
            href="/browse/tv"
            className="hover:text-foreground transition-colors hidden sm:block"
          >
            Shows
          </Link>
        </div>
      </div>
    </header>
  );
}
