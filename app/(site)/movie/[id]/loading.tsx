export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-6 md:flex-row md:px-6">
      <div className="hidden h-[330px] w-[220px] shrink-0 rounded-lg bg-muted/40 md:block" />
      <div className="flex-1 space-y-4">
        <div className="h-9 w-2/3 rounded-md bg-muted/40" />
        <div className="h-3.5 w-1/3 rounded bg-muted/40" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 w-16 rounded-full bg-muted/40" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-3 rounded bg-muted/40"
              style={{ width: `${80 - i * 15}%` }}
            />
          ))}
        </div>
        <div className="h-9 w-28 rounded-lg bg-muted/40" />
      </div>
    </div>
  );
}
