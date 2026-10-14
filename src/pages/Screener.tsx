import { useMemo, useState } from "react"
import { Link } from "react-router"
import { CheckCard, RadioCard } from "../components/Choices.tsx"
import { TrainingLinks } from "../components/TrainingLinks.tsx"
import { conditionById, eligibility } from "../data/loadContent.ts"
import { evaluate } from "../lib/eligibility.ts"
import { toggleExclusive } from "../lib/multi.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"
import type { AgeBand, Referrer, ScreenerAnswers, YesNoUnsure } from "../types.ts"

const STEPS = ["age", "service", "path1", "conditionA", "conditionB", "fit"] as const

const TONE: Record<string, string> = {
  met: "Met",
  block: "Stops eligibility",
  info: "Note",
  caution: "Ask CSC",
}

type Draft = {
  ageBand: AgeBand | null
  highSchoolCompleted: YesNoUnsure | null
  highHourAba: YesNoUnsure | null
  path1: string[]
  conditionA: string[]
  developmental: string[]
  chronicMedical: string[]
  communityCanMeet: YesNoUnsure | null
  referrer: Referrer | null
}

const EMPTY: Draft = {
  ageBand: null,
  highSchoolCompleted: null,
  highHourAba: null,
  path1: [],
  conditionA: [],
  developmental: [],
  chronicMedical: [],
  communityCanMeet: null,
  referrer: null,
}

function stepValid(step: number, draft: Draft): boolean {
  if (step === 0) {
    if (!draft.ageBand) return false
    if (draft.ageBand === "18plus" && !draft.highSchoolCompleted) return false
    return true
  }
  if (step === 1) return draft.highHourAba !== null
  if (step === 2) return draft.path1.length > 0
  if (step === 3) return draft.conditionA.length > 0
  if (step === 4) return draft.developmental.length > 0 && draft.chronicMedical.length > 0
  return draft.communityCanMeet !== null && draft.referrer !== null
}

export function Screener() {
  usePageTitle("Eligibility and referral")
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)

  const result = useMemo(() => {
    if (!done || !draft.ageBand || !draft.highHourAba || !draft.communityCanMeet || !draft.referrer) {
      return null
    }
    const answers: ScreenerAnswers = {
      ageBand: draft.ageBand,
      highSchoolCompleted: draft.ageBand === "18plus" ? draft.highSchoolCompleted : null,
      highHourAba: draft.highHourAba,
      path1: draft.path1,
      conditionA: draft.conditionA,
      developmental: draft.developmental,
      chronicMedical: draft.chronicMedical,
      communityCanMeet: draft.communityCanMeet,
      referrer: draft.referrer,
    }
    return evaluate(answers)
  }, [done, draft])

  function reset() {
    setDraft(EMPTY)
    setStep(0)
    setDone(false)
    setStarted(false)
  }

  if (!started) {
    return (
      <>
        <header className="page-header">
          <p className="eyebrow">Module 01 · Eligibility and referral</p>
          <h1 id="page-title" tabIndex={-1}>
            Does this referral fit CSC?
          </h1>
          <p className="lede">
            A step-by-step reading of the scope of service. The result is likely eligible, not
            eligible, or needs a consult, plus the BH23 box that matches who is referring.
          </p>
        </header>
        <div className="prose">
          {eligibility.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="actions">
          <button className="btn btn-primary" type="button" onClick={() => setStarted(true)}>
            Start the screener
          </button>
        </div>
      </>
    )
  }

  if (done && result) {
    const cards = result.conditionIds
      .map((id) => conditionById(id))
      .filter((card): card is NonNullable<typeof card> => Boolean(card))
    return (
      <>
        <header className="page-header">
          <p className="eyebrow">Module 01 · Result</p>
          <h1 id="page-title" tabIndex={-1}>
            Eligibility result
          </h1>
        </header>
        <section
          className={`outcome outcome-${result.outcome}`}
          aria-live="polite"
          aria-label={result.title}
        >
          <p className="outcome-kicker">{result.title}</p>
          <p className="outcome-headline">{result.headline}</p>
        </section>
        <h2>Why</h2>
        <ul className="reasons">
          {result.reasons.map((reason) => (
            <li key={reason.text} className={`reason reason-${reason.tone}`}>
              <span className="reason-tone">{TONE[reason.tone]}</span>
              <span>{reason.text}</span>
            </li>
          ))}
        </ul>
        {result.routing ? (
          <section className="routing" aria-labelledby="routing-heading">
            <h2 id="routing-heading">BH23 routing</h2>
            <p>{result.routing.preface}</p>
            <h3>{result.routing.title}</h3>
            <ol>
              {result.routing.steps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p>{result.routing.note}</p>
          </section>
        ) : (
          <section className="routing" aria-labelledby="routing-heading">
            <h2 id="routing-heading">Do not submit a CSC referral</h2>
            <p>{result.closingNote}</p>
          </section>
        )}
        {result.routing ? <p>{result.closingNote}</p> : null}
        {cards.length > 0 ? (
          <div className="related">
            <h2 className="related-title">Condition cards</h2>
            <ul className="link-list">
              {cards.map((card) => (
                <li key={card.id}>
                  <Link to={`/conditions/${card.id}`}>{card.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <TrainingLinks ids={result.trainingIds} />
        <div className="actions no-print">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              setDone(false)
              setStep(STEPS.length - 1)
            }}
          >
            Change answers
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => window.print()}>
            Print result
          </button>
          <button className="btn btn-ghost" type="button" onClick={reset}>
            Start over
          </button>
        </div>
        <p className="meta">Categories only. Refreshing the page clears this result.</p>
      </>
    )
  }

  const valid = stepValid(step, draft)

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">
          Module 01 · Step {step + 1} of {STEPS.length}
        </p>
        <h1 id="page-title" tabIndex={-1}>
          Eligibility and referral
        </h1>
      </header>
      <div
        className="progress"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={step + 1}
        aria-valuetext={`Step ${step + 1} of ${STEPS.length}`}
      >
        <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!valid) return
          if (step === STEPS.length - 1) setDone(true)
          else setStep((value) => value + 1)
        }}
      >
        {step === 0 ? <AgeStep draft={draft} setDraft={setDraft} /> : null}
        {step === 1 ? <AbaStep draft={draft} setDraft={setDraft} /> : null}
        {step === 2 ? <PathStep draft={draft} setDraft={setDraft} /> : null}
        {step === 3 ? <ConditionAStep draft={draft} setDraft={setDraft} /> : null}
        {step === 4 ? <ConditionBStep draft={draft} setDraft={setDraft} /> : null}
        {step === 5 ? <FitStep draft={draft} setDraft={setDraft} /> : null}
        <p id="step-hint" className="meta">
          {valid ? "You can continue." : "Choose a response to continue."}
        </p>
        <div className="actions">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              if (step === 0) setStarted(false)
              else setStep((value) => value - 1)
            }}
          >
            Back
          </button>
          <button className="btn btn-primary" type="submit" disabled={!valid} aria-describedby="step-hint">
            {step === STEPS.length - 1 ? "See the result" : "Continue"}
          </button>
        </div>
      </form>
    </>
  )
}

function AgeStep({ draft, setDraft }: { draft: Draft; setDraft: (value: Draft) => void }) {
  return (
    <fieldset className="step">
      <legend>{eligibility.agePrompt}</legend>
      <p className="help">{eligibility.ageHelp}</p>
      <div className="choices">
        {eligibility.ageOptions.map((option) => (
          <RadioCard
            key={option.id}
            name="age"
            value={option.id}
            checked={draft.ageBand === option.id}
            label={option.label}
            detail={option.detail}
            onChange={() =>
              setDraft({
                ...draft,
                ageBand: option.id as AgeBand,
                highSchoolCompleted: option.id === "18plus" ? draft.highSchoolCompleted : null,
              })
            }
          />
        ))}
      </div>
      {draft.ageBand === "18plus" ? (
        <fieldset className="step nested">
          <legend>{eligibility.highSchoolPrompt}</legend>
          <p className="help">{eligibility.highSchoolHelp}</p>
          <div className="choices">
            {eligibility.highSchoolOptions.map((option) => (
              <RadioCard
                key={option.id}
                name="high-school"
                value={option.id}
                checked={draft.highSchoolCompleted === option.id}
                label={option.label}
                detail={option.detail}
                onChange={() =>
                  setDraft({ ...draft, highSchoolCompleted: option.id as YesNoUnsure })
                }
              />
            ))}
          </div>
        </fieldset>
      ) : null}
    </fieldset>
  )
}

function AbaStep({ draft, setDraft }: { draft: Draft; setDraft: (value: Draft) => void }) {
  return (
    <fieldset className="step">
      <legend>{eligibility.abaPrompt}</legend>
      <p className="help">{eligibility.abaHelp}</p>
      <div className="choices">
        {eligibility.abaOptions.map((option) => (
          <RadioCard
            key={option.id}
            name="aba"
            value={option.id}
            checked={draft.highHourAba === option.id}
            label={option.label}
            detail={option.detail}
            onChange={() => setDraft({ ...draft, highHourAba: option.id as YesNoUnsure })}
          />
        ))}
      </div>
    </fieldset>
  )
}

function PathStep({ draft, setDraft }: { draft: Draft; setDraft: (value: Draft) => void }) {
  return (
    <fieldset className="step">
      <legend>{eligibility.path1Prompt}</legend>
      <p className="help">{eligibility.path1Help}</p>
      <div className="choices">
        {eligibility.path1Options.map((option) => (
          <CheckCard
            key={option.id}
            checked={draft.path1.includes(option.id)}
            label={option.label}
            detail={"detail" in option && typeof option.detail === "string" ? option.detail : undefined}
            onChange={() => setDraft({ ...draft, path1: toggleExclusive(draft.path1, option.id) })}
          />
        ))}
      </div>
    </fieldset>
  )
}

function ConditionAStep({ draft, setDraft }: { draft: Draft; setDraft: (value: Draft) => void }) {
  return (
    <fieldset className="step">
      <legend>{eligibility.conditionAPrompt}</legend>
      <p className="help">{eligibility.conditionAHelp}</p>
      <div className="choices">
        {eligibility.conditionAOptions.map((option) => (
          <CheckCard
            key={option.id}
            checked={draft.conditionA.includes(option.id)}
            label={option.label}
            detail={"detail" in option && typeof option.detail === "string" ? option.detail : undefined}
            onChange={() =>
              setDraft({ ...draft, conditionA: toggleExclusive(draft.conditionA, option.id) })
            }
          />
        ))}
      </div>
    </fieldset>
  )
}

function ConditionBStep({ draft, setDraft }: { draft: Draft; setDraft: (value: Draft) => void }) {
  return (
    <>
      {draft.ageBand === "under6" ? (
        <p className="callout">
          This child is under 6, so Condition B is already met by age if Condition A is present.
          Still mark developmental differences and medical conditions. They change the formulation
          even when age is enough.
        </p>
      ) : null}
      <fieldset className="step">
        <legend>{eligibility.devPrompt}</legend>
        <p className="help">{eligibility.devHelp}</p>
        <div className="choices">
          {eligibility.devOptions.map((option) => (
            <CheckCard
              key={option.id}
              checked={draft.developmental.includes(option.id)}
              label={option.label}
              detail={option.detail}
              onChange={() =>
                setDraft({
                  ...draft,
                  developmental: toggleExclusive(draft.developmental, option.id),
                })
              }
            />
          ))}
        </div>
      </fieldset>
      <fieldset className="step">
        <legend>{eligibility.medicalPrompt}</legend>
        <p className="help">{eligibility.medicalHelp}</p>
        <div className="choices">
          {eligibility.medicalOptions.map((option) => (
            <CheckCard
              key={option.id}
              checked={draft.chronicMedical.includes(option.id)}
              label={option.label}
              detail={option.detail}
              onChange={() =>
                setDraft({
                  ...draft,
                  chronicMedical: toggleExclusive(draft.chronicMedical, option.id),
                })
              }
            />
          ))}
        </div>
      </fieldset>
    </>
  )
}

function FitStep({ draft, setDraft }: { draft: Draft; setDraft: (value: Draft) => void }) {
  return (
    <>
      <fieldset className="step">
        <legend>{eligibility.communityPrompt}</legend>
        <p className="help">{eligibility.communityHelp}</p>
        <div className="choices">
          {eligibility.communityOptions.map((option) => (
            <RadioCard
              key={option.id}
              name="community"
              value={option.id}
              checked={draft.communityCanMeet === option.id}
              label={option.label}
              detail={option.detail}
              onChange={() =>
                setDraft({ ...draft, communityCanMeet: option.id as YesNoUnsure })
              }
            />
          ))}
        </div>
      </fieldset>
      <fieldset className="step">
        <legend>{eligibility.referrerPrompt}</legend>
        <p className="help">{eligibility.referrerHelp}</p>
        <div className="choices">
          {eligibility.referrerOptions.map((option) => (
            <RadioCard
              key={option.id}
              name="referrer"
              value={option.id}
              checked={draft.referrer === option.id}
              label={option.label}
              detail={option.detail}
              onChange={() => setDraft({ ...draft, referrer: option.id as Referrer })}
            />
          ))}
        </div>
      </fieldset>
    </>
  )
}
