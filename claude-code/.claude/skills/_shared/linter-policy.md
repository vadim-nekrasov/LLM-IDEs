# Linter Policy (canonical)

Shared rule for the `writing-*` skills and `final-checking`. Cite this file and add only
your stack-specific caveat.

## Scope — your fresh diff only

End the session with **zero linter warnings on the lines you changed** (your diff vs
`git HEAD`), whatever the linter (eslint, tsc, clippy, ruff, glslangValidator, …).
Pre-existing/legacy warnings on lines you did not touch are signal-only and exempt — read
them critically but don't refactor them. A new file is entirely your diff, so it must be
fully clean. Errors and parse failures are never exempt — they block on any line, changed
or not.

## Never run mass autofix

Never run a project- or directory-wide autofix (`eslint --fix .`, `eslint --fix src/`, or
any glob/dir target) — it rewrites many files at once and introduces regressions (e.g.
`null` ↔ `undefined` rewrites that break call overloads or `boolean | undefined` props).
Editor per-file autofix on the file you are currently editing is fine. Direct `eslint` (and
`npx`/`bunx`/`pnpm dlx`/`yarn dlx eslint`) is denied at the permission layer — the sanctioned
CLI path is `npm run lint:js`. Script wrappers (`npm run …:fix`) and `xargs eslint --fix` are
not structurally blocked, so this rule is the actual guarantee for those.

## Fix in code, not in config

Never relax/disable a rule or edit a lint/format/build manifest to silence a warning; a
targeted inline-disable is acceptable only for a justified false positive. When a Stop gate
flags a warning, fix it in code and stop again — never reach for a raw-linter `--fix`.
