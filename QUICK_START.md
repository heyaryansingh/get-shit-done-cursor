# Quick Start Guide

## Platform Command Syntax

| Platform | Syntax | Example |
|----------|--------|---------|
| **Claude Code** | Colon (`:`) | `/gsd:help` |
| **Cursor IDE** | Slash (`/`) | `/gsd/help` |

> **Note:** This guide shows both syntaxes. Use the one that matches your platform.

---

## Installation (One-Time Per Project)

### For Cursor IDE

```bash
cd your-project-directory
npx get-shit-done-cursor --cursor --local
```

**Important:** After installation, **restart Cursor** to load the slash commands.

### For Claude Code

```bash
cd your-project-directory
npx get-shit-done-cursor --local
```

---

## Verify Installation

### Cursor IDE

Open Cursor chat (Ctrl+L or Cmd+L) and type:
```
/gsd/help
```

### Claude Code

In Claude Code, type:
```
/gsd:help
```

If you see the command reference, you're ready to go!

---

## Basic Workflow

### 1. Initialize Your Project

| Claude Code | Cursor |
|-------------|--------|
| `/gsd:new-project` | `/gsd/new-project` |

Answer questions about your project goals, tech stack, and requirements.

### 2. Create Roadmap

| Claude Code | Cursor |
|-------------|--------|
| `/gsd:create-roadmap` | `/gsd/create-roadmap` |

Creates a phased development plan.

### 3. Plan First Phase

| Claude Code | Cursor |
|-------------|--------|
| `/gsd:plan-phase 1` | `/gsd/plan-phase 1` |

Generates detailed task plans for phase 1.

### 4. Execute Plans

**Single plan execution:**

| Claude Code | Cursor |
|-------------|--------|
| `/gsd:execute-plan .planning/phases/01-foundation/01-01-PLAN.md` | `/gsd/execute-plan .planning/phases/01-foundation/01-01-PLAN.md` |

**Or execute all plans in a phase (parallel execution):**

| Claude Code | Cursor |
|-------------|--------|
| `/gsd:execute-phase 1` | `/gsd/execute-phase 1` |

### 5. Check Progress

| Claude Code | Cursor |
|-------------|--------|
| `/gsd:progress` | `/gsd/progress` |

See where you are and what's next.

---

## For Existing Projects

If you already have code:

1. Install GSD (same as above)

2. Map your codebase:
   
   | Claude Code | Cursor |
   |-------------|--------|
   | `/gsd:map-codebase` | `/gsd/map-codebase` |

3. Then continue with project initialization - the system will know your codebase:
   
   | Claude Code | Cursor |
   |-------------|--------|
   | `/gsd:new-project` | `/gsd/new-project` |

---

## Common Commands

| Action | Claude Code | Cursor |
|--------|-------------|--------|
| Show all commands | `/gsd:help` | `/gsd/help` |
| Check project status | `/gsd:progress` | `/gsd/progress` |
| Capture ideas for later | `/gsd:add-todo` | `/gsd/add-todo` |
| Systematic debugging | `/gsd:debug [issue]` | `/gsd/debug [issue]` |
| Ship and archive | `/gsd:complete-milestone` | `/gsd/complete-milestone` |

---

## Context Reset

When your context fills up and you need a fresh start:

### Claude Code
```
/clear
```
Then resume with `/gsd:debug` or `/gsd:progress`

### Cursor IDE
Start a **new chat** (Ctrl+L or Cmd+L), then resume with `/gsd/debug` or `/gsd/progress`

---

## Need Help?

- Run `/gsd:help` (Claude Code) or `/gsd/help` (Cursor) for full command reference
- Check `.planning/STATE.md` for project context
- Check `.planning/ROADMAP.md` for phase status
