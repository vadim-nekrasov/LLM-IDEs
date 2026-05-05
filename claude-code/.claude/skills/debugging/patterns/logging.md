# Logging Standards

## Object visibility
```js
// ❌ Risk of [object Object] / collapsed view
console.log("User:", user);

// ✅ Full structure as text
console.log("User:", JSON.stringify(user, null, 2));
```

## Traceability
- Unique label per call: `console.log("[Auth:Login] Step 1:", token)`.
- ID inside loops: `console.log(\`Item idx=\${index} id=\${item.id}\`)`.
- Timestamp for race conditions: `console.log(performance.now(), "before fetch")`.

## Question-Driven Design
If the prompt provides "Questions" / "Вопросы": every critical question must map to a specific log output. Logs that don't help answer a question can be dropped before submission.

## Cleanup
After the bug is fixed, remove temporary logs. The `final-checking` skill includes this as an explicit step.
