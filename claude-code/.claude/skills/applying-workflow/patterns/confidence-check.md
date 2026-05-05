# Confidence Check

Before implementing changes to critical business logic or architecture:

- If confidence < 85 % → ask the user. The cost of a clarifying question is a few seconds; the cost of an unwanted refactor is a revert.
- Prompt contains the word **"Ограничения" / "Constraints"** → treat the listed items as `strict_constraints`. Solutions violating them are discarded immediately.
- Prompt contains **"Вопрос" / "Вопросы" / "Questions"** → answer each one explicitly. Don't bundle answers into prose.

## Phrasing the question

State what you intend to do, the alternative you considered, and the trade-off. Don't ask "what should I do" — ask "I plan A because of X; B is also viable but Y. Confirm A or pick B".
