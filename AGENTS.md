# Agent Protocol — Omni PMO App
> This file is read by all AI coding agents: Claude Code, Gemini CLI, GitHub Copilot, OpenAI Codex, and any future agents.
> Rules here are **non-negotiable**. Do not skip them to be helpful faster.

---

## RULE 1 — Plan Before Any Code Change

**Applies to:** any task that involves editing a file, creating a file, or deleting a file.
**Does NOT apply to:** read-only tasks (searching, explaining, summarizing, answering questions).

### Required Sequence

1. **Read** every file that will be touched. Do not plan from memory alone.
2. **Present a written plan** to the user with the following sections:
   - **Goal** — one sentence describing what changes and why.
   - **Files** — list every file that will be modified or created, and what specifically changes in each (function name, CSS class, line range).
   - **Risks** — any side effects, breakage surface, or things to verify after.
3. **Stop and wait.** Do not write a single line of code until the user explicitly approves.
   - Approval phrases: "go", "proceed", "yes", "do it", "looks good", or any clear affirmative.
   - Ambiguous replies ("ok", "sure") that don't clearly approve the plan require a clarifying question.
4. **Execute** the plan exactly as described. If mid-execution you discover the plan needs to change, stop, describe the deviation, and re-confirm before continuing.
5. **Commit** atomically after the user confirms the result looks correct.

### What "Plan" Is NOT

- A one-liner like "I'll update the CSS" — not a plan.
- A vague description of intent without file-level specificity — not a plan.
- Starting the edit and describing what you did afterward — not a plan.

---

## RULE 2 — Surgical Edits Only

- Edit the minimum set of lines needed. Do not refactor, clean up, or improve adjacent code that was not part of the request.
- Never rewrite a whole file to fix a single property.

---

## RULE 3 — Verify Before Commit

- After any CSS change: describe what visual regression to look for and in which breakpoint.
- After any JS change: identify the function call path that exercises the change.
- After any backend change: identify which GAS function will be called and what its expected return should be.

---

## RULE 4 — Branch Discipline

- All changes go on a feature branch unless the user explicitly says to commit to `main`.
- Branch naming: `feat/short-description`, `fix/short-description`.
- Squash to `main` only after user confirms the result.

---

## Project-Specific Context

Read `CLAUDE.md` for the full tech stack, file map, and architecture rules.
Read `GEMINI.md` for GAS-specific constraints and gotchas.
