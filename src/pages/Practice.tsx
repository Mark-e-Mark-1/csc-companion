import { Link } from "react-router"
import { caseIntro, cases } from "../data/loadContent.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"

export function Practice() {
  usePageTitle("Practice cases")
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">Module 06 · Practice cases</p>
        <h1 id="page-title" tabIndex={-1}>
          Three cases for supervision
        </h1>
        <p className="lede">{caseIntro}</p>
      </header>
      <ol className="module-list">
        {cases.map((item, index) => (
          <li key={item.id}>
            <Link className="module-card" to={`/practice/${item.id}`}>
              <span className="module-index">0{index + 1}</span>
              <span>
                <span className="module-title">{item.title}</span>
                <span className="module-text">Fictional. {item.questions.length} choices to talk through.</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  )
}
