export default function Loading() {
  return (
    <div className="min-h-svh">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 md:px-6">
        <div className="h-4 w-40 rounded bg-muted/40" />
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="aspect-video w-full rounded-xl bg-muted/30 ring-1 ring-inset ring-white/10" />
        <div className="mt-4 space-y-2">
          <div className="h-5 w-64 rounded bg-muted/40" />
          <div className="h-3 w-40 rounded bg-muted/40" />
        </div>
      </div>
    </div>
  );
}
