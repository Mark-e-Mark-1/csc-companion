import { Link, useParams } from "react-router"
import { Blocks } from "../components/Blocks.tsx"
import { TrainingLinks } from "../components/TrainingLinks.tsx"
import { conditionById } from "../data/loadContent.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"
import type { Block } from "../types.ts"

const JUMPS = [
  ["overview", "Overview"],
  ["treatments", "Key treatments"],
  ["burden", "Treatment burden"],
  ["adherence", "Adherence"],
  ["mental-health", "Mental health and development"],
  ["long-term", "Long-term effects"],
  ["red-flags", "Red flags"],
  ["therapy", "Therapy implications"],
  ["sources", "Sources"],
] as const

export function ConditionDetail() {
  const { id } = useParams()
  const condition = id ? conditionById(id) : undefined
  usePageTitle(condition?.title ?? "Condition card")

  if (!condition) {
    return (
      <>
        <h1 id="page-title" tabIndex={-1}>
          That condition card is not in the companion
        </h1>
        <p>
          <Link to="/conditions">Back to condition cards</Link>
        </p>
      </>
    )
  }

  const reviewer = condition.reviewer.trim() || "Not yet assigned"
  const reviewDate = condition.reviewDate.trim() || "Not set"

  return (
    <article>
      <header className="page-header">
        <p className="eyebrow">Module 04 · {condition.group}</p>
        <h1 id="page-title" tabIndex={-1}>
          {condition.title}
        </h1>
        <p className="badge-row">
          <span className="badge">{condition.statusBadge}</span>
          {condition.completeness === "stub" ? <span className="chip">Stub</span> : null}
        </p>
        <p className="lede">{condition.summary}</p>
        <p className="meta">
          Reviewer: {reviewer}. Review date: {reviewDate}.
          {condition.systems.length > 0 ? ` Systems: ${condition.systems.join(", ")}.` : ""}
        </p>
      </header>

      <div className="detail">
        <nav className="toc" aria-label="On this card">
          {JUMPS.map(([anchor, label]) => (
            <button
              key={anchor}
              type="button"
              onClick={() => {
                const node = document.getElementById(anchor)
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
                node?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
                if (node instanceof HTMLElement) node.focus()
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        <div>
          <Section id="overview" title="Overview" blocks={condition.overview} />
          <Section id="treatments" title="Key treatments" blocks={condition.keyTreatments} />
          <Section id="burden" title="Treatment burden on the family" blocks={condition.treatmentBurden} />
          <Section id="adherence" title="Adherence" blocks={condition.adherence} />
          <Section
            id="mental-health"
            title="Mental health and developmental impacts"
            blocks={condition.mentalHealthDevelopmental}
          />
          <Section id="long-term" title="Long-term effects" blocks={condition.longTermEffects} />
          <section id="red-flags" className="section red-flag" tabIndex={-1}>
            <h2>Red flags and when to consult the medical team</h2>
            <Blocks blocks={condition.redFlags} />
          </section>
          <section id="therapy" className="section" tabIndex={-1}>
            <h2>Therapy implications</h2>
            <p className="meta">Services are offered in individual, family, and parent training formats.</p>
            <div className="therapy-grid">
              <TherapyBlock title="Individual" blocks={condition.therapy.individual} />
              <TherapyBlock title="Family" blocks={condition.therapy.family} />
              <TherapyBlock title="Parent training" blocks={condition.therapy.parentTraining} />
            </div>
          </section>
          <TrainingLinks ids={condition.trainingIds} />
          <section id="sources" className="section" tabIndex={-1}>
            <h2>Sources</h2>
            <ol className="bibliography">
              {condition.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  {source.detail ? <span> — {source.detail}</span> : null}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </article>
  )
}

function Section({ id, title, blocks }: { id: string; title: string; blocks: Block[] }) {
  return (
    <section id={id} className="section" tabIndex={-1}>
      <h2>{title}</h2>
      <Blocks blocks={blocks} />
    </section>
  )
}

function TherapyBlock({ title, blocks }: { title: string; blocks: Block[] }) {
  return (
    <section className="therapy-card">
      <h3>{title}</h3>
      <Blocks blocks={blocks} />
    </section>
  )
}
