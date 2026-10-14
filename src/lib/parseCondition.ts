import { blocksToText, parseBlocks } from "./markdown.ts"
import type { Block, Condition, SourceRef } from "../types.ts"

const REQUIRED = [
  "Overview",
  "Key treatments",
  "Treatment burden",
  "Adherence",
  "Mental health and development",
  "Long-term effects",
  "Red flags",
  "Therapy implications",
  "Intake questions",
  "Differentials",
  "Modifications",
  "Sources",
] as const

const STATUS = "Draft - pending medical team review"

function frontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const text = raw.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n")
  if (!text.startsWith("---\n")) {
    throw new Error("Condition file is missing frontmatter.")
  }
  const end = text.indexOf("\n---\n", 4)
  if (end === -1) throw new Error("Condition frontmatter does not close.")
  const meta: Record<string, string> = {}
  for (const line of text.slice(4, end).split("\n")) {
    if (!line.trim()) continue
    const idx = line.indexOf(":")
    if (idx === -1) throw new Error(`Bad frontmatter line: ${line}`)
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    meta[key] = value
  }
  return { meta, body: text.slice(end + 5) }
}

function sections(body: string): Map<string, string> {
  const map = new Map<string, string>()
  const parts = body.split(/^## /m)
  for (const part of parts) {
    if (!part.trim()) continue
    const breakAt = part.indexOf("\n")
    const title = (breakAt === -1 ? part : part.slice(0, breakAt)).trim()
    const rest = breakAt === -1 ? "" : part.slice(breakAt + 1)
    map.set(title, rest.trim())
  }
  return map
}

function listItems(body: string): string[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter(Boolean)
}

function therapy(body: string, id: string): Condition["therapy"] {
  const chunks = body.split(/^### /m)
  const found = new Map<string, Block[]>()
  for (const chunk of chunks) {
    if (!chunk.trim()) continue
    const breakAt = chunk.indexOf("\n")
    const title = (breakAt === -1 ? chunk : chunk.slice(0, breakAt)).trim()
    const rest = breakAt === -1 ? "" : chunk.slice(breakAt + 1)
    found.set(title, parseBlocks(rest))
  }
  for (const name of ["Individual", "Family", "Parent training"]) {
    if (!found.get(name)?.length) {
      throw new Error(`${id}: therapy section "${name}" is empty.`)
    }
  }
  return {
    individual: found.get("Individual") ?? [],
    family: found.get("Family") ?? [],
    parentTraining: found.get("Parent training") ?? [],
  }
}

function sources(body: string, id: string): SourceRef[] {
  const items = listItems(body)
  if (!items.length) throw new Error(`${id}: add at least one source.`)
  return items.map((item) => {
    const match = item.match(
      /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)\s*(?:[—–-]\s*(.*))?$/,
    )
    if (!match) {
      throw new Error(`${id}: source must be [Name](https://...) — note. Got: ${item}`)
    }
    return {
      name: match[1] ?? "",
      url: match[2] ?? "",
      detail: (match[3] ?? "").trim(),
    }
  })
}

export function parseCondition(raw: string, filename = "condition"): Condition {
  const { meta, body } = frontmatter(raw)
  const id = meta.id ?? ""
  if (!id) throw new Error(`${filename}: id is required.`)
  const map = sections(body)
  for (const title of REQUIRED) {
    if (!map.has(title)) throw new Error(`${id}: missing section "${title}".`)
  }
  if (meta.statusBadge !== STATUS) {
    throw new Error(`${id}: statusBadge must be exactly "${STATUS}".`)
  }
  if (meta.completeness !== "full" && meta.completeness !== "stub") {
    throw new Error(`${id}: completeness must be full or stub.`)
  }
  const overview = parseBlocks(map.get("Overview") ?? "")
  const keyTreatments = parseBlocks(map.get("Key treatments") ?? "")
  const treatmentBurden = parseBlocks(map.get("Treatment burden") ?? "")
  const adherence = parseBlocks(map.get("Adherence") ?? "")
  const mentalHealthDevelopmental = parseBlocks(
    map.get("Mental health and development") ?? "",
  )
  const longTermEffects = parseBlocks(map.get("Long-term effects") ?? "")
  const redFlags = parseBlocks(map.get("Red flags") ?? "")
  const therapyBlocks = therapy(map.get("Therapy implications") ?? "", id)
  const intakeQuestions = listItems(map.get("Intake questions") ?? "")
  const differentials = listItems(map.get("Differentials") ?? "")
  const modifications = listItems(map.get("Modifications") ?? "")
  if (!intakeQuestions.length || !differentials.length || !modifications.length) {
    throw new Error(`${id}: intake questions, differentials, and modifications need items.`)
  }
  const condition: Condition = {
    id,
    title: meta.title ?? id,
    summary: meta.summary ?? "",
    group: meta.group ?? "Other",
    order: Number(meta.order ?? 0),
    completeness: meta.completeness,
    statusBadge: meta.statusBadge,
    reviewer: meta.reviewer ?? "",
    reviewDate: meta.reviewDate ?? "",
    systems: (meta.systems ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
    trainingIds: (meta.trainingIds ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
    overview,
    keyTreatments,
    treatmentBurden,
    adherence,
    mentalHealthDevelopmental,
    longTermEffects,
    redFlags,
    therapy: therapyBlocks,
    intakeQuestions,
    differentials,
    modifications,
    sources: sources(map.get("Sources") ?? "", id),
    searchText: "",
  }
  condition.searchText = [
    condition.title,
    condition.summary,
    condition.group,
    ...condition.systems,
    blocksToText(overview),
    blocksToText(keyTreatments),
    blocksToText(treatmentBurden),
    blocksToText(adherence),
    blocksToText(mentalHealthDevelopmental),
    blocksToText(longTermEffects),
    blocksToText(redFlags),
    blocksToText(therapyBlocks.individual),
    blocksToText(therapyBlocks.family),
    blocksToText(therapyBlocks.parentTraining),
    ...intakeQuestions,
    ...differentials,
    ...modifications,
    ...condition.sources.map((source) => source.name),
  ]
    .join(" ")
    .toLowerCase()
  return condition
}
