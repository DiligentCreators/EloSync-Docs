# Give Feedback — User Guide

Feedback is a **platform** capability, not a Marketplace module. Every signed-in workspace user can report a bug or suggest an improvement, and there is nothing to install or entitle.

Architecture and API contracts live in [Central Feedback System](/developer-guide/central-feedback-system).

## Sending feedback (workspace users)

Open the dialog from either place:

- **User menu** (avatar, top right) → **Give Feedback**
- **Command palette** (`Ctrl`/`⌘` + `K`) → **Give Feedback** under **Actions**

Then fill in:

| Field | Notes |
|-------|-------|
| Type | Bug, Feature request, UX / Usability, Performance, Integration, Other |
| Title | Short summary, at least 3 characters |
| Description | At least 10 characters — what you did, what you expected, what happened |
| Module | Prefilled from the page you were on; edit or clear it |
| Impact | Optional — Low, Medium, High, Critical |
| Screenshot | Optional PNG, JPG, WebP, GIF, PDF, or text file up to 5 MB |

Submitting shows a confirmation toast with the reference number (for example `FB-000123`). Quote that number if you follow up.

### What is captured automatically

So you do not have to describe your setup, the dialog also sends the page route and full URL you were on when you opened it, your browser user agent, and the app build version. The dialog tells you which page it captured before you submit.

### My submissions

The **My submissions** tab in the same dialog lists your recent reports with their current status (New, Triaged, Planned, In progress, Resolved, Closed, Duplicate, Won't fix, Not reproducible). It refreshes automatically after you send something new.

## Triaging feedback (Central operators)

Central users work every workspace from one inbox at **Platform → Feedback**.

- Filter by type, status, and priority, or search across submissions
- Stats chips summarize new items, open bugs, critical items, feature requests, work in progress, and what was resolved this week
- Open a row to see the reporter, workspace, module and page context, description, and attachments
- Set **status** and **priority**, then **Save triage**
- Add an **Internal note** (Central only) or a **Public response** (visible to the reporter)

**Platform → Beta Applications** lists Founding Beta signups from the marketing site, where operators record a status (New, Reviewed, Accepted, Rejected, Waitlisted) and private notes. See [Founding Beta](/product/founding-beta).

## Permissions

Workspace users need **no permission** to submit feedback or read their own submissions. Central triage is gated by:

| Permission | Ability |
|------------|---------|
| `feedback.list` | See the Central Feedback inbox |
| `feedback.read` | Open a submission's full detail, including internal notes |
| `feedback.update` | Change status, priority, and module linkage |
| `feedback.comment` | Add internal notes and public responses |
| `feedback.stats` | See the triage summary chips |
| `beta-applications.list` / `.read` / `.update` | Review and annotate Founding Beta applications |
