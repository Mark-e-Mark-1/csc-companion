import { useMemo, useState } from "react"
import { Link } from "react-router"
import { RadioCard } from "../components/Choices.tsx"
import { TrainingLinks } from "../components/TrainingLinks.tsx"
import {
  adaptationLabels,
  conditions,
  development,
  intakeConcerns,
  intakeGroups,
  sources,
  stages,
  trainingById,
  universalQuestions,
} from "../data/loadContent.ts"
import { buildChecklist } from "../lib/intake.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"
import type { PaceId } from "../types.ts"

type Target =
  | { kind: "condition"; id: string }
  | { kind: "concern"; id: string }
  | null

export function Intake() {
  usePageTitle("Intake guide")
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [target, setTarget] = useState<Target>(null)
  const [stageId, setStageId] = useState<string | null>(null)
  const [paceId, setPaceId] = useState<PaceId | null>(null)

  const source = sources.find((item) => item.id === sourceId) ?? null
  const condition =
    target?.kind === "condition" ? conditions.find((item) => item.id === target.id) ?? null : null
  const concern =
    target?.kind === "concern" ? intakeConcerns.find((item) => item.id === target.id) ?? null : null
  const stage = stages.find((item) => item.id === stageId) ?? null
  const ready = Boolean(source && stage && paceId && (condition || concern))

  const checklist = useMemo(() => {
    if (!source || !stage || !paceId || (!condition && !concern)) return null
    return buildChecklist({
      universal: universalQuestions,
      source,
      concern,
      condition,
      stage,
      pace: paceId,
      adaptationLabels: adaptationLabels(),
    })
  }, [source, concern, condition, stage, paceId])

  const pace = development.paces.find((item) => item.id === paceId)

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Module 02 · Intake guide</p>
        <h1 id="page-title" tabIndex={-1}>
          Questions for this referral
        </h1>
        <p className="lede">
          Pick who sent the child, the condition, and the approximate developmental level. The
          checklist is built in this tab and disappears when you refresh. It is not a note and it
          is not saved.
        </p>
      </header>

      <div className="no-print">
        <fieldset className="step">
          <legend>Referral source</legend>
          {intakeGroups.map((group) => (
            <div key={group.id} className="choice-group">
              <h2 className="group-label">{group.label}</h2>
              <div className="choices cols-2">
                {group.sources.map((item) => (
                  <RadioCard
                    key={item.id}
                    name="source"
                    value={item.id}
                    checked={sourceId === item.id}
                    label={item.label}
                    detail={item.detail}
                    onChange={() => setSourceId(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </fieldset>

        <fieldset className="step">
          <legend>Condition</legend>
          <h2 className="group-label">Conditions with a card</h2>
          <div className="choices cols-2">
            {conditions.map((item) => (
              <RadioCard
                key={item.id}
                name="condition"
                value={item.id}
                checked={target?.kind === "condition" && target.id === item.id}
                label={item.title}
                detail={item.completeness === "stub" ? "Stub card" : item.group}
                onChange={() => setTarget({ kind: "condition", id: item.id })}
              />
            ))}
          </div>
          <h2 className="group-label">Behavioral concerns without a full card</h2>
          <div className="choices cols-2">
            {intakeConcerns.map((item) => (
              <RadioCard
                key={item.id}
                name="condition"
                value={item.id}
                checked={target?.kind === "concern" && target.id === item.id}
                label={item.label}
                detail={item.detail}
                onChange={() => setTarget({ kind: "concern", id: item.id })}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="step">
          <legend>Approximate developmental level</legend>
          <p className="help">
            Stage is the age band. Pace is where skills sit relative to that age: Ahead (gifted or
            highly capable), Typical, or Behind (needs more support than same-age peers).
          </p>
          <h2 className="group-label">Stage</h2>
          <div className="choices cols-2">
            {stages.map((item) => (
              <RadioCard
                key={item.id}
                name="stage"
                value={item.id}
                checked={stageId === item.id}
                label={item.title}
                detail={item.ages}
                onChange={() => setStageId(item.id)}
              />
            ))}
          </div>
          <h2 className="group-label">Pace</h2>
          <div className="choices cols-2">
            {development.paces.map((item) => (
              <RadioCard
                key={item.id}
                name="pace"
                value={item.id}
                checked={paceId === item.id}
                label={item.label}
                detail={item.hint}
                onChange={() => setPaceId(item.id as PaceId)}
              />
            ))}
          </div>
        </fieldset>
      </div>

      {!ready || !checklist || !source || !stage || !pace ? (
        <p className="empty">Choose a source, a condition, a stage, and a pace to build the checklist.</p>
      ) : (
        <article className="checklist" aria-live="polite">
          <header className="print-head">
            <p className="eyebrow">CSC intake preparation — not a patient record</p>
            <h2>Checklist</h2>
            <p>
              {source.label}
              {" · "}
              {condition?.title ?? concern?.label}
              {" · "}
              {stage.title}, {pace.label.toLowerCase()}
            </p>
            <p className="meta">Do not write a name on this page. Nothing here is stored.</p>
          </header>
          <ChecklistSection title="Questions to ask" items={checklist.questions} />
          <ChecklistSection title="Differential considerations" items={checklist.differentials} />
          <ChecklistSection title="Intervention modifications" items={checklist.modifications} />
          {condition ? (
            <p>
              <Link to={`/conditions/${condition.id}`}>Open the {condition.title} card</Link>
            </p>
          ) : null}
          <p>
            <Link to={`/development/${stage.id}/${pace.id}`}>
              Open this developmental profile
            </Link>
          </p>
          <TrainingLinks ids={checklist.trainingIds} />
          <div className="actions no-print">
            <button className="btn btn-primary" type="button" onClick={() => window.print()}>
              Print checklist
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setSourceId(null)
                setTarget(null)
                setStageId(null)
                setPaceId(null)
              }}
            >
              Clear selections
            </button>
          </div>
        </article>
      )}
    </>
  )
}

function ChecklistSection({
  title,
  items,
}: {
  title: string
  items: { id: string; text: string; trainingIds: string[] }[]
}) {
  return (
    <section className="check-section">
      <h3>{title}</h3>
      <ul className="check-items">
        {items.map((item) => (
          <li key={item.id}>
            <span>{item.text}</span>
            {item.trainingIds.length > 0 ? (
              <span className="item-links">
                {item.trainingIds.map((id) => {
                  const training = trainingById(id)
                  if (!training) return null
                  return (
                    <Link key={id} to={`/training/${id}`}>
                      {training.title}
                    </Link>
                  )
                })}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
