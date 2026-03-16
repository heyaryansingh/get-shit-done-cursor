---
name: recapitulate
description: >-
  Summarizes all prior work across agent sessions by reading transcript history.
  Use when the user says "recapitulate", "recap", "where were we", "what have
  we done", "summarize our sessions", or asks to recall previous conversations.
---

# Recapitulate

Reconstruct and present a comprehensive summary of all prior work across agent sessions.

## Transcript Location

Agent transcripts are stored as JSONL files at:

```
~/.cursor/projects/home-jrm22n/agent-transcripts/<uuid>/<uuid>.jsonl
```

Each `.jsonl` file contains one JSON object per line with `role` and `message` fields.

## Workflow

### Step 1: Discover transcripts

```bash
ls -lt ~/.cursor/projects/home-jrm22n/agent-transcripts/ | head -20
```

List all transcript directories sorted by modification time (most recent first).

### Step 2: Read transcripts

Read each `.jsonl` file. Start with the most recent and work backwards. For large files, read in chunks. Extract:
- User queries (role: "user")
- Assistant actions and summaries (role: "assistant")
- Tool calls and their results (tool_use blocks)

### Step 3: Synthesize

Produce a structured summary with these sections:

#### Output Format

```markdown
## Recapitulation: [Project/Topic Name]

### Timeline
| Session | Date/Order | Key Actions |
|---------|------------|-------------|
| 1 (earliest) | ... | ... |
| 2 | ... | ... |
| N (latest) | ... | ... |

### Current State
| Component | Status |
|-----------|--------|
| ... | Working / Not started / Blocked / etc. |

### Architecture / Big Picture
[If applicable — diagram or description of the system being built]

### Open Next Steps
1. ...
2. ...
3. ...
```

## Rules

- **Chronological order**: Present sessions from earliest to latest.
- **Be specific**: Include commit hashes, file paths, branch names, version numbers.
- **State over narrative**: Prioritize current state of things over retelling the story.
- **Flag blockers**: Clearly mark anything that was started but not confirmed complete.
- **Identify actors**: If multiple collaborators or AI entities are involved, attribute actions to them.
- **No padding**: Optimize for signal per token. The user already lived through it — they need a map, not a novel.
