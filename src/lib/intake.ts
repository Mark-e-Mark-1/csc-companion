import type { Condition, IntakeConcern, IntakeSource, PaceId, StageProfile } from "../types.ts"

export type ChecklistItem = {
  id: string
  text: string
  trainingIds: string[]
}

export type Checklist = {
  questions: ChecklistItem[]
  differentials: ChecklistItem[]
  modifications: ChecklistItem[]
  trainingIds: string[]
}

const ADAPTATION_TRAINING: Record<string, string[]> = {
  concreteness: ["dev-complexity"],
  visuals: ["dev-complexity"],
  caregiver: ["dev-complexity"],
  taskBreakdown: ["dev-complexity"],
  functionalBehavior: ["aba"],
}

let itemCount = 0

function add(
  bucket: ChecklistItem[],
  seen: Set<string>,
  text: string,
  trainingIds: string[],
) {
  const key = text.trim().toLowerCase()
  if (!key || seen.has(key)) return
  seen.add(key)
  itemCount += 1
  bucket.push({ id: `item-${itemCount}`, text: text.trim(), trainingIds })
}

export function buildChecklist(input: {
  universal: string[]
  source: IntakeSource
  concern: IntakeConcern | null
  condition: Condition | null
  stage: StageProfile
  pace: PaceId
  adaptationLabels: Record<string, string>
}): Checklist {
  itemCount = 0
  const seenQ = new Set<string>()
  const seenD = new Set<string>()
  const seenM = new Set<string>()
  const questions: ChecklistItem[] = []
  const differentials: ChecklistItem[] = []
  const modifications: ChecklistItem[] = []

  for (const text of input.universal) add(questions, seenQ, text, [])
  for (const text of input.source.questions) {
    add(questions, seenQ, text, input.source.trainingIds)
  }
  for (const text of input.source.differentials) {
    add(differentials, seenD, text, input.source.trainingIds)
  }
  for (const text of input.stage.intakeQuestions) {
    add(questions, seenQ, text, ["dev-complexity"])
  }

  const conditionTrainings = input.condition?.trainingIds ?? []
  const concernTrainings = input.concern?.trainingIds ?? []
  if (input.condition) {
    for (const text of input.condition.intakeQuestions) {
      add(questions, seenQ, text, conditionTrainings)
    }
    for (const text of input.condition.differentials) {
      add(differentials, seenD, text, conditionTrainings)
    }
    for (const text of input.condition.modifications) {
      add(modifications, seenM, text, conditionTrainings)
    }
  }
  if (input.concern) {
    for (const text of input.concern.questions) add(questions, seenQ, text, concernTrainings)
    for (const text of input.concern.differentials) {
      add(differentials, seenD, text, concernTrainings)
    }
    for (const text of input.concern.modifications) {
      add(modifications, seenM, text, concernTrainings)
    }
  }

  const adaptations = input.stage.adaptations[input.pace]
  for (const key of Object.keys(adaptations)) {
    const label = input.adaptationLabels[key] ?? key
    const text = adaptations[key as keyof typeof adaptations]
    add(modifications, seenM, `${label}: ${text}`, ADAPTATION_TRAINING[key] ?? ["dev-complexity"])
  }

  const trainingIds = [
    ...new Set(
      [...questions, ...differentials, ...modifications].flatMap((item) => item.trainingIds),
    ),
  ]

  return { questions, differentials, modifications, trainingIds }
}
