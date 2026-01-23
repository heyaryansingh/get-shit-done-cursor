---
name: gsd:create-roadmap
description: Create roadmap with phases for the project
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
  - Glob
---

<objective>
Create project roadmap with phase breakdown.

Roadmaps define what work happens in what order. Run after /gsd:new-project.
</objective>

<execution_context>
@verify-final/claude/get-shit-done/workflows/create-roadmap.md
@verify-final/claude/get-shit-done/templates/roadmap.md
@verify-final/claude/get-shit-done/templates/state.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/config.json
</context>

<process>

<step name="validate">
Use Read to check for `.planning/PROJECT.md`.

- If missing, output: `ERROR: No PROJECT.md found. Run /gsd:new-project first.` and exit.
</step>

<step name="check_existing">
Check if roadmap already exists:

Use Read to check for `.planning/ROADMAP.md`.

- If it exists, set status to `ROADMAP_EXISTS`.
- If it does not exist, set status to `NO_ROADMAP`.

**If ROADMAP_EXISTS:**
Use AskUserQuestion:
- header: "Roadmap exists"
- question: "A roadmap already exists. What would you like to do?"
- options:
  - "View existing" - Show current roadmap
  - "Replace" - Create new roadmap (will overwrite)
  - "Cancel" - Keep existing roadmap

If "View existing": Read `.planning/ROADMAP.md` and exit
If "Cancel": Exit
If "Replace": Continue with workflow
</step>

<step name="create_roadmap">
Follow the create-roadmap.md workflow starting from detect_domain step.

The workflow handles:
- Domain expertise detection
- Phase identification
- Research flags for each phase
- Confirmation gates (respecting config mode)
- ROADMAP.md creation
- STATE.md initialization
- Phase directory creation
- Git commit
</step>

<step name="done">
```
Roadmap created:
- Roadmap: .planning/ROADMAP.md
- State: .planning/STATE.md
- [N] phases defined

---

## ▶ Next Up

**Phase 1: [Name]** — [Goal from ROADMAP.md]

`/gsd:plan-phase 1`

<sub>`/clear` first → fresh context window</sub>

---

**Also available:**
- `/gsd:discuss-phase 1` — gather context first
- `/gsd:research-phase 1` — investigate unknowns
- Review roadmap

---
```
</step>

</process>

<output>
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/XX-name/` directories
</output>

<success_criteria>
- [ ] PROJECT.md validated
- [ ] ROADMAP.md created with phases
- [ ] STATE.md initialized
- [ ] Phase directories created
- [ ] Changes committed
</success_criteria>
