import { Link } from "react-router"
import { eligibility, site } from "../data/loadContent.ts"
import { usePageTitle } from "../lib/usePageTitle.ts"

export function Home() {
  usePageTitle("CSC Clinical Companion")
  return (
    <>
      <header className="page-header">
        <p className="eyebrow">{site.org}</p>
        <h1 id="page-title" tabIndex={-1}>
          A desk reference for the therapy hour
        </h1>
        <p className="lede">
          For Master's-level therapists and interns in Children's Specialty Care. Use it to check a
          referral against the scope of service, prepare an intake, adapt the hour to a child's
          developmental level, and look up condition-specific therapy considerations.
        </p>
      </header>

      <section className="reviewer-note" aria-labelledby="reviewer-heading">
        <h2 id="reviewer-heading">{site.reviewerTitle}</h2>
        <p>{site.reviewerNote}</p>
      </section>

      <ol className="module-list">
        {site.modules.map((module) => (
          <li key={module.to}>
            <Link className="module-card" to={module.to}>
              <span className="module-index">{module.index}</span>
              <span>
                <span className="module-title">{module.title}</span>
                <span className="module-text">{module.text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <section className="scope-card" aria-labelledby="scope-heading">
        <h2 id="scope-heading">How the scope fits together</h2>
        <ol className="rule-list">
          <li>
            <strong>Age.</strong> Birth through 18 years, or through completion of high school,
            whichever comes later.
          </li>
          <li>
            <strong>Path 1.</strong> A medical diagnosis the scope lists as having an evidence-based
            behavioral treatment: tic disorders, encopresis, enuresis, functional neurological
            disorder, chronic pain disorders, chronic fatigue.
          </li>
          <li>
            <strong>Or Path 2.</strong> Condition A, a mental health or behavioral disorder, and
            Condition B: a developmental difference, a chronic medical condition, or age under 6.
          </li>
          <li>
            <strong>Exclusions.</strong> High-hour therapies such as ABA. Needs that traditional
            community mental health can meet. A learning disability alone is not a developmental
            difference.
          </li>
          <li>
            <strong>Routing.</strong> Specialty Care Clinic providers check the BH23 “MB Specialty
            referral to CSC” box. Everyone else uses the “Counseling” box and answers Yes to the
            supplemental question.
          </li>
        </ol>
        <p>
          <Link to="/screener">Open the screener</Link> to walk those rules with a specific referral.
          The wording therapists see is in <span className="mono">content/eligibility.json</span>.
        </p>
        <p className="meta">{eligibility.intro[4]}</p>
      </section>
    </>
  )
}
