import puppeteer from "puppeteer-core"
import { mkdir } from "node:fs/promises"

const base = process.env.CSC_URL ?? "http://127.0.0.1:43123"
const outDir = "/opt/cursor/artifacts"
await mkdir(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
})

const errors = []

async function clickText(page, text) {
  const found = await page.evaluate((needle) => {
    const nodes = [...document.querySelectorAll("button, label, a")]
    const node = nodes.find((el) => (el.innerText || "").includes(needle))
    if (!node) return false
    node.click()
    return true
  }, text)
  if (!found) throw new Error(`Could not click: ${text}`)
  await new Promise((resolve) => setTimeout(resolve, 150))
}

async function prepare(page, width, height) {
  const messages = []
  page.on("pageerror", (error) => messages.push(String(error)))
  page.on("console", (msg) => {
    if (msg.type() === "error") messages.push(msg.text())
  })
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  return messages
}

async function shot(page, name) {
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false })
  console.log("saved", name)
}

const desktop = await browser.newPage()
const desktopErrors = await prepare(desktop, 1280, 900)

await desktop.goto(`${base}/#/screener`, { waitUntil: "networkidle0" })
await clickText(desktop, "Start the screener")
await clickText(desktop, "6 to 17 years")
await clickText(desktop, "Continue")
await clickText(desktop, "No — this is a therapy-hour request")
await clickText(desktop, "Continue")
await clickText(desktop, "Encopresis")
await clickText(desktop, "Continue")
await clickText(desktop, "No mental health or behavioral disorder")
await clickText(desktop, "Continue")
await clickText(desktop, "None of these")
await clickText(desktop, "No chronic medical condition")
await clickText(desktop, "Continue")
await clickText(desktop, "No — this needs CSC's specialty focus")
await clickText(desktop, "Any other provider")
await clickText(desktop, "See the result")
await desktop.waitForSelector(".outcome-eligible")
const eligibleText = await desktop.$eval(".outcome-kicker", (node) => node.textContent)
if (!eligibleText?.includes("Likely eligible")) throw new Error(eligibleText ?? "missing outcome")
await shot(desktop, "screener-desktop")

await desktop.goto(`${base}/#/intake`, { waitUntil: "networkidle0" })
await clickText(desktop, "Endocrine")
await clickText(desktop, "Type 1 diabetes")
await clickText(desktop, "School age")
await clickText(desktop, "Behind")
await desktop.waitForSelector(".checklist")
await desktop.evaluate(() => document.querySelector(".checklist")?.scrollIntoView())
await shot(desktop, "intake-desktop")

await desktop.goto(`${base}/#/development/school-age/behind`, { waitUntil: "networkidle0" })
await desktop.waitForSelector(".domain-grid")
await shot(desktop, "development-desktop")

await desktop.goto(`${base}/#/conditions/type-1-diabetes`, { waitUntil: "networkidle0" })
await desktop.waitForSelector(".badge")
await shot(desktop, "conditions-desktop")

await desktop.goto(`${base}/#/training`, { waitUntil: "networkidle0" })
await desktop.waitForSelector(".card-list")
await shot(desktop, "training-desktop")

await desktop.goto(`${base}/#/practice/afternoon-anger`, { waitUntil: "networkidle0" })
await clickText(desktop, "Ask what the glucose was")
await desktop.waitForSelector(".feedback-fit")
await shot(desktop, "practice-desktop")

const phone = await browser.newPage()
const phoneErrors = await prepare(phone, 390, 844)
await phone.goto(`${base}/#/screener`, { waitUntil: "networkidle0" })
await clickText(phone, "Start the screener")
await clickText(phone, "6 to 17 years")
await clickText(phone, "Continue")
await clickText(phone, "No — this is a therapy-hour request")
await clickText(phone, "Continue")
await clickText(phone, "Encopresis")
await clickText(phone, "Continue")
await clickText(phone, "No mental health or behavioral disorder")
await clickText(phone, "Continue")
await clickText(phone, "None of these")
await clickText(phone, "No chronic medical condition")
await clickText(phone, "Continue")
await clickText(phone, "No — this needs CSC's specialty focus")
await clickText(phone, "Any other provider")
await clickText(phone, "See the result")
await phone.waitForSelector(".outcome-eligible")
await shot(phone, "screener-phone")

await phone.goto(`${base}/#/intake`, { waitUntil: "networkidle0" })
await clickText(phone, "Endocrine")
await clickText(phone, "Type 1 diabetes")
await clickText(phone, "School age")
await clickText(phone, "Needs more support")
await phone.waitForSelector(".checklist")
await phone.evaluate(() => document.querySelector(".checklist")?.scrollIntoView({ block: "start" }))
await shot(phone, "intake-phone")

await phone.goto(`${base}/#/development/adolescent/ahead`, { waitUntil: "networkidle0" })
await shot(phone, "development-phone")

await phone.goto(`${base}/#/conditions/pediatric-cancer`, { waitUntil: "networkidle0" })
await shot(phone, "conditions-phone")

await phone.goto(`${base}/#/training/chronic-illness`, { waitUntil: "networkidle0" })
await shot(phone, "training-phone")

await phone.goto(`${base}/#/practice/bh23-routing`, { waitUntil: "networkidle0" })
await clickText(phone, "MB Specialty referral to CSC")
await phone.waitForSelector(".feedback-fit")
await shot(phone, "practice-phone")

errors.push(...desktopErrors, ...phoneErrors)
await browser.close()
const meaningful = errors.filter((line) => !line.includes("favicon"))
if (meaningful.length) {
  console.error(meaningful.join("\n"))
  process.exit(1)
}
console.log("screenshots ok")
