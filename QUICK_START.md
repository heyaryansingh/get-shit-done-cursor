# Quick Start Guide for Cursor Projects

## Installation (One-Time Per Project)

```bash
cd your-project-directory
npx get-shit-done-cursor --cursor --local
```

**Important:** After installation, **restart Cursor** to load the slash commands.

## Verify Installation

Open Cursor chat (Ctrl+L or Cmd+L) and type:
```
/gsd/help
```

If you see the command reference, you're ready to go!

## Basic Workflow

### 1. Initialize Your Project
```
/gsd/new-project
```
Answer questions about your project goals, tech stack, and requirements.

### 2. Create Roadmap
```
/gsd/create-roadmap
```
Creates a phased development plan.

### 3. Plan First Phase
```
/gsd/plan-phase 1
```
Generates detailed task plans for phase 1.

### 4. Execute Plans
```
/gsd/execute-plan .planning/phases/01-foundation/01-01-PLAN.md
```
Or execute all plans in a phase:
```
/gsd/execute-phase 1
```

### 5. Check Progress
```
/gsd/progress
```
See where you are and what's next.

## For Existing Projects

If you already have code:

1. Install GSD (same as above)
2. Map your codebase:
   ```
   /gsd/map-codebase
   ```
3. Then continue with `/gsd/new-project` - the system will know your codebase

## Common Commands

- `/gsd/help` - Show all commands
- `/gsd/progress` - Check project status
- `/gsd/add-todo` - Capture ideas for later
- `/gsd/debug [issue]` - Systematic debugging
- `/gsd/complete-milestone` - Ship and archive

## Need Help?

- Run `/gsd/help` for full command reference
- Check `.planning/STATE.md` for project context
- Check `.planning/ROADMAP.md` for phase status
