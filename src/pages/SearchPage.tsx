import { useMemo } from "react"
import { Link, useSearchParams } from "react-router"
import { buildSearchDocs } from "../data/searchIndex.ts"
import { searchDocs } from "../lib/search.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"

export function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get("q") ?? ""
  usePageTitle(query ? `Search: ${query}` : "Search")
  const docs = useMemo(() => buildSearchDocs(), [])
  const hits = useMemo(() => searchDocs(docs, query), [docs, query])

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Search</p>
        <h1 id="page-title" tabIndex={-1}>
          {query ? `Results for “${query}”` : "Search the companion"}
        </h1>
        <p className="lede">
          Looks through the scope, condition cards, developmental lens, intake prompts, trainings,
          and practice cases. Do not type names, dates of birth, or record numbers. This box is not
          saved.
        </p>
      </header>
      {query && hits.length === 0 ? (
        <p className="empty" role="status">
          Nothing matched. Try a condition, a training topic, or a word from the scope such as
          encopresis or BH23.
        </p>
      ) : null}
      {hits.length > 0 ? (
        <ul className="result-list" aria-label="Search results">
          {hits.map((hit) => (
            <li key={hit.id}>
              <Link to={hit.to}>
                <span className="chip">{hit.kind}</span>
                <span className="result-title">{hit.title}</span>
                <span className="result-snippet">{hit.snippet}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {!query ? <p className="meta">Use the search box at the top. Press slash to focus it.</p> : null}
    </>
  )
}
