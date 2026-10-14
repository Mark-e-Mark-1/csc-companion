import { Link, Navigate, useParams } from "react-router"
import { TrainingLinks } from "../components/TrainingLinks.tsx"
import { development, stageById } from "../data/loadContent.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"
import type { AdaptationId, DomainId, PaceId } from "../types.ts"

const PACES: PaceId[] = ["ahead", "typical", "behind"]

export function Lens() {
  const params = useParams()
  const stageId = params.stageId
  const paceId = params.paceId
  const stage = stageId ? stageById(stageId) : undefined
  const pace = PACES.find((item) => item === paceId)
  const paceMeta = development.paces.find((item) => item.id === paceId)
  usePageTitle(stage && paceMeta ? `${stage.title}, ${paceMeta.label}` : "Developmental lens")

  if (!stageId || !paceId) {
    return <Navigate to="/development/school-age/typical" replace />
  }

  if (!stage || !pace || !paceMeta) {
    return (
      <>
        <h1 id="page-title" tabIndex={-1}>
          That developmental profile is not in the companion
        </h1>
        <p>
          <Link to="/development/school-age/typical">Open school age, typical pace</Link>
        </p>
      </>
    )
  }

  const domains = stage.domains[pace]
  const adaptations = stage.adaptations[pace]

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Module 03 · Developmental lens</p>
        <h1 id="page-title" tabIndex={-1}>
          {stage.title}
        </h1>
        <p className="lede">{development.intro}</p>
      </header>

      <div className="segment-block" role="navigation" aria-label="Developmental stage">
        {development.stages.map((item) => (
          <Link
            key={item.id}
            to={`/development/${item.id}/${pace}`}
            className={item.id === stage.id ? "segment is-selected" : "segment"}
            aria-current={item.id === stage.id ? "page" : undefined}
          >
            <span>{item.title}</span>
            <span className="segment-hint">{item.ages}</span>
          </Link>
        ))}
      </div>

      <div className="segment-block" role="navigation" aria-label="Pace relative to age">
        {development.paces.map((item) => (
          <Link
            key={item.id}
            to={`/development/${stage.id}/${item.id}`}
            className={item.id === pace ? "segment is-selected" : "segment"}
            aria-current={item.id === pace ? "page" : undefined}
          >
            <span>{item.label}</span>
            <span className="segment-hint">{item.hint}</span>
          </Link>
        ))}
      </div>

      <p className="callout">
        Showing {stage.title.toLowerCase()}, pace {paceMeta.label.toLowerCase()} ({paceMeta.hint}).
        {stage.summary}
      </p>

      <div className="domain-grid">
        {development.domains.map((domain) => (
          <section key={domain.id} className="domain-card">
            <h2>{domain.label}</h2>
            <p>{domains[domain.id as DomainId]}</p>
          </section>
        ))}
      </div>

      <section className="adapt-panel" aria-labelledby="adapt-heading">
        <h2 id="adapt-heading">How to adapt the intervention</h2>
        <dl className="adapt-list">
          {development.adaptations.map((item) => (
            <div key={item.id}>
              <dt>{item.label}</dt>
              <dd>{adaptations[item.id as AdaptationId]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="callout" aria-labelledby="function-heading">
        <h2 id="function-heading">A functional view of behavior</h2>
        <p>{development.functionalOverview}</p>
      </section>

      <TrainingLinks ids={["dev-complexity", "aba"]} />
    </>
  )
}
