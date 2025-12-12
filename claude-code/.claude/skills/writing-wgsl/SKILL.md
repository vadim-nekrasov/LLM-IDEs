---
name: writing-wgsl
description: Provides WGSL (WebGPU Shading Language) patterns including type system, vectors, matrices, shader entry points, and compute patterns. Use PROACTIVELY when editing .wgsl files or writing WebGPU shaders.
---

# WGSL Code Style

## Contents

- [Type System](#type-system)
- [Variable Declarations](#variable-declarations)
- [Vectors & Matrices](#vectors--matrices)
- [Functions & Entry Points](#functions--entry-points)
- [Bindings & Resources](#bindings--resources)
- [Control Flow](#control-flow)
- [Built-in Functions](#built-in-functions)
- [Compute Shaders](#compute-shaders)
- [Memory & Alignment](#memory--alignment)
- [Key Differences from GLSL/JS](#key-differences-from-glsljs)
- [Anti-patterns](#anti-patterns)
- [Performance](#performance)

## Type System

### Scalar Types
| Type | Description |
|------|-------------|
| `f32` | 32-bit float |
| `f16` | 16-bit float (requires feature) |
| `i32` | 32-bit signed integer |
| `u32` | 32-bit unsigned integer |
| `bool` | Boolean |

### Type Inference
```wgsl
var a = 1;      // i32
let b = 2.0;    // f32
let c = 1u;     // u32
let d = true;   // bool
```

### Explicit Type Conversion (Required)
```wgsl
// ❌ Bad - implicit conversion not allowed
let a: i32 = 5;
let b: f32 = 2.0;
let c = a + b;  // ERROR: type mismatch

// ✅ Good - explicit conversion
let c = f32(a) + b;
```

## Variable Declarations

| Keyword | Mutability | Scope | Use Case |
|---------|------------|-------|----------|
| `var` | Mutable | Block | Loop counters, accumulators |
| `let` | Immutable | Block | Most calculations |
| `const` | Compile-time | Module | Constants known at compile time |

```wgsl
const PI: f32 = 3.14159;      // compile-time
let radius = 5.0;             // runtime immutable
var sum = 0.0;                // runtime mutable
sum += radius * PI;
```

### Address Spaces
```wgsl
// Uniform buffer (read-only, shared)
@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// Storage buffer (read-write)
@group(0) @binding(1) var<storage, read_write> data: array<f32>;

// Private (per-invocation)
var<private> local_state: f32;

// Workgroup (shared within workgroup)
var<workgroup> shared_data: array<f32, 256>;
```

## Vectors & Matrices

### Vector Types
```wgsl
let v2: vec2<f32> = vec2(1.0, 2.0);
let v3: vec3f = vec3f(1.0, 2.0, 3.0);  // shorthand
let v4: vec4i = vec4i(1, 2, 3, 4);
```

### Swizzling (Read-Only)
```wgsl
let color = vec4f(1.0, 0.5, 0.2, 1.0);
let xy = color.xy;        // vec2f
let rgb = color.rgb;      // vec3f
let bgr = color.bgr;      // reordered
```

### Matrix Types
```wgsl
// mat<columns>x<rows>
let m: mat4x4f = mat4x4f(
    1.0, 0.0, 0.0, 0.0,  // column 0
    0.0, 1.0, 0.0, 0.0,  // column 1
    0.0, 0.0, 1.0, 0.0,  // column 2
    0.0, 0.0, 0.0, 1.0   // column 3
);
let transformed = m * vec4f(pos, 1.0);
```

## Functions & Entry Points

### Vertex Shader
```wgsl
struct VertexInput {
    @location(0) position: vec3f,
    @location(1) uv: vec2f,
}

struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
}

@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.position = uniforms.mvp * vec4f(input.position, 1.0);
    output.uv = input.uv;
    return output;
}
```

### Fragment Shader
```wgsl
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    let color = textureSample(tex, samp, input.uv);
    return color;
}
```

### Compute Shader
```wgsl
@compute @workgroup_size(64, 1, 1)
fn cs_main(@builtin(global_invocation_id) id: vec3u) {
    let index = id.x;
    if (index >= arrayLength(&data)) { return; }
    data[index] = data[index] * 2.0;
}
```

## Bindings & Resources

### Uniform Buffers
```wgsl
struct Uniforms {
    model: mat4x4f,
    view: mat4x4f,
    projection: mat4x4f,
    time: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
```

### Textures & Samplers
```wgsl
@group(0) @binding(1) var tex: texture_2d<f32>;
@group(0) @binding(2) var samp: sampler;

let color = textureSample(tex, samp, uv);
```

### Storage Buffers
```wgsl
@group(0) @binding(3) var<storage, read> input: array<f32>;
@group(0) @binding(4) var<storage, read_write> output: array<f32>;
```

## Control Flow

### Conditionals
```wgsl
if condition {
    // ...
} else if other {
    // ...
} else {
    // ...
}
```

### Loops
```wgsl
for (var i = 0u; i < 10u; i++) { ... }

while condition { ... }

loop {
    if done { break; }
    continuing { i++; }
}
```

### Fragment Discard
```wgsl
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4f {
    if input.uv.x < 0.5 { discard; }
    return vec4f(1.0);
}
```

## Built-in Functions

### Use `select()` Instead of Ternary
```wgsl
// ❌ No ternary operator in WGSL
// let result = condition ? a : b;

// ✅ Good - use select(false_val, true_val, cond)
let result = select(0.0, value, value > 0.0);
```

### Common Math
```wgsl
let mixed = mix(a, b, t);           // lerp
let smoothed = smoothstep(0.0, 1.0, t);
let clamped = clamp(value, 0.0, 1.0);
let saturated = saturate(value);    // clamp [0,1]

// Vector ops
let len = length(v);
let n = normalize(v);
let d = dot(a, b);
let c = cross(a, b);
let r = reflect(incident, normal);
```

## Compute Shaders

### Workgroup Size Guidelines
```wgsl
// ✅ Good - 64 is portable across GPUs
@compute @workgroup_size(64)
fn compute_1d(...) { }

// ✅ Good - for 2D workloads (8*8=64)
@compute @workgroup_size(8, 8)
fn compute_2d(...) { }

// Avoid non-power-of-2 or very large sizes
```

### Thread Identification
```wgsl
@compute @workgroup_size(64)
fn main(
    @builtin(global_invocation_id) global_id: vec3u,
    @builtin(local_invocation_id) local_id: vec3u,
    @builtin(workgroup_id) group_id: vec3u,
    @builtin(num_workgroups) num_groups: vec3u,
) {
    let index = global_id.x;
}
```

### Workgroup Synchronization
```wgsl
var<workgroup> shared: array<f32, 256>;

@compute @workgroup_size(256)
fn reduce(@builtin(local_invocation_id) lid: vec3u) {
    shared[lid.x] = input[lid.x];
    workgroupBarrier();  // sync all threads
    // Now safe to read other threads' data
}
```

## Memory & Alignment

### Struct Alignment Rules
```wgsl
// ❌ Bad - inefficient padding
struct Bad {
    a: f32,     // 4 bytes + 12 padding
    b: vec4f,   // 16 bytes (must align to 16)
}

// ✅ Good - pack efficiently
struct Good {
    b: vec4f,   // 16 bytes
    a: f32,     // 4 bytes + 12 natural padding at end
}
```

### Common Alignments
| Type | Size | Alignment |
|------|------|-----------|
| `f32`, `i32`, `u32` | 4 | 4 |
| `vec2<T>` | 8 | 8 |
| `vec3<T>` | 12 | 16 |
| `vec4<T>` | 16 | 16 |
| `mat4x4<f32>` | 64 | 16 |

## Key Differences from GLSL/JS

| Feature | GLSL | JavaScript | WGSL |
|---------|------|------------|------|
| Ternary | `a ? b : c` | `a ? b : c` | `select(c, b, a)` |
| Increment | `i++` expr | `i++` expr | statement only |
| Assignment | `b = a += 1` | `b = a += 1` | Not allowed |
| Swizzle assign | `v.xy = ...` | N/A | Not allowed |
| Type conversion | Implicit | Implicit | Explicit only |

## Anti-patterns

### Don't Use Increment as Expression
```wgsl
// ❌ Bad - increment is statement only
// let b = a++;

// ✅ Good
a++;
let b = a;
```

### Don't Assign to Swizzles
```wgsl
// ❌ Bad - swizzle on left side
// v.xy = vec2f(1.0, 2.0);

// ✅ Good - reassign whole vector
v = vec4f(1.0, 2.0, v.z, v.w);
```

### Don't Rely on Implicit Conversions
```wgsl
// ❌ Bad - type mismatch
// let result = 1 + 2.0;

// ✅ Good
let result = 1.0 + 2.0;
```

### Don't Forget Bounds Checks
```wgsl
// ❌ Bad - potential out of bounds
data[index] = value;

// ✅ Good
if (index < arrayLength(&data)) {
    data[index] = value;
}
```

## Performance

### Minimize Divergent Branching
```wgsl
// ❌ Bad - threads diverge
if (id.x % 2 == 0) { heavy_work(); }
else { other_work(); }

// ✅ Good - uniform branching
if (uniforms.mode == 0) { all_threads_same(); }
```

### Use Workgroup Memory for Shared Data
```wgsl
// ❌ Bad - repeated global reads
for (var i = 0u; i < 10u; i++) {
    result += global_data[shared_idx];
}

// ✅ Good - cache in workgroup memory
var<workgroup> cached: f32;
if (local_id.x == 0u) { cached = global_data[shared_idx]; }
workgroupBarrier();
```

### Coalesce Memory Access
```wgsl
// ✅ Good - adjacent threads access adjacent memory
let value = data[global_id.x];

// ❌ Bad - strided access
let value = data[global_id.x * stride];
```

### Naming Conventions
```wgsl
// Entry points
@vertex fn vs_main(...) { }
@fragment fn fs_main(...) { }
@compute fn cs_main(...) { }

// snake_case for variables/functions
let light_direction: vec3f;
fn calculate_normal(...) -> vec3f { }

// PascalCase for structs
struct VertexInput { }
struct MaterialProperties { }
```
