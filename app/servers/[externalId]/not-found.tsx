import Link from "next/link"
export default function NotFound() {
  return (
    <main className="shell">
      <p className="eyebrow">404</p>
      <h1>Server not found.</h1>
      <p className="lede">
        It has not been synced yet, or its identifier is invalid.
      </p>
      <Link href="/" className="sync-button">
        Back to radar
      </Link>
    </main>
  )
}
