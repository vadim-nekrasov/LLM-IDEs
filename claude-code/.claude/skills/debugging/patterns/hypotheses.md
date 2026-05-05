# Generating Hypotheses

## Coverage targets
- Race conditions and ordering (async, lifecycle, callbacks).
- Stale state / closure capture / memoization.
- Environment differences (dev vs prod, browser vs Node, OS path separators).
- Network: HTTP status, retries, CORS, caching, idle timeouts.
- Type coercion (`==`, `||` vs `??`, falsy handling).
- Library version mismatches (use Context7 to confirm API shape for the installed version).
- Permission / authorization edge cases.
- Data shape: missing field, null vs undefined, empty array vs missing array.

## Late-Breaking Heuristic
If your best ideas appear at the END of the list (last 3–5), generate 5–10 more. Adjacent solutions are often nearby.

## Question alignment
If the user prompt includes "Questions" / "Вопросы" / "Critical Questions": discard any hypothesis that cannot answer at least one of them.
