import { Link, useParams } from "react-router"
import { conditions, trainingById } from "../data/loadContent.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"

export function TrainingDetail() {
  const { id } = useParams()
  const training = id ? trainingById(id) : undefined
  usePageTitle(training?.title ?? "Training")

  if (!training) {
    return (
      <>
        <h1 id="page-title" tabIndex={-1}>
          That training is not in the map
        </h1>
        <p>
          <Link to="/training">Back to the training map</Link>
        </p>
      </>
    )
  }

  const related = conditions.filter((condition) => condition.trainingIds.includes(training.id))

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Module 05 · Training</p>
        <h1 id="page-title" tabIndex={-1}>
          {training.title}
        </h1>
        <p className="lede">{training.summary}</p>
        <p className="badge-row">
          <span className="chip">{training.hoursLabel}</span>
          {training.sessions ? <span className="chip">{training.sessions} sessions</span> : null}
        </p>
      </header>
      <h2>Topics</h2>
      <ul>
        {training.topics.map((topic) => (
          <li key={topic}>{topic}</li>
        ))}
      </ul>
      <h2>Recording</h2>
      {training.link ? (
        <p>
          <a href={training.link} target="_blank" rel="noreferrer">
            {training.linkLabel}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      ) : (
        <p className="callout">
          {training.linkLabel}. Edit <span className="mono">content/trainings.json</span> and set{" "}
          <span className="mono">link</span> for id <span className="mono">{training.id}</span>.
          Leave the field empty until the URL is real.
        </p>
      )}
      {related.length > 0 ? (
        <>
          <h2>Condition cards that point here</h2>
          <ul className="link-list">
            {related.map((condition) => (
              <li key={condition.id}>
                <Link to={`/conditions/${condition.id}`}>{condition.title}</Link>
                {condition.completeness === "stub" ? <span className="meta"> Stub</span> : null}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="meta">No condition card points at this training yet.</p>
      )}
    </>
  )
}
