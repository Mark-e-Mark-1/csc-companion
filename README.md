# CSC Clinical Companion

A browser reference for Master's-level therapists and interns in Children's Specialty Care. It walks the scope of service, builds an intake checklist, shows how to adapt care by developmental level, and holds condition cards for the illnesses CSC sits beside.

It is a reference tool. It is not a medical record, not a referral form, and not a place to type patient information. There is no account and no server-side storage. The only thing written to this device is the text-size preference.

Diabetes, cystic fibrosis, and pediatric cancer are fully drafted. Every other condition card is a stub with the same sections. Every card is marked **Draft - pending medical team review** until a reviewer and a review date are filled in.

## Run it on your computer

You need Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open http://127.0.0.1:43123 . The app uses hash addresses (`/#/screener`), so it works from a simple file host.

```bash
npm test
npm run build
npm run preview
```

`npm run build` writes a static site into `dist/`. Upload that folder to any static host. The installed app (Add to Home Screen) can open again offline after the first visit. That is the PWA. It still must not be used to store patient information.

## Open it with no server

```bash
npm run zip:offline
```

That creates `release/CSC-Companion.zip`. Unzip it and double-click `index.html`. Leave `index.html` and `HOW-TO-OPEN.txt` in the same folder. Do not rename the HTML file. Clinical text is already inside that file, so editing the zip does not change the wording. Edit the project, then rebuild the zip.

## Edit the clinical content

Content lives in the `content/` folder. Change the words, save, and refresh the dev server. Rebuild (`npm run build` or `npm run zip:offline`) before you hand someone a `dist/` folder or a zip.

Do not put patient stories, names, or record numbers in these files.

### Condition cards

One Markdown file per condition, in `content/conditions/`. Copy `_template.md` to a new file that does not start with `_` (files that start with `_` are hidden from the app).

The top of the file, between the `---` lines, is the label block:

| Field | What to put |
| --- | --- |
| `id` | A short name with hyphens, like `sickle-cell`. Do not change an existing id. Links and the screener depend on it. |
| `title` | The name clinicians see. |
| `summary` | One sentence for the list. |
| `group` | The heading on the condition list, such as `Neurology`. |
| `order` | A number. Lower numbers appear first. |
| `completeness` | `full` or `stub`. |
| `statusBadge` | Leave this exact sentence: `Draft - pending medical team review` |
| `reviewer` | The person's name after medical review, or leave it empty. |
| `reviewDate` | A date such as `2026-11-02`, or leave it empty. Empty shows as "Not set". |
| `systems` | Specialties, separated by commas. |
| `trainingIds` | Ids from the training file, separated by commas. Use `dev-complexity`, `aba`, `feeding`, `chronic-illness`, or `additional`. Leave blank if none fit. |

Below that, keep these headings. The app will not load the card if one is missing or renamed:

- Overview
- Key treatments
- Treatment burden
- Adherence
- Mental health and development
- Long-term effects
- Red flags
- Therapy implications, with three subheadings: Individual, Family, and Parent training
- Intake questions
- Differentials
- Modifications
- Sources

Write paragraphs as normal text with a blank line between them. A list is lines that start with `- `. Bold is `**like this**`. A link is `[Name](https://example.org/)`.

Sources must look like this, including the https address:

```
- [Organization — page name](https://example.org/page) — One sentence on why a therapist would open it.
```

Intake questions, differentials, and modifications are lists. Those lines show up on the intake checklist when someone picks this condition.

### Developmental lens

`content/development.json` holds the four stages (infant and toddler, under 6, school age, adolescent) and the three paces (ahead, typical, behind).

Each stage has:

- `domains` — cognition, language, perspective, socialEmotional
- `adaptations` — concreteness, visuals, caregiver, taskBreakdown, functionalBehavior

Change the sentences. Do not rename the ids (`infant-toddler`, `under-6`, `school-age`, `adolescent`, `ahead`, `typical`, `behind`). The Ahead / Typical / Behind control and the intake checklist read those ids.

### Eligibility wording

`content/eligibility.json` holds the questions, the help text, and the BH23 sentences. You can edit labels and explanations.

Do not change an option `id` (for example `encopresis`, `under6`, `learning-disability`) unless a developer also changes `src/lib/eligibility.ts` and the tests. The yes / no / consult decision lives in that code file so it can be tested. The scope rules it implements:

- Age runs through 18 or through the end of high school, whichever is later.
- Path 1 is a listed medical diagnosis with an evidence-based behavioral treatment.
- Path 2 is a mental health or behavioral disorder plus a developmental difference, a chronic medical condition, or age under 6.
- High-hour ABA is excluded. So are needs that traditional community mental health can meet.
- A learning disability alone is not a developmental difference.
- Specialty clinic providers use the BH23 “MB Specialty referral to CSC” box. Everyone else uses the “Counseling” box and answers Yes to the supplemental question.

### Intake prompts

`content/intake.json` holds questions that depend on who referred the child (specialty clinics, OT, speech, PT, audiology, pediatrician) and on behavioral concerns that do not have their own card yet, such as ADHD. Lists are added to the printable checklist. Condition-specific lines come from the condition card, not from this file.

### Trainings

`content/trainings.json` maps the five recorded sets. Hours are filled in. `link` is empty on purpose. When you have the recording URL, paste it into `link` for that id. Cards and checklist items that name the id will point at it. Do not invent a URL.

### Practice cases

`content/cases.json` holds three fictional vignettes. Each question needs exactly one choice with `"fit": true`. Feedback is what the intern reads after they choose. These cases are teaching material, not real patients.

## What the app refuses to store

There is no free-text box except search, and search is not written to disk. Screener answers and intake selections live in the browser tab until you refresh or leave. The banner at the top is not dismissible. Do not type names, dates of birth, or record numbers into search.

The text-size control stores only `{ "textSize": "default" }` or `{ "textSize": "large" }` under the key `csc-ui-prefs`.
