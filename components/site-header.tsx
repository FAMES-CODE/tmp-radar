import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="topbar">
      <Link className="brand" href="/">
        <span className="brand-mark">R</span>
        <span>TMP-RADAR</span>
      </Link>
      <nav className="top-actions" aria-label="Primary navigation">
        <Link href="/">Dashboard</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/events">Events</Link>
        <Link href="/vtcs">VTCs</Link>
        <Link href="/search">Search</Link>
      </nav>
    </header>
  )
}
