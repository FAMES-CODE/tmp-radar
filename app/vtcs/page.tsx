/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { getVtcDirectory } from "@/lib/truckersmp/vtcs"
import type { Vtc } from "@/lib/truckersmp/vtcs"
export const dynamic = "force-dynamic"
const pageSize = 6
export default async function VtcsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const page = Math.max(1, Number((await searchParams).page) || 1)
  let all: Vtc[] = []
  let failed = false
  try {
    all = await getVtcDirectory()
  } catch (error) {
    console.error("[vtcs] failed", error)
    failed = true
  }
  const pages = Math.max(1, Math.ceil(all.length / pageSize))
  const current = Math.min(page, pages)
  const vtcs = all.slice((current - 1) * pageSize, current * pageSize)
  return (
    <main className="shell">
      <SiteHeader />
      <section className="detail-hero">
        <p className="eyebrow">VIRTUAL TRUCKING COMPANIES</p>
        <h1>Discover VTCs.</h1>
        <p className="lede">
          A curated live directory from the official TruckersMP discovery
          response.
        </p>
        <Link className="details-link" href="/search">
          Search VTCs →
        </Link>
      </section>
      {failed ? (
        <section className="notice error">
          Unable to load VTCs. TruckersMP may be temporarily unavailable; please
          try again.
        </section>
      ) : vtcs.length === 0 ? (
        <section className="empty">
          <h2>No VTCs available</h2>
          <p>TruckersMP did not return VTC discovery data.</p>
        </section>
      ) : (
        <>
          <section className="directory-grid">
            {vtcs.map((v) => (
              <Link
                className="directory-card"
                href={`/vtcs/${v.id}`}
                key={v.id}
              >
                {v.logo && <img className="vtc-logo" src={v.logo} alt="" />}
                <p className="eyebrow">{v.verified ? "Verified VTC" : "VTC"}</p>
                <h2>{v.name}</h2>
                <p>{v.slogan || v.tag || "No slogan provided"}</p>
                <span>
                  {v.members_count} members · Recruitment: {v.recruitment}
                </span>
              </Link>
            ))}
          </section>
          <nav className="pagination" aria-label="VTC pages">
            <Link
              aria-disabled={current === 1}
              href={`/vtcs?page=${Math.max(1, current - 1)}`}
            >
              Previous
            </Link>
            {Array.from({ length: pages }, (_, i) => (
              <Link
                className={current === i + 1 ? "active" : ""}
                href={`/vtcs?page=${i + 1}`}
                key={i}
              >
                {i + 1}
              </Link>
            ))}
            <Link
              aria-disabled={current === pages}
              href={`/vtcs?page=${Math.min(pages, current + 1)}`}
            >
              Next
            </Link>
          </nav>
        </>
      )}
    </main>
  )
}
