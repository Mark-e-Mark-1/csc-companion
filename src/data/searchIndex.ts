import type { SearchDoc } from "../lib/search.ts"
import {
  cases,
  conditions,
  development,
  eligibility,
  intakeConcerns,
  site,
  sources,
  stages,
  trainings,
} from "./loadContent.ts"

export function buildSearchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = []

  docs.push({
    id: "home",
    kind: "Scope",
    title: "Scope of service",
    to: "/screener",
    text: [
      site.banner,
      ...eligibility.intro,
      eligibility.ageHelp,
      eligibility.path1Help,
      eligibility.conditionAHelp,
      eligibility.devHelp,
      eligibility.medicalHelp,
      eligibility.communityHelp,
      eligibility.referrerHelp,
      ...eligibility.routing.specialty.steps,
      ...eligibility.routing.other.steps,
      eligibility.routing.other.note,
    ].join(" "),
  })

  for (const condition of conditions) {
    docs.push({
      id: `condition-${condition.id}`,
      kind: "Condition",
      title: condition.title,
      to: `/conditions/${condition.id}`,
      text: condition.searchText,
    })
  }

  for (const training of trainings) {
    docs.push({
      id: `training-${training.id}`,
      kind: "Training",
      title: training.title,
      to: `/training/${training.id}`,
      text: [training.summary, training.hoursLabel, ...training.topics].join(" "),
    })
  }

  for (const stage of stages) {
    const paces = ["ahead", "typical", "behind"] as const
    const blob = paces
      .flatMap((pace) => [
        ...Object.values(stage.domains[pace]),
        ...Object.values(stage.adaptations[pace]),
      ])
      .join(" ")
    docs.push({
      id: `stage-${stage.id}`,
      kind: "Development",
      title: `${stage.title} development`,
      to: `/development/${stage.id}/typical`,
      text: [stage.summary, stage.ages, blob, development.functionalOverview].join(" "),
    })
  }

  for (const source of sources) {
    docs.push({
      id: `source-${source.id}`,
      kind: "Intake",
      title: `Intake from ${source.label}`,
      to: "/intake",
      text: [source.detail, ...source.questions, ...source.differentials].join(" "),
    })
  }

  for (const concern of intakeConcerns) {
    docs.push({
      id: `concern-${concern.id}`,
      kind: "Intake",
      title: `Intake: ${concern.label}`,
      to: "/intake",
      text: [concern.detail, ...concern.questions, ...concern.differentials, ...concern.modifications].join(" "),
    })
  }

  for (const item of cases) {
    docs.push({
      id: `case-${item.id}`,
      kind: "Practice",
      title: item.title,
      to: `/practice/${item.id}`,
      text: [item.vignette, item.takeaway, ...item.questions.map((question) => question.prompt)].join(" "),
    })
  }

  return docs
}
