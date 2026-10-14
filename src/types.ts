export type Block =
  | { type: "h3"; text: string }
  | { type: "p"; inlines: Inline[] }
  | { type: "ul"; items: Inline[][] }

export type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "em"; text: string }
  | { type: "link"; text: string; href: string }

export type TherapyBlocks = {
  individual: Block[]
  family: Block[]
  parentTraining: Block[]
}

export type SourceRef = {
  name: string
  url: string
  detail: string
}

export type Condition = {
  id: string
  title: string
  summary: string
  group: string
  order: number
  completeness: "full" | "stub"
  statusBadge: string
  reviewer: string
  reviewDate: string
  systems: string[]
  trainingIds: string[]
  overview: Block[]
  keyTreatments: Block[]
  treatmentBurden: Block[]
  adherence: Block[]
  mentalHealthDevelopmental: Block[]
  longTermEffects: Block[]
  redFlags: Block[]
  therapy: TherapyBlocks
  intakeQuestions: string[]
  differentials: string[]
  modifications: string[]
  sources: SourceRef[]
  searchText: string
}

export type PaceId = "ahead" | "typical" | "behind"

export type DomainId = "cognition" | "language" | "perspective" | "socialEmotional"

export type AdaptationId =
  | "concreteness"
  | "visuals"
  | "caregiver"
  | "taskBreakdown"
  | "functionalBehavior"

export type DomainText = Record<DomainId, string>
export type AdaptationText = Record<AdaptationId, string>

export type StageProfile = {
  id: string
  title: string
  ages: string
  summary: string
  intakeQuestions: string[]
  domains: Record<PaceId, DomainText>
  adaptations: Record<PaceId, AdaptationText>
}

export type Training = {
  id: string
  title: string
  hours: number
  hoursLabel: string
  sessions: number | null
  summary: string
  topics: string[]
  link: string
  linkLabel: string
}

export type PracticeChoice = {
  id: string
  label: string
  fit: boolean
  feedback: string
}

export type PracticeQuestion = {
  id: string
  prompt: string
  choices: PracticeChoice[]
}

export type PracticeCase = {
  id: string
  title: string
  vignette: string
  questions: PracticeQuestion[]
  takeaway: string
  related: { label: string; to: string }[]
}

export type IntakeSource = {
  id: string
  label: string
  detail: string
  questions: string[]
  differentials: string[]
  trainingIds: string[]
}

export type IntakeGroup = {
  id: string
  label: string
  sources: IntakeSource[]
}

export type IntakeConcern = {
  id: string
  label: string
  detail: string
  questions: string[]
  differentials: string[]
  modifications: string[]
  trainingIds: string[]
}

export type SiteContent = {
  name: string
  org: string
  banner: string
  bannerDetail: string
  footer: string
  modules: { to: string; index: string; title: string; text: string }[]
}

export type Option = { id: string; label: string; detail?: string }

export type YesNoUnsure = "yes" | "no" | "unsure"
export type AgeBand = "under6" | "6to17" | "18plus"
export type Referrer = "specialty" | "other"

export type ScreenerAnswers = {
  ageBand: AgeBand
  highSchoolCompleted: YesNoUnsure | null
  highHourAba: YesNoUnsure
  path1: string[]
  conditionA: string[]
  developmental: string[]
  chronicMedical: string[]
  communityCanMeet: YesNoUnsure
  referrer: Referrer
}

export type ReasonTone = "met" | "block" | "info" | "caution"

export type Reason = { tone: ReasonTone; text: string }

export type OutcomeId = "eligible" | "not-eligible" | "consult"

export type Routing = {
  preface: string
  title: string
  steps: string[]
  note: string
}

export type ScreenerResult = {
  outcome: OutcomeId
  title: string
  headline: string
  reasons: Reason[]
  routing: Routing | null
  closingNote: string
  conditionIds: string[]
  trainingIds: string[]
}
