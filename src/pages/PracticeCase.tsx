import { useState } from "react"
import { Link, useParams } from "react-router"
import { cases } from "../data/loadContent.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"

export function PracticeCase() {
  const { id } = useParams()
  const item = cases.find((entry) => entry.id === id)
  const [picked, setPicked] = useState<Record<string, string>>({})
  usePageTitle(item ? item.title : "Practice case")

  if (!item) {
    return (
      <>
        <h1 id="page-title" tabIndex={-1}>
          That practice case is not in the companion
        </h1>
        <p>
          <Link to="/practice">Back to practice cases</Link>
        </p>
      </>
    )
  }

  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Module 06 · Fictional case</p>
        <h1 id="page-title" tabIndex={-1}>
          {item.title}
        </h1>
        <p className="lede">{item.vignette}</p>
      </header>
      {item.questions.map((question, index) => {
        const selected = picked[question.id]
        const revealed = Boolean(selected)
        return (
          <fieldset key={question.id} className="step">
            <legend>
              {index + 1}. {question.prompt}
            </legend>
            <div className="choices">
              {question.choices.map((choice) => {
                const isSelected = selected === choice.id
                const showFit = revealed && choice.fit
                return (
                  <div key={choice.id} className={isSelected ? "practice-choice is-selected" : "practice-choice"}>
                    <label className="choice">
                      <input
                        type="radio"
                        name={question.id}
                        value={choice.id}
                        checked={isSelected}
                        onChange={() => setPicked((current) => ({ ...current, [question.id]: choice.id }))}
                      />
                      <span className="choice-body">
                        <span className="choice-label">{choice.label}</span>
                        {showFit ? <span className="chip">Fits the scope</span> : null}
                      </span>
                    </label>
                    {isSelected ? (
                      <p className={choice.fit ? "feedback feedback-fit" : "feedback feedback-rethink"} role="status">
                        {choice.feedback}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </fieldset>
        )
      })}
      <section className="callout">
        <h2>Take to supervision</h2>
        <p>{item.takeaway}</p>
      </section>
      <ul className="link-list">
        {item.related.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>{link.label}</Link>
          </li>
        ))}
      </ul>
      <p className="meta">Your choices stay in this tab until you leave or refresh. They are not scored and not saved.</p>
    </>
  )
}
