import { SiteHeader } from "@/components/site-header"
import { GlobalSearch } from "@/components/global-search"
export default function SearchPage() {
  return (
    <main className="shell">
      <SiteHeader />
      <section className="detail-hero">
        <p className="eyebrow">TRUCKERSMP DIRECTORY</p>
        <h1>Search the road ahead.</h1>
        <p className="lede">
          Find VTCs by name or tag, and players by their public TruckersMP ID.
        </p>
      </section>
      <GlobalSearch />
    </main>
  )
}
