import { useMemo, useState } from "react"
import { Link } from "react-router"
import { conditions } from "../data/loadContent.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"

type Filter = "all" | "full" | "stub"

export function Conditions() {
  usePageTitle("Condition cards")
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const visible = conditions.filter((condition) => {
      if (filter === "full" && condition.completeness !== "full") return false
      if (filter === "stub" && condition.completeness !== "stub") return false
      if (!needle) return true
      return (
        condition.title.toLowerCase().includes(needle) ||
        condition.summary.toLowerCase().includes(needle) ||
        condition.group.toLowerCase().includes(needle)
      )
    })
    const buckets: { name: string; items: typeof visible }[] = []
    for (const condition of visible) {
      const bucket = buckets.find((item) => item.name === condition.group)
      if (bucket) bucket.items.push(condition)
      else buckets.push({ name: condition.group, items: [condition] })
    }
    return buckets
  }, [filter, query])

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Module 04 · Condition cards</p>
        <h1 id="page-title" tabIndex={-1}>
          Illnesses CSC sits beside
        </h1>
        <p className="lede">
          Type 1 diabetes, cystic fibrosis, and pediatric cancer are written out for use in draft.
          The other cards are stubs with the same sections, waiting on the medical team. Every card
          is marked draft until a reviewer and date are filled in.
        </p>
      </header>
      <div className="filter-row">
        <div role="group" aria-label="Card status">
          <FilterButton current={filter} id="all" setFilter={setFilter} label="All" />
          <FilterButton current={filter} id="full" setFilter={setFilter} label="Full drafts" />
          <FilterButton current={filter} id="stub" setFilter={setFilter} label="Stubs" />
        </div>
        <label className="filter-search">
          <span className="sr-only">Filter cards. Do not type patient information.</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name"
            autoComplete="off"
          />
        </label>
      </div>
      {groups.length === 0 ? (
        <p className="empty" role="status">
          No card matches that filter.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.name} className="card-group" aria-labelledby={`group-${group.name}`}>
            <h2 id={`group-${group.name}`}>{group.name}</h2>
            <ul className="card-list">
              {group.items.map((condition) => (
                <li key={condition.id}>
                  <Link to={`/conditions/${condition.id}`}>
                    <span className="card-title-row">
                      <span className="result-title">{condition.title}</span>
                      {condition.completeness === "stub" ? <span className="chip">Stub</span> : null}
                    </span>
                    <span className="badge">{condition.statusBadge}</span>
                    <span className="result-snippet">{condition.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  )
}

function FilterButton({
  current,
  id,
  label,
  setFilter,
}: {
  current: Filter
  id: Filter
  label: string
  setFilter: (value: Filter) => void
}) {
  return (
    <button
      type="button"
      className={current === id ? "btn btn-primary" : "btn btn-ghost"}
      aria-pressed={current === id}
      onClick={() => setFilter(id)}
    >
      {label}
    </button>
  )
}
