import { Link } from "react-router"
import { trainingById } from "../data/loadContent.ts"

export function TrainingLinks({ ids, heading = "Related training" }: { ids: string[]; heading?: string }) {
  const items = ids
    .map((id) => trainingById(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
  if (!items.length) {
    return <p className="meta">No recorded training is mapped to this yet. Add an id in the content file when a recording exists.</p>
  }
  return (
    <div className="related">
      <h2 className="related-title">{heading}</h2>
      <ul className="link-list">
        {items.map((training) => (
          <li key={training.id}>
            <Link to={`/training/${training.id}`}>{training.title}</Link>
            <span className="meta"> {training.hoursLabel}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
