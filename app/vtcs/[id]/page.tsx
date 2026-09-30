/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { RichContent } from "@/components/rich-content"
import { getVtc } from "@/lib/truckersmp/vtcs"
export default async function VtcPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()
  let vtc
  try {
    vtc = await getVtc(id)
  } catch {
    return (
      <main className="shell">
        <SiteHeader />
        <section className="notice error">
          Unable to load this VTC. It may no longer be available.
        </section>
      </main>
    )
  }
  return (
    <main className="shell">
      <SiteHeader />
      <Link className="back" href="/vtcs">
        ← VTC directory
      </Link>
      <section className="detail-hero">
        {vtc.cover && <img className="event-banner" src={vtc.cover} alt="" />}
        {vtc.logo && <img className="vtc-detail-logo" src={vtc.logo} alt="" />}
        <p className="eyebrow">
          {vtc.verified ? "Verified VTC" : "Virtual trucking company"}
        </p>
        <h1>{vtc.name}</h1>
        <p className="lede">{vtc.slogan || vtc.tag || "No slogan provided"}</p>
      </section>
      <section className="detail-grid">
        <article className="detail-card">
          <p>Members</p>
          <strong>{vtc.members_count.toLocaleString()}</strong>
          <span>Recruitment: {vtc.recruitment}</span>
        </article>
        <article className="detail-card">
          <p>Owner</p>
          <strong className="date-value">{vtc.owner_username}</strong>
          <span>
            {vtc.language} · Created{" "}
            {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(
              new Date(`${vtc.created.replace(" ", "T")}Z`)
            )}
          </span>
        </article>
      </section>
      <section className="information">
        <p className="eyebrow">ABOUT</p>
        <RichContent
          content={
            vtc.information || "This VTC has not published an introduction."
          }
        />
        {vtc.website && (
          <p>
            <a
              className="details-link"
              href={vtc.website}
              rel="noreferrer"
              target="_blank"
            >
              Visit website →
            </a>
          </p>
        )}
      </section>
    </main>
  )
}
