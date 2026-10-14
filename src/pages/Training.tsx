import { Link } from "react-router"
import { conditions, trainings } from "../data/loadContent.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"

export function Training() {
  usePageTitle("Training map")
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Module 05 · Training map</p>
        <h1 id="page-title" tabIndex={-1}>
          Recorded trainings already on the shelf
        </h1>
        <p className="lede">
          Hours and topics are filled in. Recording links are placeholders. When a link exists, put
          the URL in <span className="mono">content/trainings.json</span> and the cards that point
          here will follow it.
        </p>
      </header>
      <ul className="card-list">
        {trainings.map((training) => {
          const related = conditions.filter((condition) => condition.trainingIds.includes(training.id))
          return (
            <li key={training.id}>
              <Link to={`/training/${training.id}`}>
                <span className="card-title-row">
                  <span className="result-title">{training.title}</span>
                  <span className="chip">{training.hoursLabel}</span>
                </span>
                {training.sessions ? (
                  <span className="meta">{training.sessions} sessions</span>
                ) : null}
                <span className="result-snippet">{training.summary}</span>
                <span className="topic-row">
                  {training.topics.map((topic) => (
                    <span key={topic} className="chip chip-quiet">
                      {topic}
                    </span>
                  ))}
                </span>
                {related.length > 0 ? (
                  <span className="meta">Used by {related.length} condition {related.length === 1 ? "card" : "cards"}.</span>
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
