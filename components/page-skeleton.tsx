export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <main className="shell">
      <div className="skeleton title" /> <div className="skeleton lede" />{" "}
      <section className="skeleton-grid">
        {Array.from({ length: cards }, (_, i) => (
          <div className="skeleton card" key={i} />
        ))}
      </section>
    </main>
  )
}
