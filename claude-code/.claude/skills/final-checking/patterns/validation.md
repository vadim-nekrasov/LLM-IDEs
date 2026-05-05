# Automated Validation

Run scripts from the directory that owns the relevant manifest (e.g., `package.json`, `Cargo.toml`, `pyproject.toml`). In monorepos, that's typically the inner package, not the workspace root. The exact paths and scripts for the current project should be documented in `${CLAUDE_PROJECT_DIR}/CLAUDE.local.md` or `${CLAUDE_PROJECT_DIR}/README.md`.

## JavaScript / TypeScript
- Lint: `npm run lint` (or `lint:js`, `lint:css` if split).
- Type-check: `npm run typecheck` — fall back to `npx tsc --noEmit` if no script.
- Build (only when CI enforces it on PRs): `npm run build`.
- Tests: `npm test`.

## Rust
- `cargo check`
- `cargo clippy -- -D warnings`
- `cargo test`

## Python
- `ruff check .`
- `mypy .`
- `pytest`

## Go
- `go build ./...`
- `go vet ./...`
- `golangci-lint run`

## File Integrity

After write-heavy edits, re-read the modified files from disk. Writes can fail silently (permission, full disk, race with another tool); a re-read catches missing or partial writes.
