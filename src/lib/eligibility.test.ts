import { describe, expect, it } from "vitest"
import eligibilityContent from "../../content/eligibility.json"
import { evaluate } from "./eligibility.ts"
import type { ScreenerAnswers } from "../types.ts"

function answers(patch: Partial<ScreenerAnswers> = {}): ScreenerAnswers {
  return {
    ageBand: "6to17",
    highSchoolCompleted: null,
    highHourAba: "no",
    path1: ["none"],
    conditionA: ["none"],
    developmental: ["none"],
    chronicMedical: ["none"],
    communityCanMeet: "no",
    referrer: "other",
    ...patch,
  }
}

describe("eligibility screener", () => {
  it("keeps the BH23 wording from the scope", () => {
    const specialty = eligibilityContent.routing.specialty.steps.join(" ")
    const other = eligibilityContent.routing.other.steps.join(" ")
    expect(specialty).toContain("MB Specialty referral to CSC")
    expect(other).toContain("Counseling")
    expect(other).toContain(
      "Is this child 0-5 years or 6-17 with developmental complexity.",
    )
  })

  it("qualifies encopresis on Path 1 and routes a pediatrician through Counseling", () => {
    const result = evaluate(answers({ path1: ["encopresis"], referrer: "other" }))
    expect(result.outcome).toBe("eligible")
    expect(result.routing?.steps.join(" ")).toContain("Counseling")
    expect(result.routing?.note).toMatch(/Path 1/i)
    expect(result.conditionIds).toContain("encopresis")
    expect(result.trainingIds).toContain("additional")
  })

  it("routes a specialty clinic provider to the MB Specialty box", () => {
    const result = evaluate(
      answers({ path1: ["encopresis"], referrer: "specialty" }),
    )
    expect(result.outcome).toBe("eligible")
    expect(result.routing?.steps.join(" ")).toContain("MB Specialty referral to CSC")
    expect(result.routing?.steps.join(" ")).not.toContain("Counseling")
  })

  it("treats under 6 plus a behavioral disorder as Path 2", () => {
    const result = evaluate(
      answers({ ageBand: "under6", conditionA: ["anxiety"] }),
    )
    expect(result.outcome).toBe("eligible")
    expect(result.reasons.some((reason) => reason.text.includes("under 6"))).toBe(true)
  })

  it("does not qualify anxiety alone at school age", () => {
    const result = evaluate(answers({ conditionA: ["anxiety"] }))
    expect(result.outcome).toBe("not-eligible")
    expect(result.routing).toBeNull()
  })

  it("does not let a learning disability satisfy Condition B", () => {
    const result = evaluate(
      answers({
        conditionA: ["anxiety"],
        developmental: ["learning-disability"],
      }),
    )
    expect(result.outcome).toBe("not-eligible")
    expect(result.reasons.some((reason) => reason.tone === "block" && /learning disability alone/i.test(reason.text))).toBe(true)
  })

  it("qualifies anxiety plus autism when community care is not enough", () => {
    const result = evaluate(
      answers({
        conditionA: ["anxiety"],
        developmental: ["autism"],
        communityCanMeet: "no",
      }),
    )
    expect(result.outcome).toBe("eligible")
    expect(result.conditionIds).toContain("autism-genetic")
    expect(result.trainingIds).toContain("dev-complexity")
  })

  it("excludes Path 2 when community mental health can meet the need", () => {
    const result = evaluate(
      answers({
        conditionA: ["anxiety"],
        developmental: ["autism"],
        communityCanMeet: "yes",
      }),
    )
    expect(result.outcome).toBe("not-eligible")
    expect(result.closingNote).toMatch(/community/i)
  })

  it("asks for a consult when the community question is unsure", () => {
    const result = evaluate(
      answers({
        conditionA: ["anxiety"],
        developmental: ["autism"],
        communityCanMeet: "unsure",
      }),
    )
    expect(result.outcome).toBe("consult")
    expect(result.routing?.preface).toMatch(/If CSC accepts/i)
  })

  it("closes the age window after 18 once high school is done", () => {
    const result = evaluate(
      answers({
        ageBand: "18plus",
        highSchoolCompleted: "yes",
        path1: ["tics"],
      }),
    )
    expect(result.outcome).toBe("not-eligible")
    expect(result.closingNote).toMatch(/age window/i)
  })

  it("keeps the window open after 18 when high school is not done", () => {
    const result = evaluate(
      answers({
        ageBand: "18plus",
        highSchoolCompleted: "no",
        path1: ["tics"],
      }),
    )
    expect(result.outcome).toBe("eligible")
  })

  it("consults when high-school status is unknown", () => {
    const result = evaluate(
      answers({
        ageBand: "18plus",
        highSchoolCompleted: "unsure",
        path1: ["tics"],
      }),
    )
    expect(result.outcome).toBe("consult")
  })

  it("qualifies ADHD plus gifted", () => {
    const result = evaluate(
      answers({ conditionA: ["adhd"], developmental: ["gifted"] }),
    )
    expect(result.outcome).toBe("eligible")
    expect(result.trainingIds).toEqual(expect.arrayContaining(["dev-complexity", "aba", "additional"]))
  })

  it("does not qualify a chronic medical condition without Condition A or Path 1", () => {
    const result = evaluate(answers({ chronicMedical: ["cp"] }))
    expect(result.outcome).toBe("not-eligible")
  })

  it("qualifies adjustment to illness plus cerebral palsy", () => {
    const result = evaluate(
      answers({ conditionA: ["adjustment"], chronicMedical: ["cp"] }),
    )
    expect(result.outcome).toBe("eligible")
    expect(result.conditionIds).toContain("cp")
  })

  it("excludes high-hour ABA even when Path 2 would otherwise fit", () => {
    const result = evaluate(
      answers({
        highHourAba: "yes",
        conditionA: ["disruptive"],
        developmental: ["autism"],
      }),
    )
    expect(result.outcome).toBe("not-eligible")
    expect(result.closingNote).toMatch(/ABA/i)
  })

  it("consults when ABA intensity is unclear and the paths otherwise fit", () => {
    const result = evaluate(
      answers({
        highHourAba: "unsure",
        conditionA: ["anxiety"],
        developmental: ["autism"],
      }),
    )
    expect(result.outcome).toBe("consult")
  })

  it("qualifies chronic pain on Path 1 alone", () => {
    const result = evaluate(answers({ path1: ["chronic-pain"] }))
    expect(result.outcome).toBe("eligible")
    expect(result.conditionIds).toContain("chronic-pain")
  })

  it("consults for an unlisted medical diagnosis that has no other path", () => {
    const result = evaluate(answers({ path1: ["other"] }))
    expect(result.outcome).toBe("consult")
  })

  it("does not downgrade a clean Path 2 when an extra unlisted diagnosis is also marked", () => {
    const result = evaluate(
      answers({
        path1: ["other"],
        conditionA: ["anxiety"],
        developmental: ["autism"],
      }),
    )
    expect(result.outcome).toBe("eligible")
  })

  it("consults when Path 1 conflicts with a community-care answer", () => {
    const result = evaluate(
      answers({ path1: ["fnd"], communityCanMeet: "yes" }),
    )
    expect(result.outcome).toBe("consult")
  })

  it("does not qualify a young child with no disorder and no Path 1 diagnosis", () => {
    const result = evaluate(answers({ ageBand: "under6" }))
    expect(result.outcome).toBe("not-eligible")
  })

  it("names autism, not the learning disability, when both are marked", () => {
    const result = evaluate(
      answers({
        conditionA: ["anxiety"],
        developmental: ["learning-disability", "autism"],
      }),
    )
    expect(result.outcome).toBe("eligible")
    const joined = result.reasons.map((reason) => reason.text).join(" ")
    expect(joined).toMatch(/does not establish Condition B/i)
    expect(joined).toMatch(/Autism/)
  })

  it("reports both paths when both match", () => {
    const result = evaluate(
      answers({
        path1: ["tics"],
        conditionA: ["anxiety"],
        developmental: ["autism"],
      }),
    )
    expect(result.outcome).toBe("eligible")
    const joined = result.reasons.map((reason) => reason.text).join(" ")
    expect(joined).toMatch(/Path 1 is met/)
    expect(joined).toMatch(/Path 2 is met/)
  })

  it("lets age under 6 carry Condition B even if a learning disability is also marked", () => {
    const result = evaluate(
      answers({
        ageBand: "under6",
        conditionA: ["anxiety"],
        developmental: ["learning-disability"],
      }),
    )
    expect(result.outcome).toBe("eligible")
  })

  it("still excludes under-6 anxiety when community care is appropriate", () => {
    const result = evaluate(
      answers({
        ageBand: "under6",
        conditionA: ["anxiety"],
        communityCanMeet: "yes",
      }),
    )
    expect(result.outcome).toBe("not-eligible")
  })

  it("counts another chronic condition as Condition B", () => {
    const result = evaluate(
      answers({
        conditionA: ["depression"],
        chronicMedical: ["other-chronic"],
      }),
    )
    expect(result.outcome).toBe("eligible")
    expect(result.reasons.some((reason) => /examples/i.test(reason.text))).toBe(true)
  })

  it("consults when an unnamed developmental difference is the only Condition B", () => {
    const result = evaluate(
      answers({
        conditionA: ["anxiety"],
        developmental: ["other-dev"],
      }),
    )
    expect(result.outcome).toBe("consult")
  })

  it("qualifies trauma plus traumatic brain injury", () => {
    const result = evaluate(
      answers({ conditionA: ["trauma"], chronicMedical: ["tbi"] }),
    )
    expect(result.outcome).toBe("eligible")
    expect(result.conditionIds).toContain("tbi")
  })

  it("keeps both hard stops visible when age and ABA both fail", () => {
    const result = evaluate(
      answers({
        ageBand: "18plus",
        highSchoolCompleted: "yes",
        highHourAba: "yes",
        path1: ["encopresis"],
      }),
    )
    expect(result.outcome).toBe("not-eligible")
    const joined = result.reasons.map((reason) => reason.text).join(" ")
    expect(joined).toMatch(/age window/i)
    expect(joined).toMatch(/many hours a week/i)
  })
})
