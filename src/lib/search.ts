export type SearchHit = {
  id: string
  kind: "Condition" | "Training" | "Development" | "Scope" | "Practice" | "Intake"
  title: string
  snippet: string
  to: string
}

export type SearchDoc = {
  id: string
  kind: SearchHit["kind"]
  title: string
  text: string
  to: string
}

const SYNONYMS: Record<string, string[]> = {
  diabetes: ["t1d", "glucose", "insulin", "dka"],
  t1d: ["diabetes", "insulin"],
  cf: ["cystic", "fibrosis", "modulator"],
  cystic: ["cf"],
  cancer: ["leukemia", "tumor", "oncology", "steroid"],
  leukemia: ["cancer", "all"],
  aba: ["behavior", "functional"],
  bh23: ["referral", "counseling", "eligibility"],
  referral: ["bh23", "eligibility", "screener"],
  adhd: ["attention", "absence"],
  seizure: ["epilepsy", "absence"],
  epilepsy: ["seizure"],
  tic: ["tics", "tourette", "cbit"],
  tics: ["tic", "tourette"],
  feeding: ["arfid", "eating"],
  arfid: ["feeding"],
  pain: ["chronic-pain"],
  autism: ["developmental"],
  gifted: ["ahead", "highly"],
}

function expand(term: string): string[] {
  const extra = SYNONYMS[term] ?? []
  return [term, ...extra]
}

function snippet(text: string, terms: string[]): string {
  const lower = text.toLowerCase()
  let at = -1
  for (const term of terms) {
    at = lower.indexOf(term)
    if (at >= 0) break
  }
  if (at < 0) return text.slice(0, 180).trim()
  const start = Math.max(0, at - 70)
  const end = Math.min(text.length, at + 140)
  const chunk = text.slice(start, end).replace(/\s+/g, " ").trim()
  return `${start > 0 ? "…" : ""}${chunk}${end < text.length ? "…" : ""}`
}

export function searchDocs(docs: readonly SearchDoc[], query: string): SearchHit[] {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1)
  if (!terms.length) return []

  const hits: { hit: SearchHit; score: number }[] = []
  for (const doc of docs) {
    const title = doc.title.toLowerCase()
    const text = doc.text.toLowerCase()
    let score = 0
    let matched = true
    for (const term of terms) {
      const options = expand(term)
      const titleHit = options.some((option) => title.includes(option))
      const bodyHit = options.some((option) => text.includes(option))
      if (!titleHit && !bodyHit) {
        matched = false
        break
      }
      score += titleHit ? 5 : 1
    }
    if (!matched) continue
    hits.push({
      score,
      hit: {
        id: doc.id,
        kind: doc.kind,
        title: doc.title,
        snippet: snippet(doc.text, terms.flatMap(expand)),
        to: doc.to,
      },
    })
  }
  hits.sort((a, b) => b.score - a.score || a.hit.title.localeCompare(b.hit.title))
  return hits.map((item) => item.hit)
}
