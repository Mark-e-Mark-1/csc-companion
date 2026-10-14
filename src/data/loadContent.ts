import { parseCondition } from "../lib/parseCondition.ts"
import type {
  Condition,
  IntakeConcern,
  IntakeGroup,
  PracticeCase,
  SiteContent,
  StageProfile,
  Training,
} from "../types.ts"
import casesJson from "../../content/cases.json"
import developmentJson from "../../content/development.json"
import eligibilityJson from "../../content/eligibility.json"
import intakeJson from "../../content/intake.json"
import siteJson from "../../content/site.json"
import trainingsJson from "../../content/trainings.json"

const rawConditions = import.meta.glob("../../content/conditions/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
})

function fileName(path: string): string {
  const parts = path.split("/")
  return parts[parts.length - 1] ?? path
}

export const conditions: Condition[] = Object.entries(rawConditions)
  .filter(([path]) => !fileName(path).startsWith("_"))
  .map(([path, raw]) => {
    if (typeof raw !== "string") throw new Error(`Could not read ${path}`)
    return parseCondition(raw, fileName(path))
  })
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

export const site = siteJson as SiteContent
export const eligibility = eligibilityJson
export const development = developmentJson
export const stages = developmentJson.stages as StageProfile[]
export const trainings = trainingsJson.items as Training[]
export const cases = casesJson.items as PracticeCase[]
export const caseIntro = casesJson.intro
export const intakeGroups = intakeJson.groups as IntakeGroup[]
export const intakeConcerns = intakeJson.concerns as IntakeConcern[]
export const universalQuestions = intakeJson.universal

export const sources = intakeGroups.flatMap((group) =>
  group.sources.map((source) => ({ ...source, group: group.label, groupId: group.id })),
)

export function conditionById(id: string): Condition | undefined {
  return conditions.find((condition) => condition.id === id)
}

export function trainingById(id: string): Training | undefined {
  return trainings.find((training) => training.id === id)
}

export function stageById(id: string): StageProfile | undefined {
  return stages.find((stage) => stage.id === id)
}

export function adaptationLabels(): Record<string, string> {
  return Object.fromEntries(development.adaptations.map((item) => [item.id, item.label]))
}
