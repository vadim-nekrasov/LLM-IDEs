---
name: writing-glsl
description: GLSL ES 3.00 (WebGL2 shader language) — ESSL 3.00 type system, in/out qualifiers, UBOs, integer samplers, MRT outputs, precision semantics, shader-side performance.
when_to_use: Triggers on edits to .glsl/.vert/.frag files. Covers ESSL 3.00 specifically; assumes `#version 300 es`. For WGSL (WebGPU) see writing-wgsl. Syntax/grammar/type/identifier checks belong to `glslangValidator` (e.g. via `scripts/validate-shaders.mjs`) — this skill covers semantics, GPU portability, runtime pitfalls, and performance.
paths:
  - "**/*.glsl"
  - "**/*.vert"
  - "**/*.frag"
---

# GLSL ES 3.00 Code Style

> **Working with `glslangValidator`.** When editing a `.glsl` file you may see compile errors from older code — ignore them, fix only your own diff. Never run mass autofix across shader files. Validator output is authoritative on syntax/grammar/types; this skill covers what compiles but is still wrong at runtime.

## Contents

- [Scope & Coordination](#scope--coordination)
- [Type System](#type-system)
- [In/Out & Interpolation](#inout--interpolation)
- [Sampling & Textures](#sampling--textures)
- [UBOs & std140 Layout](#ubos--std140-layout)
- [Precision & Range](#precision--range)
- [Control Flow](#control-flow)
- [Built-in Math & Bitwise Ops](#built-in-math--bitwise-ops)
- [Anti-patterns](#anti-patterns)
- [Performance](#performance)

## Scope & Coordination

> Boundary frozen against `glslangValidator` (Khronos reference compiler) as of 2026-05-30. When the validator's scope changes, update the example rows below; the principle row defines the durable contract.

| Layer | Owns | Examples |
|---|---|---|
| **Principle** | compile-time grammar/type/identifier → validator; runtime correctness, GPU portability, performance → skill; numerical/visual/architectural judgment → human review | — |
| `glslangValidator` + project `lint:glsl` | syntax, type checking, undeclared identifiers, precision-qualifier syntax, illegal control-flow, ESSL grammar, `#version` validation | grammar/types → glslang; `texture2D` / `gl_FragColor` / `attribute` / `varying` / `#extension GL_EXT_draw_buffers` → project `lint:glsl` (install-free regression guard, hard error by default) |
| This skill | runtime UB, GPU portability, shader-state semantics, perf anti-patterns | uninitialized var (UB); `mediump int` range overflow; divergent branching; sampler completeness; non-uniform sampler-array indexing |
| Human review | numerical stability, visual correctness, perf-vs-quality trade-offs | banding, filter quality, algorithmic choice, sample count |

> Sibling skill for the WebGL2 **host API**: [`writing-webgl2`](../writing-webgl2/SKILL.md).

## Type System

### Scalars

| Type | Suffix | Notes |
|---|---|---|
| `float` | `1.0`, `1.5e3` | Default `highp` in VS, `mediump` in FS unless overridden. |
| `int` | `1` | Signed 32-bit. |
| `uint` | `1u`, `0xFFu` | Unsigned 32-bit — new in ESSL 3.00. |
| `bool` | `true`/`false` | Not interchangeable with `int`. |

### Vectors & Matrices

```glsl
vec2/vec3/vec4         // float
ivec2/ivec3/ivec4      // int
uvec2/uvec3/uvec4      // uint
bvec2/bvec3/bvec4      // bool
mat2/mat3/mat4         // column-major
mat2x3/mat3x4 …        // non-square matN×M
```

Swizzles read AND write: `v.xyz = vec3(0.0);` (legal). Mixed swizzle sets must not repeat components on the write side (`v.xx = …` is illegal).

### Samplers

| Sampler | Reads |
|---|---|
| `sampler2D` / `sampler3D` / `samplerCube` / `sampler2DArray` | `float` channels |
| `isampler2D` / `isampler3D` / `isamplerCube` / `isampler2DArray` | `int` channels (new in 3.00) |
| `usampler2D` / `usampler3D` / `usamplerCube` / `usampler2DArray` | `uint` channels (new in 3.00) |
| `sampler2DShadow` / `samplerCubeShadow` / `sampler2DArrayShadow` | depth + compare |

Integer-formatted textures (`R32I`, `RGBA32UI`, …) **must** be read with the matching integer sampler; sampling a `uint` texture through `sampler2D` is a runtime error on most drivers.

## In/Out & Interpolation

### Pipeline qualifiers

```glsl
// Vertex shader
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec2 a_uv;
out vec2 v_uv;

// Fragment shader
in vec2 v_uv;
layout(location = 0) out vec4 outColor;     // single render target
layout(location = 1) out vec4 outNormal;    // MRT slot 1
```

`layout(location = N)` on a VS input is the JS-side `gl.bindAttribLocation` replacement — set it in the shader and the link order stops mattering.

### Interpolation modifiers

| Modifier | Behaviour |
|---|---|
| _(default `smooth`)_ | Perspective-correct interpolation. |
| `flat` | No interpolation — value taken from provoking vertex. **Required** for `int`/`uint` varyings; integer types cannot be `smooth`. |
| `centroid` | Sample-position-aware — avoids sampling outside the primitive on MSAA edges. Costs perf; only use when MSAA shimmer is visible. |

```glsl
flat out int v_materialId;          // ✅ flat is mandatory for int
centroid out vec2 v_uv_centroid;    // ✅ only when needed
```

## Sampling & Textures

### One unified `texture()`

```glsl
vec4 c  = texture(uTex, uv);              // replaces texture2D/textureCube
vec4 cL = textureLod(uTex, uv, 0.0);      // explicit LOD
vec4 cO = textureOffset(uTex, uv, ivec2(1, 0));
```

### `texelFetch` — integer-coordinate, no filtering

```glsl
ivec2 px = ivec2(gl_FragCoord.xy);
vec4 raw = texelFetch(uTex, px, 0);       // 0 = mip level
```

Use `texelFetch` whenever you want **exact** pixel values: data textures (heightmaps, LUTs, ID buffers), histograms, and post-processing kernels that index by pixel. It bypasses linear filtering and wrap modes — both of which silently corrupt non-image data.

### Integer-sampler reads

```glsl
uniform isampler2D uIdTex;
ivec4 id = texelFetch(uIdTex, ivec2(gl_FragCoord.xy), 0);
```

A `usampler2D` returning `uvec4` is the only correct way to read an `RGBA32UI` texture — no floating-point ID encoding tricks needed.

## UBOs & std140 Layout

Uniform Buffer Objects move related uniforms into a single GPU buffer — replacing many `gl.uniform*` calls at draw time with one bound block.

```glsl
layout(std140) uniform Frame {
    mat4  view;
    mat4  projection;
    vec4  cameraPos;        // .w padding ignored
    float time;
    float _pad0, _pad1, _pad2;   // explicit pad to 16-byte boundary
} frame;

void main() {
    gl_Position = frame.projection * frame.view * vec4(a_position, 1.0);
}
```

### std140 rules that bite

- Every member's offset is a multiple of its **base alignment**, NOT its size.
- `vec3` aligns to 16 bytes, not 12. A bare `vec3` followed by a `float` is one 16-byte slot (the float lands in the `.w`).
- Arrays: every element is padded up to a multiple of 16 bytes — `float arr[8]` consumes 8 × 16 = 128 bytes, not 32.
- `mat4` = 4 × `vec4` = 64 bytes (fine). `mat3` = 3 × `vec4` = 48 bytes (NOT 36).

Host-side layout, binding indices, and `bindBufferBase` calls are covered in [`writing-webgl2` § Buffers](../writing-webgl2/SKILL.md#buffers-ubo-pbo-async-readback).

## Precision & Range

### Defaults

| Stage | `float` default | `int` default | `sampler*` default |
|---|---|---|---|
| Vertex | `highp` | `highp` | `lowp` |
| Fragment | _(none — must declare)_ | `mediump` | `lowp` |

Every fragment shader needs an explicit float precision line at the top:

```glsl
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
```

### Minimum-guaranteed ranges

| Qualifier | `float` magnitude | `int` range |
|---|---|---|
| `lowp` | `[-2, 2]` | 9 bits |
| `mediump` | `[2^-14, 2^14)` | 16 bits |
| `highp` | `[2^-62, 2^62)` | 32 bits |

`mediump` on a desktop GPU is typically promoted to FP32 — but mobile GPUs honour the spec. Code that works on Chrome desktop but breaks on Safari iOS almost always has a `mediump` overflow.

## Control Flow

### Loops

ESSL 3.00 allows dynamic loop bounds (no constant-expression requirement).

```glsl
// ✅ Good — both compile in ESSL 3.00
for (int i = 0; i < uCount; i++) { … }
while (cond) { … }
```

You can still cap with a constant `MAX` as defence against pathological inputs:

```glsl
const int MAX_ITER = 64;
for (int i = 0; i < MAX_ITER; i++) {
    if (i >= uCount) break;
    …
}
```

### Non-uniform sampler indexing — portability trap

```glsl
// ❌ Bad — undefined behaviour across vendors when uIdx varies per-fragment
uniform sampler2D uTex[4];
vec4 c = texture(uTex[uIdx], uv);

// ✅ Good — sample all four, select after
vec4 c0 = texture(uTex[0], uv);
vec4 c1 = texture(uTex[1], uv);
vec4 c2 = texture(uTex[2], uv);
vec4 c3 = texture(uTex[3], uv);
vec4 c  = uIdx == 0 ? c0 : (uIdx == 1 ? c1 : (uIdx == 2 ? c2 : c3));
```

ESSL 3.00 requires sampler-array index to be a **dynamically uniform** expression. Per-fragment indexing works on some drivers and silently breaks on others.

## Built-in Math & Bitwise Ops

ESSL 3.00 adds true integer math on top of the 1.00 surface.

### Integer ops (new)

```glsl
int  a = 0xFF & 0x0F;      // 0x0F
int  b = 1 << 4;           // 16
uint c = ~0u;              // 0xFFFFFFFF
int  d = a ^ 0xAA;         // bitwise xor
uint e = bitfieldExtract(value, 8, 4);   // built-in
int  f = findLSB(0x10);    // 4
int  g = bitCount(0xF0);   // 4
```

### Numerical built-ins still worth knowing

```glsl
float t = mix(a, b, w);                // lerp
float s = smoothstep(0.0, 1.0, x);
float c = clamp(v, 0.0, 1.0);          // no `saturate` — use clamp
vec3  r = reflect(I, N);
vec3  d = refract(I, N, eta);
mat3  m = inverse(transpose(M3));      // built-ins, not user math
```

## Anti-patterns

### Uninitialized variables

ESSL does not zero-initialize locals; reading before write is **undefined behaviour** even though the validator may accept it.

```glsl
// ❌ Bad — UB; may read register garbage
float acc;
for (int i = 0; i < N; i++) acc += sample(i);

// ✅ Good
float acc = 0.0;
for (int i = 0; i < N; i++) acc += sample(i);
```

### Relying on default sampler completeness

A non-mipmapped texture sampled through a `MIN_FILTER` that expects mipmaps reads `(0,0,0,1)` on most drivers. The validator never sees this — it's pure runtime.

```glsl
// Host-side fix: set TEXTURE_MIN_FILTER to LINEAR or NEAREST
// when the texture has only level 0. See writing-webgl2.
```

### Division by zero / negative-base `pow`

```glsl
// ❌ Bad — `0.0/0.0` is UB; `pow(negative, fractional)` is UB
float r = a / b;                       // when b can be 0
float r = pow(x, 0.5);                 // when x can be negative

// ✅ Good
float r = a / max(b, 1e-7);
float r = pow(max(x, 0.0), 0.5);       // or sqrt(max(x, 0.0))
```

### Integer overflow

`int` arithmetic wraps modulo 2^32 (highp) — fine if intended, a silent bug otherwise. Guard hash and index math.

```glsl
// ❌ Bad
int hash = a * 73856093 ^ b * 19349663;   // ~50% chance of wraparound

// ✅ Good — use uint, wrap is then spec-defined
uint hash = uint(a) * 73856093u ^ uint(b) * 19349663u;
```

## Performance

### Divergent branching

Adjacent threads taking different branches serialize on warp/wave GPUs. Cost grows with branch-body size, not branch count.

```glsl
// ❌ Bad — every wave splits in half
if ((int(gl_FragCoord.x) & 1) == 0) { heavyA(); } else { heavyB(); }

// ✅ Good — branch on a uniform; whole wave goes one way
if (uMode == 0) { heavyA(); } else { heavyB(); }

// ✅ Also good — branchless when bodies are cheap
vec4 c = mix(colorA, colorB, step(0.5, mask));
```

### Dependent texture reads

A `texture()` whose UV depends on the result of a prior `texture()` defeats prefetch. Reorder so the first read is independent of fragment-varying computations when possible, or pre-bake the indirection into a single LUT.

### Varying interpolation count

Each `out` from VS → `in` to FS consumes one varying slot AND interpolation HW. Pack small varyings:

```glsl
// ❌ Bad — three slots
out float v_a; out float v_b; out float v_c;

// ✅ Good — one slot
out vec3 v_abc;
```

### Computation vs. memory

A modern GPU executes ~10–50 ALU ops in the time a single uncached texture fetch returns. When in doubt, **compute** instead of looking up — except for sin/cos/trig on data, where a small LUT often wins.

### Mid-shader recompiles

A shader that branches on a uniform that takes only a handful of distinct values across draws is faster split into N permutations (one per value, no branch) than as one über-shader with a runtime `if`. Coordinate the permutation strategy with the host: see [`writing-webgl2` § Programs](../writing-webgl2/SKILL.md#programs--uniform-location-caching).
