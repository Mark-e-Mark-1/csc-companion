type RadioProps = {
  name: string
  value: string
  checked: boolean
  onChange: () => void
  label: string
  detail?: string
}

export function RadioCard({ name, value, checked, onChange, label, detail }: RadioProps) {
  return (
    <label className={checked ? "choice is-selected" : "choice"}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span className="choice-body">
        <span className="choice-label">{label}</span>
        {detail ? <span className="choice-detail">{detail}</span> : null}
      </span>
      <span className="choice-mark" aria-hidden="true">
        {checked ? "Yes" : ""}
      </span>
    </label>
  )
}

type CheckProps = {
  checked: boolean
  onChange: () => void
  label: string
  detail?: string
}

export function CheckCard({ checked, onChange, label, detail }: CheckProps) {
  return (
    <label className={checked ? "choice is-selected" : "choice"}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="choice-body">
        <span className="choice-label">{label}</span>
        {detail ? <span className="choice-detail">{detail}</span> : null}
      </span>
      <span className="choice-mark" aria-hidden="true">
        {checked ? "Yes" : ""}
      </span>
    </label>
  )
}
