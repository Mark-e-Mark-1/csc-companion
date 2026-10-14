import { describe, expect, it } from "vitest"
import { parseBlocks } from "../lib/markdown.ts"
import { buildChecklist } from "../lib/intake.ts"
import { searchDocs } from "../lib/search.ts"
import {
  adaptationLabels,
  cases,
  conditions,
  intakeConcerns,
  sources,
  stages,
  trainings,
  universalQuestions,
} from "./loadContent.ts"
import { buildSearchDocs } from "./searchIndex.ts"

describe("content files", () => {
  it("loads 18 condition cards and keeps the draft badge", () => {
    expect(conditions).toHaveLength(18)
    const full = conditions.filter((condition) => condition.completeness === "full").map((c) => c.id)
    expect(full.sort()).toEqual(["cystic-fibrosis", "pediatric-cancer", "type-1-diabetes"])
    for (const condition of conditions) {
      expect(condition.statusBadge).toBe("Draft - pending medical team review")
      expect(condition.reviewer).toBe("")
      expect(condition.reviewDate).toBe("")
      expect(condition.sources.length).toBeGreaterThan(0)
      for (const source of condition.sources) {
        expect(source.url.startsWith("https://") || source.url.startsWith("http://")).toBe(true)
      }
      for (const trainingId of condition.trainingIds) {
        expect(trainings.some((training) => training.id === trainingId)).toBe(true)
      }
    }
  })

  it("writes the three full cards long enough to use", () => {
    for (const id of ["type-1-diabetes", "cystic-fibrosis", "pediatric-cancer"]) {
      const card = conditions.find((condition) => condition.id === id)
      expect(card?.searchText.length).toBeGreaterThan(2500)
    }
    const cancer = conditions.find((condition) => condition.id === "pediatric-cancer")
    expect(cancer?.searchText).toMatch(/steroid/i)
    expect(cancer?.searchText).toMatch(/leukemia/i)
    expect(cancer?.searchText).toMatch(/brain tumor/i)
    const diabetes = conditions.find((condition) => condition.id === "type-1-diabetes")
    expect(diabetes?.searchText).toMatch(/hypoglycemia/i)
    expect(diabetes?.searchText).toMatch(/hyperglycemia/i)
  })

  it("maps the recorded trainings", () => {
    expect(trainings.map((training) => [training.id, training.hours])).toEqual([
      ["dev-complexity", 12],
      ["aba", 4],
      ["feeding", 8],
      ["chronic-illness", 10],
      ["additional", 25],
    ])
    expect(trainings.find((training) => training.id === "dev-complexity")?.sessions).toBe(10)
    for (const training of trainings) expect(training.link).toBe("")
  })

  it("has four developmental stages and three paces", () => {
    expect(stages.map((stage) => stage.id)).toEqual([
      "infant-toddler",
      "under-6",
      "school-age",
      "adolescent",
    ])
    for (const stage of stages) {
      for (const pace of ["ahead", "typical", "behind"] as const) {
        expect(stage.domains[pace].cognition.length).toBeGreaterThan(40)
        expect(stage.adaptations[pace].functionalBehavior.length).toBeGreaterThan(40)
      }
      expect(stage.adaptations.ahead.concreteness).not.toBe(stage.adaptations.typical.concreteness)
      expect(stage.adaptations.behind.concreteness).not.toBe(stage.adaptations.typical.concreteness)
    }
  })

  it("builds an intake checklist without saving anything", () => {
    const endocrine = sources.find((source) => source.id === "endocrine")
    const diabetes = conditions.find((condition) => condition.id === "type-1-diabetes")
    const school = stages.find((stage) => stage.id === "school-age")
    expect(endocrine && diabetes && school).toBeTruthy()
    if (!endocrine || !diabetes || !school) return
    const list = buildChecklist({
      universal: universalQuestions,
      source: endocrine,
      concern: null,
      condition: diabetes,
      stage: school,
      pace: "behind",
      adaptationLabels: adaptationLabels(),
    })
    const blob = [...list.questions, ...list.differentials, ...list.modifications]
      .map((item) => item.text)
      .join(" ")
    expect(blob).toMatch(/glucose/i)
    expect(blob).toMatch(/hypoglycemia|hyperglycemia/i)
    expect(list.trainingIds).toContain("chronic-illness")
    expect(list.trainingIds).toContain("dev-complexity")
  })

  it("puts absence seizures on the neurology and ADHD differentials", () => {
    const neurology = sources.find((source) => source.id === "neurology")
    const adhd = intakeConcerns.find((concern) => concern.id === "adhd")
    expect(neurology?.differentials.join(" ")).toMatch(/absence/i)
    expect(adhd?.differentials.join(" ")).toMatch(/absence/i)
    expect(adhd?.differentials.join(" ")).toMatch(/medication/i)
  })

  it("searches across cards, scope, and trainings", () => {
    const docs = buildSearchDocs()
    expect(searchDocs(docs, "dexamethasone").some((hit) => hit.title.includes("cancer"))).toBe(true)
    expect(searchDocs(docs, "enzyme").some((hit) => hit.id.includes("cystic"))).toBe(true)
    expect(searchDocs(docs, "BH23").some((hit) => hit.kind === "Scope")).toBe(true)
    expect(searchDocs(docs, "")).toEqual([])
  })

  it("gives each practice question one fitting choice", () => {
    expect(cases).toHaveLength(3)
    for (const item of cases) {
      expect(item.vignette.length).toBeGreaterThan(80)
      for (const question of item.questions) {
        expect(question.choices.filter((choice) => choice.fit)).toHaveLength(1)
      }
    }
  })

  it("parses a small markdown fixture", () => {
    const blocks = parseBlocks("Hello **there**.\n\n- One\n- Two\n\n### Sub\n\nMore.")
    expect(blocks.map((block) => block.type)).toEqual(["p", "ul", "h3", "p"])
  })
})
