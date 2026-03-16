---
name: clip
description: >-
  Copies the last user prompt and full assistant response from the current or
  most recent agent session to the Windows clipboard (via clip.exe on WSL).
  Use when the user says "clip", "copy last response", "clipboard",
  "copy that", or asks to put something on their clipboard.
---

# Clip

Copy the last agent exchange (user prompt + full assistant response) to the Windows clipboard.

## Usage

Run from any WSL terminal:

```bash
# Last exchange
clip-last

# Last N exchanges
clip-last 3
```

The script is installed at `~/.local/bin/clip-last`.

## How It Works

1. Finds the most recent transcript in `~/.cursor/projects/home-jrm22n/agent-transcripts/`
2. Extracts the last N user+assistant exchanges from the JSONL
3. Formats as markdown (user query + assistant text + summarized tool calls)
4. Pipes to `clip.exe` (WSL → Windows clipboard)

## When Called as a Skill

If the user invokes this in chat rather than the terminal, run:

```bash
clip-last
```

Then confirm to the user what was copied (line count, char count). If they ask for a specific number of exchanges, pass it as an argument: `clip-last N`.

## Troubleshooting

- If `clip.exe` is not found, the script prints to stdout instead.
- If no transcripts exist, it exits with an error message.
- The script lives at `~/.local/bin/clip-last` and must be executable (`chmod +x`).
