<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Workspace Configuration

## Core Engineering Principles

### 1. The Ponytail Solution Ladder

Before writing any code, the agent must stop at the first rung that holds true:

1. **YAGNI:** Does this feature actually need to exist? If no, skip it.
2. **Reuse:** Is this already in the codebase? Reuse it, don't rewrite it.
3. **Stdlib:** Can the language's standard library do it? Use it.
4. **Native Feature:** Is there a native web/platform feature (e.g., `<input type="date">`)? Use it.
5. **Dependencies:** Can an already-installed dependency solve it? Use it.
6. **One-Liner:** Can it be safely written in a single line? Write it in one line.
7. **Minimum Viable:** Only build the absolute minimum required to safely satisfy the task.

_Lazy about the solution, never about reading. Trust-boundary validation, security, and accessibility must never be cut._

### 2. The ECC Lifecycle Workflow

All non-trivial feature implementations and bug fixes must advance sequentially through these states:
`Plan` ➔ `Test (TDD RED)` ➔ `Implement (GREEN)` ➔ `Review` ➔ `Verify` ➔ `Remember`

---

## Active Rules & Guidelines

### Development & Optimization

- **Terse Execution:** Keep conversations brief and output minimal, byte-for-byte exact code. Shrink what you build using Ponytail rungs, and shrink what you say.
- **Context Economy:** Regularly track context window pressure. Suggest strategic compaction (`/compact`) after research and milestone phases before starting implementations.

### Testing & Quality Gates

- **TDD Requirement:** Define interfaces first. Capture explicit failing (RED) test evidence before implementing code changes, then iterate until passing (GREEN).
- **Coverage Target:** Maintain a strict minimum of **80% test coverage** for all modified or new modules.
- **Code Hygiene:** Prevent dead code, debug statements, or left-over `console.log` instances from leaking into commits.

### Security Guardrails

- **Input Sanitization:** Enforce strict OWASP-aligned trust-boundary validation.
- **Credential Protection:** Never log, expose, or commit secrets, environment variables, or `.env` files.
- **Destructive Command Gating:** Explicitly intercept and request confirmation for structural alterations or destructive shell routines.

---

## Workspace Tools & Capabilities

### External Packages & Repositories

- [Ponytail Ruleset](https://github.com/DietrichGebert/ponytail) - Code efficiency and senior laziness modeling.
- [ECC Optimization System](https://github.com/affaan-m/ECC) - Specialized subagents, testing workflows, and harness memory management.

### Portable Skill Mapping

- `/ponytail [lite | full | ultra | off]` - Adjust the brevity engine intensity.
- `/ponytail-review` - Review local diffs for engineering bloat and compile a code deletion list.
- `/ponytail-audit` - Audit the entire repository workspace for over-engineering patterns.
- `/ecc:plan` - Generate a detailed technical blueprint asset before executing feature scripts.
- `tdd-workflow` - Enforce the write-tests-first methodology for bug resolution.
- `/code-review` - Spawn a fresh-context subagent to audit implementation blocks for security and regressions.
- `/build-fix` - Route compiler, typing, and lint errors into dedicated resolver loops.

---

## Subagent Matrix

When performing complex or multi-layered tasks, delegate isolated operations to specialized subagents:

- **planner:** Handles architectural designs and initialization blueprints.
- **architect:** Formulates large-scale system patterns and dependency management.
- **tdd-guide:** Dictates test generation hooks and verification environments.
- **code-reviewer:** Audits changes for maintainability from an unbiased context.
- **security-reviewer:** Conducts automated vulnerability analysis.
- **build-error-resolver:** Iterates sequentially through environment logs to debug compilation failures.

---

## Memory Vault Settings

- **Durable Summaries:** Persist session conclusions, learned instincts, and project handoffs as portable Markdown artifacts under the `.ecc/memory/` project directory.
- **Context Boundaries:** Prevent historical transcript bloat from invading active context fields. Isolate Cursor-specific routines using an explicit data home directory constraint (`~/.cursor/ecc`).
