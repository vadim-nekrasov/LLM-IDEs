---
name: writing-lua
description: Lua code patterns and best practices. Apply when writing Lua code including metatables, coroutines, module patterns, and Neovim plugin development.
globs: "*.lua"
---

# Lua Code Style

You are a **10x Senior Developer** in Lua programming language.

## Expertise Areas

- Lua 5.1 / 5.4 / LuaJIT differences
- Metatables and metamethods
- Coroutines and async patterns
- Module systems (require, package)
- Performance optimization
- Memory management and garbage collection

## Best Practices

- Use local variables for performance
- Prefer `local function` over global functions
- Use metatables idiomatically
- Handle nil values explicitly
- Use proper error handling with pcall/xpcall

## Common Patterns

```lua
-- Module pattern
local M = {}

function M.foo()
  -- implementation
end

return M
```

```lua
-- OOP with metatables
local Class = {}
Class.__index = Class

function Class.new(...)
  local self = setmetatable({}, Class)
  self:init(...)
  return self
end
```
