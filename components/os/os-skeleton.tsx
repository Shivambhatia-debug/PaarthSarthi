/** Neutral loading state shown until the demo store hydrates (pages never flash default state). */
export function OSPageSkeleton() {
  return (
    <div className="mx-auto min-h-[60vh] w-full max-w-7xl px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading">
      <div className="os-skel mb-3 h-4 w-40 rounded-md" />
      <div className="os-skel mb-8 h-8 w-72 max-w-full rounded-lg" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="os-skel mb-4 h-3.5 w-1/2 rounded" style={{ animationDelay: `${i * 120}ms` }} />
            <div className="os-skel mb-3 h-9 w-2/3 rounded-md" style={{ animationDelay: `${i * 120 + 60}ms` }} />
            <div className="os-skel h-24 w-full rounded-lg" style={{ animationDelay: `${i * 120 + 120}ms` }} />
          </div>
        ))}
      </div>
    </div>
  )
}
