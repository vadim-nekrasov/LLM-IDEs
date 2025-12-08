---
name: writing-lua
description: Provides Lua code patterns including metatables, coroutines, module patterns, and Neovim plugin development. Use PROACTIVELY when editing .lua files, writing Lua modules, or developing Neovim plugins.
---

# Lua Code Style

## Contents

- [Module Pattern](#module-pattern)
- [OOP with Metatables](#oop-with-metatables)
- [Error Handling](#error-handling)
- [Coroutines](#coroutines)
- [Performance Tips](#performance-tips)
- [Lua Version Differences](#lua-version-differences)

## Module Pattern

```lua
local M = {}

function M.foo()
  -- implementation
end

-- Private function (not exported)
local function helper()
  -- internal use only
end

return M
```

## OOP with Metatables

```lua
local Class = {}
Class.__index = Class

function Class.new(name)
  local self = setmetatable({}, Class)
  self.name = name
  return self
end

function Class:greet()
  return 'Hello, ' .. self.name
end

-- Inheritance
local Child = setmetatable({}, { __index = Class })
Child.__index = Child

function Child.new(name, age)
  local self = setmetatable(Class.new(name), Child)
  self.age = age
  return self
end
```

## Error Handling

```lua
-- pcall for recoverable errors
local ok, result = pcall(function()
  return risky_operation()
end)

if not ok then
  print('Error:', result)
  return nil
end

-- xpcall with error handler
local ok, result = xpcall(risky_operation, function(err)
  return debug.traceback(err, 2)
end)

-- assert for invariants
local function divide(a, b)
  assert(b ~= 0, 'Division by zero')
  return a / b
end
```

## Coroutines

```lua
-- Basic coroutine
local co = coroutine.create(function()
  for i = 1, 3 do
    coroutine.yield(i)
  end
end)

while coroutine.status(co) ~= 'dead' do
  local ok, value = coroutine.resume(co)
  print(value)
end

-- Iterator pattern
local function range(from, to)
  return coroutine.wrap(function()
    for i = from, to do
      coroutine.yield(i)
    end
  end)
end

for i in range(1, 5) do print(i) end
```

## Performance Tips

```lua
-- Cache globals in locals
local insert = table.insert
local format = string.format

-- Avoid table creation in hot paths
-- ❌ Bad
for i = 1, 1000 do
  process({ x = i })  -- creates 1000 tables
end

-- ✅ Good
local point = { x = 0 }
for i = 1, 1000 do
  point.x = i
  process(point)  -- reuses one table
end

-- Pre-size tables when size is known
local t = {}
for i = 1, 1000 do t[i] = i end  -- grows incrementally

local t = table.create and table.create(1000) or {}  -- LuaJIT
```

## Lua Version Differences

| Feature | 5.1 | 5.4 | LuaJIT |
|---------|-----|-----|--------|
| `goto` | ❌ | ✅ | ✅ |
| Bitwise ops | lib | native | `bit.*` |
| `#` on sparse | undefined | defined | undefined |
| Integers | ❌ | ✅ | ❌ |
| `table.unpack` | `unpack` | ✅ | `unpack` |

```lua
-- LuaJIT bitwise
local bit = require('bit')
local result = bit.band(0xFF, 0x0F)

-- Lua 5.4 bitwise (native)
local result = 0xFF & 0x0F
```

## Best Practices

- Use `local` for all variables (performance + scope)
- Prefer `local function` over global
- Handle `nil` explicitly
- Use `#t` only on sequence tables (no holes)
- Avoid `pairs` when `ipairs` suffices (preserves order)
- Use metatables for operator overloading
- Prefer string keys over numeric for readability in config tables
