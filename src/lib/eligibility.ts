import eligibilityContent from "../../content/eligibility.json"
import type {
  OutcomeId,
  Reason,
  Referrer,
  ScreenerAnswers,
  ScreenerResult,
} from "../types.ts"

const PATH1_LISTED = [
  "tics",
  "encopresis",
  "enuresis",
  "fnd",
  "chronic-pain",
  "chronic-fatigue",
] as const

const DEV_QUALIFYING = ["autism", "gifted", "intellectual-disability"] as const

const PATH1_CARD: Record<string, string> = {
  tics: "tics",
  encopresis: "encopresis",
  enuresis: "enuresis",
  fnd: "fnd",
  "chronic-pain": "chronic-pain",
}

const MEDICAL_CARD: Record<string, string> = {
  "chronic-pain": "chronic-pain",
  sci: "sci",
  seizure: "epilepsy",
  cp: "cp",
  tbi: "tbi",
}

const DEV_CARD: Record<string, string> = {
  autism: "autism-genetic",
}

type Option = { id: string; label: string; detail?: string }

function labels(options: readonly Option[], ids: readonly string[]): string {
  return ids
    .map((id) => options.find((option) => option.id === id)?.label ?? id)
    .join(", ")
}

function has(ids: readonly string[], id: string): boolean {
  return ids.includes(id)
}

function listedPath1(ids: readonly string[]): string[] {
  return ids.filter((id) => (PATH1_LISTED as readonly string[]).includes(id))
}

function qualifyingDev(ids: readonly string[]): string[] {
  return ids.filter((id) => (DEV_QUALIFYING as readonly string[]).includes(id))
}

function selectedMedical(ids: readonly string[]): string[] {
  return ids.filter((id) => id !== "none")
}

function selectedA(ids: readonly string[]): string[] {
  return ids.filter((id) => id !== "none")
}

/**
 * Scope of service, in the order the screener asks it:
 * age window, high-hour exclusion, Path 1, Path 2 (A and B), community exclusion, then BH23 routing.
 * Learning disability alone never satisfies Condition B.
 */
export function evaluate(answers: ScreenerAnswers): ScreenerResult {
  const copy = eligibilityContent
  const reasons: Reason[] = []
  const blockers: string[] = []
  const consults: string[] = []

  const ageFail = answers.ageBand === "18plus" && answers.highSchoolCompleted === "yes"
  const ageUnsure = answers.ageBand === "18plus" && answers.highSchoolCompleted === "unsure"

  if (answers.ageBand === "under6") {
    reasons.push({
      tone: "met",
      text: "Age is inside the window. Birth to 5 years is also under 6, which can meet Condition B.",
    })
  } else if (answers.ageBand === "6to17") {
    reasons.push({
      tone: "met",
      text: "Age is inside the window (6 to 17). High-school completion does not close it before 18.",
    })
  } else if (answers.highSchoolCompleted === "no") {
    reasons.push({
      tone: "met",
      text: "Age is 18 or older and high school is not completed. The window ends at whichever comes last — the 18th birthday or high-school completion — so it is still open.",
    })
  } else if (ageFail) {
    reasons.push({
      tone: "block",
      text: "Age is 18 or older and high school is already completed. That is outside the scope's age window.",
    })
    blockers.push("age")
  } else {
    reasons.push({
      tone: "caution",
      text: "High-school completion is unknown. After the 18th birthday the window stays open only until high school is finished.",
    })
    consults.push("age")
  }

  if (answers.highHourAba === "yes") {
    reasons.push({
      tone: "block",
      text: "The request is for high-hour therapy such as ABA. The scope excludes therapies that require many hours a week.",
    })
    blockers.push("aba")
  } else if (answers.highHourAba === "unsure") {
    reasons.push({
      tone: "caution",
      text: "It is unclear whether the family is asking for a many-hour program. CSC does not provide that intensity. Confirm the request before you route it.",
    })
    consults.push("aba")
  } else {
    reasons.push({
      tone: "met",
      text: "This is not a request for high-hour ABA or a similar many-hour program.",
    })
  }

  const path1Ids = listedPath1(answers.path1)
  const path1 = path1Ids.length > 0
  const path1Other = has(answers.path1, "other")
  if (path1) {
    reasons.push({
      tone: "met",
      text: `Path 1 is met: ${labels(copy.path1Options, path1Ids)}. The scope lists these as medical diagnoses with an evidence base for behavioral treatment. Path 1 can qualify on its own.`,
    })
  } else if (!path1Other) {
    reasons.push({
      tone: "info",
      text: "Path 1 is not met. Tic disorders, encopresis, enuresis, functional neurological disorder, chronic pain disorders, and chronic fatigue were not selected.",
    })
  }
  if (path1Ids.includes("chronic-fatigue")) {
    reasons.push({
      tone: "info",
      text: "Chronic fatigue is on the Path 1 list. A condition card has not been written for it yet.",
    })
  }
  if (path1Other && path1) {
    reasons.push({
      tone: "info",
      text: "An additional medical diagnosis was marked that is not on the example list. This result uses the listed diagnosis. Ask the medical team about the other one.",
    })
  }

  const conditionAIds = selectedA(answers.conditionA)
  const conditionA = conditionAIds.length > 0
  if (conditionA) {
    reasons.push({
      tone: "met",
      text: `Condition A is met: ${labels(copy.conditionAOptions, conditionAIds)}.`,
    })
  } else {
    reasons.push({
      tone: "info",
      text: "Condition A is not met. No mental health or behavioral disorder was selected.",
    })
  }

  const devIds = qualifyingDev(answers.developmental)
  const ld = has(answers.developmental, "learning-disability")
  const otherDev = has(answers.developmental, "other-dev")
  const medicalIds = selectedMedical(answers.chronicMedical)
  const under6 = answers.ageBand === "under6"
  const conditionB = devIds.length > 0 || medicalIds.length > 0 || under6

  if (devIds.length) {
    reasons.push({
      tone: "met",
      text: `Condition B is met by a developmental difference: ${labels(copy.devOptions, devIds)}.`,
    })
  }
  if (medicalIds.length) {
    reasons.push({
      tone: "met",
      text: `Condition B is met by a chronic medical condition: ${labels(copy.medicalOptions, medicalIds)}.`,
    })
  }
  if (under6) {
    reasons.push({
      tone: "met",
      text: "Condition B is met by age. The child is under 6, so a separate developmental or medical condition is not required.",
    })
  }
  if (ld && devIds.length === 0) {
    reasons.push({
      tone: conditionB ? "info" : "block",
      text: "A learning disability alone is not considered a developmental difference.",
    })
  } else if (ld && devIds.length > 0) {
    reasons.push({
      tone: "info",
      text: `A learning disability was also marked. It does not establish Condition B. The qualifying developmental difference is ${labels(copy.devOptions, devIds)}.`,
    })
  }
  if (has(answers.chronicMedical, "other-chronic")) {
    reasons.push({
      tone: "info",
      text: "Another chronic medical condition was marked. The scope's list is examples. Confirm that the condition is chronic and that it is shaping the need for specialty care.",
    })
  }
  if (
    has(answers.chronicMedical, "chronic-pain") &&
    !path1Ids.includes("chronic-pain")
  ) {
    reasons.push({
      tone: "info",
      text: "Chronic pain was marked under Condition B and not under Path 1. Chronic pain disorders can also qualify on Path 1 by themselves. If the referral is for behavioral treatment of the pain disorder, go back and mark Path 1.",
    })
  }

  const otherDevIsOnlyB =
    otherDev && devIds.length === 0 && medicalIds.length === 0 && !under6
  if (otherDev && !otherDevIsOnlyB) {
    reasons.push({
      tone: "info",
      text: "An additional developmental difference was marked outside autism, gifted or highly capable, and intellectual disability. Eligibility here does not depend on it. Confirm the description with CSC so a learning disability is not being counted by mistake.",
    })
  }

  const path2 = conditionA && conditionB
  if (path2) {
    reasons.push({
      tone: "met",
      text: "Path 2 is met. Condition A and Condition B are both present.",
    })
  } else if (path1) {
    reasons.push({
      tone: "info",
      text: "Path 2 is not required. Path 1 already fits.",
    })
  } else if (otherDevIsOnlyB && conditionA) {
    reasons.push({
      tone: "caution",
      text: "A developmental difference was marked that is not autism, gifted or highly capable, or intellectual disability. Learning disability alone does not count. Ask CSC whether this difference meets Condition B before anyone submits a referral.",
    })
    consults.push("other-dev")
  } else {
    reasons.push({
      tone: "block",
      text: "Path 2 is not met. It requires both a mental health or behavioral disorder (Condition A) and a developmental difference, a chronic medical condition, or age under 6 (Condition B).",
    })
  }

  if (!path1 && path1Other && !path2) {
    reasons.push({
      tone: "caution",
      text: "A medical diagnosis was marked that is not on the scope's example list. Path 1 applies when there is an evidence base for behavioral treatment. Ask CSC before treating it as Path 1.",
    })
    consults.push("path1")
  }

  const qualifies = (path1 || path2) && !ageFail
  if (answers.communityCanMeet === "yes") {
    if (path1) {
      reasons.push({
        tone: "caution",
        text: "You marked a Path 1 diagnosis and also marked that traditional community mental health could meet the need. Those point in different directions. Community care usually does not replace specialty behavioral treatment for the listed medical diagnoses. Check with CSC.",
      })
      consults.push("community")
    } else if (path2) {
      reasons.push({
        tone: "block",
        text: "The scope excludes mental health issues that can be appropriately addressed through traditional community mental health services.",
      })
      blockers.push("community")
    } else {
      reasons.push({
        tone: "info",
        text: "Traditional community mental health was marked as appropriate.",
      })
    }
  } else if (answers.communityCanMeet === "unsure") {
    if (qualifies || path1Other || otherDevIsOnlyB) {
      reasons.push({
        tone: "caution",
        text: "It is unclear whether traditional community mental health could meet this need. That judgment changes eligibility.",
      })
      consults.push("community")
    }
  } else if (qualifies) {
    reasons.push({
      tone: "met",
      text: "In your judgment, traditional community mental health would not appropriately meet this need.",
    })
  }

  let outcome: OutcomeId
  if (blockers.length > 0) outcome = "not-eligible"
  else if (path1 || path2) outcome = consults.length > 0 ? "consult" : "eligible"
  else if (
    consults.includes("path1") ||
    consults.includes("other-dev") ||
    consults.includes("age") ||
    consults.includes("aba")
  ) {
    outcome = "consult"
  } else outcome = "not-eligible"

  if (ageUnsure && outcome === "eligible") outcome = "consult"

  const outcomeCopy = copy.outcomes[outcome]
  const conditionIds = relatedConditions(answers, path1Ids, devIds, medicalIds)
  const trainingIds = relatedTrainings(answers, path1Ids, devIds, medicalIds, under6)

  return {
    outcome,
    title: outcomeCopy.title,
    headline: outcomeCopy.headline,
    reasons,
    routing: outcome === "not-eligible" ? null : routingFor(answers.referrer, outcome),
    closingNote: closingFor(outcome, blockers),
    conditionIds,
    trainingIds,
  }
}

function routingFor(referrer: Referrer, outcome: OutcomeId): ScreenerResult["routing"] {
  const block =
    referrer === "specialty"
      ? eligibilityContent.routing.specialty
      : eligibilityContent.routing.other
  return {
    preface:
      outcome === "consult"
        ? eligibilityContent.routing.consultPreface
        : eligibilityContent.routing.eligiblePreface,
    title: block.title,
    steps: [...block.steps],
    note: block.note,
  }
}

function closingFor(outcome: OutcomeId, blockers: string[]): string {
  if (outcome === "eligible") return eligibilityContent.closings.eligible
  if (outcome === "consult") return eligibilityContent.closings.consult
  if (blockers.includes("age")) return eligibilityContent.closings.age
  if (blockers.includes("aba")) return eligibilityContent.closings.aba
  if (blockers.includes("community")) return eligibilityContent.closings.community
  return eligibilityContent.closings.criteria
}

function relatedConditions(
  answers: ScreenerAnswers,
  path1Ids: string[],
  devIds: string[],
  medicalIds: string[],
): string[] {
  const ids = new Set<string>()
  for (const id of path1Ids) {
    const card = PATH1_CARD[id]
    if (card) ids.add(card)
  }
  for (const id of medicalIds) {
    const card = MEDICAL_CARD[id]
    if (card) ids.add(card)
  }
  for (const id of devIds) {
    const card = DEV_CARD[id]
    if (card) ids.add(card)
  }
  if (has(answers.conditionA, "adjustment") && ids.size === 0) {
    /* Adjustment to illness has no single card. Medical cards above cover it when a condition was named. */
  }
  return [...ids]
}

function relatedTrainings(
  answers: ScreenerAnswers,
  path1Ids: string[],
  devIds: string[],
  medicalIds: string[],
  under6: boolean,
): string[] {
  const ids = new Set<string>()
  if (devIds.length > 0 || under6) ids.add("dev-complexity")
  if (has(answers.conditionA, "disruptive") || has(answers.conditionA, "adhd")) {
    ids.add("aba")
  }
  if (
    has(answers.conditionA, "adhd") ||
    path1Ids.includes("tics") ||
    path1Ids.includes("encopresis") ||
    medicalIds.includes("seizure")
  ) {
    ids.add("additional")
  }
  return [...ids]
}

export function optionLabel(options: readonly Option[], id: string): string {
  return options.find((option) => option.id === id)?.label ?? id
}
