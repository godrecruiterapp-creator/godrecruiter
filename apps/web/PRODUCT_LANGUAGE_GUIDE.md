# God Recruiter — Product Language Guide

**Approved 2026-07-02.** This is the single source of truth for every word used in the God Recruiter UI — pages, buttons, tables, filters, statuses, AI features, notifications, empty states, and validation copy. Every new page, feature, and prompt must conform to this document before it ships. It is the language equivalent of [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — that file governs how things look, this one governs what they're called.

Scope note: this guide is language-only. It does not propose layout, IA, or visual changes — only wording, and only where wording is inconsistent, unclear, or jargon-heavy.

---

## 1. Complete Language Audit — What Was Reviewed

Every route under `apps/web/src/app/dashboard/**` (Dashboard, Candidates, Jobs, Interviews, Placements, Projects, Reports, Work Queue, AI Agent Hub, Automation, Settings) and shared components in `apps/web/src/components/**` were reviewed for:

- Page titles, section headers, breadcrumbs, tab labels
- Entity names and field labels across forms and detail views
- Table column headers
- Button, menu, and dialog action text
- Status values, badges, and filter labels/options
- AI feature naming
- Dashboard widget titles
- Empty states, tooltips, validation messages, and notifications

**Headline finding:** God Recruiter's core entity vocabulary (Candidate, Job, Placement, Note, Resume) is already **~95% consistent** — a strong foundation. The real damage is concentrated in three places:

1. **Action verbs on creation buttons** (Add / Create / New / Post / Build used interchangeably for the same kind of action)
2. **Pipeline/status values**, where the candidate journey is defined **three different ways** in three different places
3. **AI feature names**, where the same feature (candidate-to-job matching) has three names

Everything else — Delete/Archive/Remove, Note vs Comment, Resume vs CV, Recruiter vs User — is in good shape and just needs to be locked down so it stays that way.

---

## 2. Every Inconsistency Found, Ranked by Severity

### 🔴 Critical — breaks the user's mental model

**#1 — Three different candidate pipelines exist at once.**
- Candidates/Jobs modules use: `Sourced → Qualified → Submitted → Interview → Offer → Started` (`candidate-detail-client.tsx:57`, `job-detail-client.tsx:57`)
- Projects Kanban uses: `New → Reviewed → Contacted → Interested → Submitted → Interview → Offer → Placed → Future → Rejected` (`projects/_data.ts:69`)
- Settings → Recruitment's configurable defaults use: `New → Screening → Shortlisted → Submitted to Client → Interview Scheduled → Interviewed → Offered → Placed → Rejected → Withdrawn` (`settings/recruitment/page.tsx:65`)

A recruiter moving from the Candidates tab to a Project board to Settings sees three unrelated vocabularies for the same journey. **Fix:** adopt the single canonical pipeline in §9 everywhere; treat Settings' custom-stage feature as a *rename layer* over the canonical stages, not a competing list.

**#2 — Creation-button verb is different for almost every entity.**
`Add Candidate`, `Create Agent`, `Create Dashboard` / `New Dashboard` (same entity, two verbs), `Post Job` / `Post a Job` (same entity, two phrasings), `New Automation`, `Build My Dashboard`. This is exactly the "never mix Create/New/Add/Launch" problem called out in the brief. **Fix:** one verb per entity type, see §6.

**#3 — The same AI feature has three names.**
Candidate-to-job matching is called `AI Match` (`candidates-table.tsx:353`), `AI Candidate Match` (`candidate-detail-client.tsx:296`), and `AI Candidate Matching` (`automation/templates/page.tsx:43`). **Fix:** standardize on `AI Match` everywhere (see §13).

### 🟠 High — causes hesitation or support questions

**#4 — "Client" vs "Company" names three different things.**
`Client` = the hiring company the agency is staffing for (Jobs module). `Company` = the candidate's current employer (`Current Company` field, `candidates/new/page.tsx:733`). `Company` = God Recruiter's own tenant org (`Company Profile`, `settings/organization/page.tsx:46`). Same word, three referents. **Fix:** keep `Client` for the hiring company, `Current Employer` for the candidate's employer field (renamed from "Current Company"), and `Organization` for tenant/account settings. See §3.

**#5 — "Hiring Manager" and "Client Contact" overlap without a defined relationship.**
Job forms have both a `Hiring Manager` field and a `Client Contact` role — it's not clear from the UI whether these are the same person or different roles. **Fix:** keep both, but the dictionary now defines them explicitly (§3) so future copy doesn't invent a third term ("POC", "Point of Contact").

**#6 — "Owner" collides with "Recruiter."**
Projects and Agents use `Owner` for who created/controls that project or agent (`my-agents/page.tsx:53`). Candidates/Jobs use `Assigned Recruiter` / `Recruiter`. A recruiter reading "Owner" on an agent card and "Recruiter" on a candidate row has to infer these aren't the same relationship. **Fix:** `Owner` is retained only for non-recruiting objects a user configures (agents, automations, dashboards, projects). `Recruiter` / `Assigned Recruiter` is retained only for candidates and jobs. Never use `Owner` for a candidate or job.

**#7 — "Activity" vs "History" vs "Updates" — three log-like words, no defined boundary.**
Dashboard has an "Updates" widget (tabs: My Updates / Team / AI / Automation). Automation and Agents each have a separate "Activity" page AND a separate "History" page. Candidate/Job/Interview detail views have "Activity Log" tabs. **Fix:** see §14 — each term gets exactly one job.

**#8 — "View Profile" vs "Full Profile."**
Both appear in the candidate context for what appears to be the same destination (`candidates/new/page.tsx:328` vs `:344`). **Fix:** standardize to `View Profile`.

**#9 — "Duplicate" vs "Copy" for the same action** across Manage/Agents/Automation menus. **Fix:** standardize to `Duplicate` (majority usage).

### 🟡 Medium — inconsistent but low ambiguity

**#10 — "Applicant" and "Talent" leak into an otherwise-consistent "Candidate" vocabulary.**
`Applicants` (dashboard KPI label), `New Applicant` (automation trigger event name), `Talent Pool` (project type), `Top Talent` (tag). None of these are wrong in isolation, but they re-introduce words the rest of the app deliberately avoids. **Fix:** rename KPI label and automation event to `Candidates` / `New Candidate`; keep `Talent Pool` only as a project-type name (it's a recognized staffing term for a holding list, not a synonym for "candidate").

**#11 — "Location" has four names for three different fields**: `Current Location` (candidate), `Preferred Location` (candidate), `Work Location` (job), plain `Location` (reports/tables). These are legitimately different fields — the fix is not to merge them but to make sure every table/report column referencing one of them uses its full qualified name instead of the ambiguous bare `Location` (see §7).

**#12 — "Post Job" (button) vs "Post a Job" (page title)** — same action, article added inconsistently. **Fix:** drop the article everywhere: `Post Job`.

**#13 — Status badge lists (Interview, Agent, Project, Job) are each independently re-defined in 3–4 files** with identical wording but copy-pasted color maps. Not a wording bug today, but it's exactly how wording drift like #1 starts — a future edit to one copy won't propagate. **Recommendation (light-touch, not a redesign ask):** when engineering next touches any of these files, extract one shared status-label map per entity so the words in §9 have one owner in code, not four.

### 🟢 Low — gaps, not conflicts

**#14 — No hardcoded toast/notification copy exists yet.** Nothing to fix, but §10 sets the pattern before more get written ad hoc.

**#15 — No centralized validation message copy exists yet.** Same — §11 sets the pattern proactively.

**#16 — Tooltips are essentially unused** (only sidebar nav tooltips exist, and those show the label, not a "why"). Not wrong, just an open opportunity — §12 has the standard ready for when they're added.

---

## 3. Product Dictionary

The single source of truth for entity and role names. If a term isn't in the "Approved Term" column, don't introduce it — extend this table first.

| Category | Approved Term | Never Use | Notes |
|---|---|---|---|
| Candidate | **Candidate** | Applicant, Talent, Resource | "Talent Pool" survives only as a project-type name |
| Job | **Job** | Position, Requisition, Req, Opening | |
| Hiring company | **Client** | Client Company, Employer, Customer | The company the agency is staffing for |
| Candidate's employer | **Current Employer** | Current Company | Renamed to stop colliding with "Client"/"Company" |
| Own account/tenant | **Organization** | Company (when referring to God Recruiter's own tenant) | Used only in Settings |
| Client-side contact (general) | **Contact** | Client Contact*, POC | *"Client Contact" retained only as a role label within a job's contact list, not as a generic term |
| Client-side hiring decision-maker | **Hiring Manager** | Manager, HM | |
| Recruiting staff member | **Recruiter** | User (except system/login context), Owner (for candidates/jobs) | |
| Creator/controller of a config object (agent, automation, dashboard, project) | **Owner** | Recruiter | Only for non-candidate/job objects |
| Successful hire, ongoing assignment | **Placement** | Hire, Join | "Hire" survives only inside feedback scores ("Strong Hire") |
| Pipeline stage: offer extended | **Offer** | — | Pipeline stage only, not the entity |
| Candidate sent to client | **Submission** | Presentation | |
| Client-specific work initiative / talent pool | **Project** | Assignment (entity) | "Assignment" retained only for work-queue job-to-recruiter allocation |
| Recruiter's allocated workload item | **Assignment** | Project | Work Queue context only |
| Internal written note | **Note** | Comment, Remark | |
| Candidate resume file | **Resume** | CV | |
| Recruiter to-do item | **Task** | Activity, To-do | |
| Historical audit trail on an entity | **Activity** | History, Updates, Timeline | See §14 for full disambiguation |
| Where a candidate came from | **Source** | Lead Source, Origin | "Candidate Source" only inside Reports, as a qualifier |
| Contact number | **Phone** | Mobile | "Mobile" reserved for device/app context only |
| Candidate's location field | **Current Location** | Location (bare, in candidate context) | |
| Candidate's preferred work location | **Preferred Location** | — | |
| Job's location field | **Work Location** | Location (bare, in job context) | |
| Permanent removal of a record | **Delete** | Remove (for records) | Irreversible |
| Soft removal, reversible | **Archive** | — | Reversible, per ADR R8 30-day recycle bin |
| Take an item out of a list/collection without deleting it | **Remove** | Delete (for list membership) | e.g. "Remove from Project" |
| Interview | **Interview** | Meeting, Call (as an entity name) | "Call" still fine as an action button |

---

## 4. Field Naming Standards

- One field, one label, everywhere it appears (form, detail view, table column, report, filter). If a field is called `Assigned Recruiter` on the Candidate form, it is `Assigned Recruiter` in the table column, the filter, and the report — never shortened to `Recruiter` in one place and left long in another *for the same field*. (Bare `Recruiter` is fine as a column header only when space is constrained AND the page has no ambiguity — e.g., a Jobs table that only ever shows the assigned recruiter.)
- Qualify ambiguous fields with their entity when two entities share a concept: `Current Location` (candidate) vs `Work Location` (job) vs `Preferred Location` (candidate) — never bare `Location` outside of a context where only one entity is on screen.
- Field labels are Title Case, no trailing colons, no abbreviations (`Work Authorization`, not `Work Auth`; `Number of Openings`, not `# of Openings` — the `#` shorthand is fine only in dense tables, not on forms).
- Boolean/preference fields read as a question or a state, not a fragment: `Willing to Relocate`, not `Relocate?`.

## 5. Table Column Standards

- Column header = the field's approved name from §3/§4, full form, unless width truly forces an abbreviation (document any abbreviation once, in this file, don't invent a new short form per table).
- The same concept never has two headers across tables: `Candidate` (not `Candidate Name` in one table and `Talent` in another). Reserve `Candidate Name` only where a table also has a separate `Candidate ID` column and needs to disambiguate.
- Status/stage columns always use the exact labels from §9 — never a paraphrase ("In Progress" vs "Processing" for the same state).

## 6. Button Naming Standards

**One verb per entity type — never mix within the same entity:**

| Entity | Approved verb | Example |
|---|---|---|
| Candidate | **Add** | Add Candidate |
| Job | **Post** | Post Job *(industry-standard term recruiters already use; kept as the one deliberate exception to "Add")* |
| Company / Contact / Note / Task | **Add** | Add Contact, Add Note, Add Task |
| Agent / Automation / Dashboard / Project / Report | **Create** | Create Agent, Create Automation, Create Dashboard, Create Project, Create Report |

Kill on sight: `New Candidate`, `New Dashboard`, `Build My Dashboard`, `Launch`, `Initiate`, `Execute`, `Start` as creation verbs (`Start` is reserved for actually starting a run/process, e.g. `Start My Day`, `Run Now`).

**Other standard actions**, always the same word for the same action everywhere:
- Save (never "Update" as a button label) — `Save`, `Save Draft`, `Save Changes` are the only "Save" variants; don't invent `Save & Continue` etc. without adding it here first.
- Cancel / Back / Next — wizard and dialog navigation, never "Close" for a wizard step (Close is for dismissing a whole modal without saving).
- Delete / Archive / Remove — per the definitions in §3. Never label a delete action "Remove" and vice versa.
- View Profile (not "Full Profile")
- Duplicate (not "Copy")
- Submit / Send / Call / Email / Text — candidate/client outreach actions, unchanged, already consistent.
- Run / Pause / Resume — agent and automation execution controls, unchanged, already consistent.

## 7. Page Naming Standards

- Top-level nav pages: plural noun, no qualifier — `Jobs`, `Candidates`, `Interviews`, `Placements`, `Projects`, `Reports`, `Settings`, `Work Queue`.
- Creation pages: `[Verb] [Entity]` per §6, no article — `Post Job` (not "Post a Job"), `Add Candidate`.
- Detail pages: the entity's own name/title as the page heading (candidate's name, job title) — no suffix like "Details," "Profile," or "Overview" needed in the heading itself; use breadcrumbs for hierarchy.
- Nested settings pages: `[Module] Settings` consistently — `Interview Settings`, `Agent Settings` (currently missing an explicit title — add it), `Automation Settings`.
- Sub-list pages under a module use `[Scope] [Entity]`: `My Interviews`, `All Interviews`, `My Projects`, `My Agents`, `My Automations` — the `My` prefix always means "assigned to or created by the current user," never anything else.

## 8. Filter Standards

- A filter's label must exactly match the field name it filters (per §4). If the field is `Work Authorization`, the filter is `Work Authorization`, not `Status` or `Work Auth`.
- Filter option values use the same display labels as the corresponding status/badge (§9) — never a shorter or reworded version for the filter dropdown than what the badge shows.
- Preserve the current internal key → display label separation (e.g. `on_hold` → `On Hold`) — that pattern is correct and already consistent; just make sure the display label always matches §9.

## 9. Status Standards — The One Canonical Candidate Pipeline

Replace all three competing pipelines (see Inconsistency #1) with this single list everywhere a candidate's stage is shown — Candidates module, Jobs module, Projects Kanban, and Settings' configurable defaults:

**New → Reviewing → Submitted → Interview Scheduled → Interview Completed → Offer Sent → Offer Accepted → Placed → Rejected → Archived**

Settings' "customize your stages" feature is allowed to *rename* these ten stages for a tenant's own vocabulary, but the underlying stage *count and order* stay fixed so reporting and automations keep working. Do not let Settings define a stage list with a different number or order of steps than this canonical one.

**Other status lists** (already consistent, keep as-is, just stop redefining them file-by-file per Inconsistency #13):
- Job status: `Open · On Hold · Filled · Closed`
- Placement status: `Active · Starting Today · Starting Soon · Ending Soon · Completed · Needs Attention`
- Interview status: `Scheduled · Confirmed · Completed · Rescheduled · Cancelled · No Show`
- Agent/Automation run status: `Running · Scheduled · Paused · Completed · Failed`
- Work Queue status: `Needs Assignment · Assigned · In Progress · No Activity · Completed · Overdue`

## 10. Notification (Toast) Standards

No hardcoded toast copy exists yet in the codebase — set the pattern now, before more get written ad hoc:

**Success:** `[Entity] [past-tense verb] successfully.` — e.g. `Candidate added successfully.` `Job saved successfully.` `Interview scheduled successfully.` Always past tense, always ends in "successfully," never an exclamation point.

**Error:** `We couldn't [verb] [entity]. [One-sentence reason or next step].` — e.g. `We couldn't save this candidate. Check the required fields and try again.` Never expose a raw error code, stack trace, or HTTP status to the user.

## 11. Validation Message Standards

No hardcoded validation copy exists yet — set the pattern proactively:

- State the fix, not the rule: `Enter a valid email address.` not `Invalid input.` / not `email must match regex...`.
- Required-field message: `[Field name] is required.` — e.g. `Job Title is required.`
- Never use technical terms (`regex`, `enum`, `null`, `constraint`) in user-facing validation text.
- Keep to one sentence.

## 12. Empty State Standards

Every empty state = **title + one-line description + a clear action button** (already the pattern in the automations/candidate-submissions empty states — keep it). Consolidate the "nothing to do" wording, which currently has three near-duplicate phrasings (`All clear here!`, `All clear!`, `Nothing needs attention right now.`) into one:

**Standard "all done" empty state:** Title `All clear!` — Description `Nothing needs your attention right now.`

**Standard "no data yet" empty state:** Title `No [entities] yet` — Description `[Entities] will appear here once you [trigger action].` — Button: the module's approved creation verb from §6.

## 13. AI Naming Standards

Pattern: **`AI [Noun]`** for every feature/section name. Never `AI-powered [noun]`, `Auto AI [noun]`, `[Verb] with AI` as a *feature name* (those phrasings are fine only inside a button's own CTA text, e.g. `Extract with AI` as a button label is acceptable, but the feature it triggers is still named `AI Extract` in menus/headers).

**Consolidate duplicate names found in the audit:**
- Candidate-to-job matching → **AI Match** (drop `AI Candidate Match` and `AI Candidate Matching`)
- Candidate summary → **AI Candidate Summary** (drop `Auto AI Candidate Summary`)

**Full approved AI feature list** (already consistent, keep as-is): AI Match · AI Candidate Summary · AI Insights · AI Suggestions · AI Interview Questions · AI Interview Brief · AI Feedback Summary · AI Hiring Recommendation · AI Email Generator · AI No-Show Prediction · AI Best Interview Time · AI Sentiment Analysis · AI Follow-up Suggestions · AI Assistant (generic) · AI Credits (usage/billing term only).

## 14. Dashboard & Log Naming Standards

Three words currently compete for "things that happened" — each now has exactly one job:

- **Updates** — the Dashboard's "Recent Updates" feed widget only (My Updates / Team / AI / Automation tabs). Never used elsewhere.
- **Activity** — an entity-level audit trail tab/section on a single Candidate, Job, or Interview's detail page (e.g. "Activity Log" on a job). Never a standalone top-level page.
- **Run History** — the log of individual executions for a configured object (Agent, Automation). Rename the existing `History` pages under Agents and Automation to `Run History` to distinguish them from their sibling `Activity` pages, which should describe the live/recent-activity feed for that module.

Dashboard widget titles (already consistent, keep as-is): Today's Focus · Hiring Pipeline · Things To Do · Today's Schedule · AI Suggestions · My Jobs · Needs Attention · Today's Progress · Placement Watch · Recent Updates.

## 15. Writing Style Guide

- Plain English a recruiter uses on the phone, not HR-department English. `Add Candidate`, not `Initiate Candidate Record Creation`.
- Short sentences. One idea per sentence in any message, tooltip, or empty state.
- Friendly but not cute — no exclamation points except in genuinely positive confirmations, and even then sparingly.
- Second person for instructions ("Enter your email"), third person for records ("This candidate has no resume").
- Never explain what a button obviously does in its own label ("Delete Permanently and Forever" → just "Delete").
- Tooltips explain **why**, in under 8 words, never restate the label.

## 16. Words That Should Never Be Used

Applicant · Talent (except "Talent Pool") · Position · Requisition · Req · Client Company · Employer (for the hiring company) · POC · Manager (alone, for Hiring Manager) · Hire (as the placement entity — fine only inside feedback scores) · Presentation (for Submission) · Comment/Remark (for Note) · CV (for Resume) · To-do (for Task) · Lead Source/Origin (for Source) · Mobile (for phone contact field) · Owner (for a candidate/job's recruiter) · User (for a recruiter, outside login/admin context) · Launch/Initiate/Execute (as creation verbs) · Update (as a button label — use Save).

## 17. Rollout Guidance

This document describes the *target* language. It does not require an immediate rewrite of every file. Apply it going forward as the rule for:

1. Any new page, button, field, or message.
2. Any file already being touched for other reasons — fix the words while you're in there.
3. ~~A dedicated pass on the 🔴 Critical items in §2 (pipeline unification, creation-verb cleanup, AI Match naming) as their own follow-up task, since those affect data/config, not just copy.~~ **Done 2026-07-02** — see below.

Everything in this file supersedes ad hoc wording choices anywhere else in the codebase, including code comments, going forward.

### Critical fixes implemented (2026-07-02)

- **Pipeline unified.** Candidates/Jobs stage labels, Projects Kanban (`KANBAN_STAGES` + `PROJECT_CANDIDATES` mock data), and Settings → Recruitment's default stage list now all use the same six working stages (New, Reviewing, Submitted, Interview Scheduled, Offer Sent, Placed) plus Rejected where a terminal bucket is needed. Internal keys were left untouched — only display labels changed — so no migration was needed. As a side effect, fixed a pre-existing bug where Projects mock candidate `James Wilson` had `stage: 'Interviewing'`, which didn't match any Kanban column (`'Interview'`) and would have silently vanished from the board.
- **Creation verbs standardized.** `Post a job` / `Post a Job` → `Post Job` (jobs list empty state, jobs list header button, job-creation page title). `New Dashboard` / `Create New Dashboard` / `Build My Dashboard` → `Create Dashboard` (Manage Dashboards page, new-dashboard modal home screen, modal step header, AI-build submit button). `New Automation` → `Create Automation` (My Automations empty state + header button, automation wizard dialog title).
- **AI Match consolidated.** `AI Candidate Match` (candidate detail toolbar) and `AI Candidate Matching` (automation template) → `AI Match`. `Auto AI Candidate Summary` (automation template) → `AI Candidate Summary`.
- Verified with `tsc --noEmit` (clean). Could not verify visually in-browser — this environment's `.env.local` has placeholder Supabase credentials, so authenticated dashboard routes aren't reachable; the "Quick login (dev)" button returns `fetch failed`.
