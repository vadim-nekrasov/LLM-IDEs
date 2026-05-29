---
name: writing-webgl2
description: WebGL2 host JS/TS API — context creation, shader/program lifecycle, VAO/VBO/UBO, FBO/MRT/sRGB renderbuffers, texture upload, uniforms, draw calls, transform feedback, instanced rendering, async PBO readback, GPU-resource cleanup.
when_to_use: Triggers on edits to .ts/.js/.mjs/.cjs files that touch WebGL2 host APIs — WebGL2RenderingContext, getContext('webgl2'), gl.createShader/createProgram/compileShader/linkProgram, gl.createBuffer/bindBuffer/bufferData, gl.createVertexArray/bindVertexArray, gl.createFramebuffer/framebufferTexture2D, gl.createTexture/texImage2D/texStorage2D, gl.uniform*/getUniformLocation, gl.drawArrays/drawElements/drawArraysInstanced, gl.beginTransformFeedback, gl.fenceSync, gl.deleteProgram/deleteBuffer/deleteTexture cleanup. Skip on non-WebGL TS/JS edits — React components, Redux slices, plain utility modules. For the shader language see writing-glsl; for the WebGPU equivalent see writing-wgsl.
paths:
  - "**/*.ts"
  - "**/*.js"
  - "**/*.mjs"
  - "**/*.cjs"
---

# WebGL2 Host API Code Style

> **Working with ESLint + tsc on host WebGL2 code.** When editing a WebGL bootstrap module you may see existing warnings from older code — ignore them, fix only your own diff. Never run mass autofix on `.ts` files that bind GL state; eslint autofix has rewritten `null` ↔ `undefined` in places that broke `gl.bufferData(target, null, …)` allocate-vs-upload overloads. Editor per-file autofix on the file you are currently editing is fine.

## Contents

- [Scope & Coordination](#scope--coordination)
- [Migration from WebGL1](#migration-from-webgl1)
- [Context & Lifecycle](#context--lifecycle)
- [VAOs & Attribute State](#vaos--attribute-state)
- [Programs & Uniform-location Caching](#programs--uniform-location-caching)
- [Buffers (UBO, PBO, async readback)](#buffers-ubo-pbo-async-readback)
- [Framebuffers (FBO, MRT, sRGB, MS)](#framebuffers-fbo-mrt-srgb-ms)
- [Transform Feedback](#transform-feedback)
- [Extensions & Feature Detection](#extensions--feature-detection)
- [Anti-patterns](#anti-patterns)
- [Performance](#performance)

## Scope & Coordination

> Boundary frozen against ESLint + TypeScript as of 2026-05-30. `glslangValidator` is out of scope here — host JS does not contain GLSL text. When ESLint rules or TypeScript's GL type defs change, update the example rows below; the principle row defines the durable contract.

| Layer | Owns | Examples |
|---|---|---|
| **Principle** | static type/syntax → tsc + ESLint; runtime API misuse, state-machine bugs, perf → skill; UX / visual / architectural judgment → human review | — |
| ESLint + tsc | type errors, unused imports, unsafe `any`, missing-await, no-floating-promises, **legacy WebGL1 API calls** | wrong arg type to `gl.bufferData` → tsc; `getContext('webgl')` / `getExtension('OES_vertex_array_object'\|'ANGLE_instanced_arrays'\|…)` → ESLint `no-restricted-syntax` |
| This skill | WebGL state-machine bugs, sync-stall pitfalls, lifecycle, extension feature-detect, perf anti-patterns | sync `readPixels`, hot-path `getError`, mid-render compile, uniform-location at draw time, VAO state leak |
| Browser runtime | context-lost, `INVALID_OPERATION`, link failures, `FRAMEBUFFER_INCOMPLETE_*` | observed via `webglcontextlost`, `getError` at init, `KHR_parallel_shader_compile` polling, `checkFramebufferStatus` |
| Human review | architectural choice (immutable FBO vs. mutate), quality/perf trade | sRGB vs linear, MSAA sample count, instancing batch size |

> Sibling skill for the GLSL **shader text** side of the migration: [`writing-glsl`](../writing-glsl/SKILL.md). Pure TypeScript idioms outside WebGL are owned by [`writing-typescript`](../writing-typescript/SKILL.md) / [`writing-ecmascript`](../writing-ecmascript/SKILL.md).

## Migration from WebGL1

Use this section when porting an existing WebGL1 host file to WebGL2, or when reading legacy WebGL1 code. Shader-language changes are covered in [`writing-glsl` Migration](../writing-glsl/SKILL.md#migration-from-glsl-es-100).

### Cheat Sheet

The mechanical WebGL1 → WebGL2 calls — `getContext('webgl')` → `'webgl2'`, every `getExtension('OES_…' | 'ANGLE_…' | 'WEBGL_…')` whose target is now core (`OES_vertex_array_object`, `OES_element_index_uint`, `ANGLE_instanced_arrays`, `EXT_blend_minmax`, `WEBGL_draw_buffers`, `OES_texture_float`/`_half_float`, `EXT_frag_depth`, `EXT_shader_texture_lod`) — are caught by ESLint's `no-restricted-syntax` rules in `eslint.config.mjs` with a per-call message pointing at the new core API. New WebGL2-only additions worth knowing about: `gl.texStorage2D` + `texSubImage2D` (immutable storage) replaces mutable `texImage2D`; `gl.bindBufferBase(gl.UNIFORM_BUFFER, …)` introduces UBOs for hot-path uniform blocks. The semantic shifts (float-render-target feature-detect, PBO + `fenceSync` async readback, VAO state stickiness) that aren't mechanical are in [Gotchas](#gotchas) below.

### Gotchas

**Float-render-target capability is NOT automatic** — `RGBA16F` / `RGBA32F` storage is core, but RENDERING into it still requires `EXT_color_buffer_float`. Without the extension, `checkFramebufferStatus` returns `FRAMEBUFFER_INCOMPLETE_ATTACHMENT`.
```ts
// ❌ Bad — FRAMEBUFFER_INCOMPLETE_ATTACHMENT on most GPUs
const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA16F, w, h);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

// ✅ Good — feature-detect first
if (!gl.getExtension('EXT_color_buffer_float')) {
  throw new Error('Float render targets unsupported on this device');
}
// …then create + attach as above.
```

**`readPixels` is the wrong tool for GPU→CPU readback** — it stalls the pipeline. Use a PBO + `fenceSync` (the pattern matches the host's `shadow-kernel` style).
```ts
// ❌ Bad — full pipeline stall, 5–20 ms frame-time spike
const pixels = new Uint8Array(w * h * 4);
gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

// ✅ Good — async via PBO + fence; resolves on a later RAF
const pbo = gl.createBuffer();
gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
gl.bufferData(gl.PIXEL_PACK_BUFFER, w * h * 4, gl.STREAM_READ);
gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, 0);  // 0 = offset into PBO
gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
// On a later frame: poll until gl.clientWaitSync(sync, 0, 0) !== gl.TIMEOUT_EXPIRED,
// then bindBuffer + getBufferSubData(PIXEL_PACK_BUFFER, 0, dst), then deleteSync + deleteBuffer.
```

**VAO state is sticky** — leaving a VAO bound across draw calls leaks its attrib bindings into the next call.
```ts
// ❌ Bad — next unrelated draw inherits this VAO's state
gl.bindVertexArray(meshVAO);
gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, 0);
// …other code runs, then a different draw uses leaked state

// ✅ Good — unbind after each logical draw group
gl.bindVertexArray(meshVAO);
gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, 0);
gl.bindVertexArray(null);
```

## Context & Lifecycle

```ts
const gl = canvas.getContext('webgl2', {
  antialias: false,                 // MSAA on the default FBO; prefer offscreen MSAA renderbuffers
  alpha: true,                      // false saves a composite if you fully cover the canvas
  premultipliedAlpha: true,         // default; matches CSS composition
  preserveDrawingBuffer: false,     // true is a perf trap unless you need screenshots
  powerPreference: 'high-performance',
  failIfMajorPerformanceCaveat: false,
});
if (!gl) throw new Error('WebGL2 not supported');
```

### Context-lost / restored

Mobile suspend, GPU resets, and crashes raise `webglcontextlost`. Everything WebGL owns (textures, buffers, programs, framebuffers, sync objects) is invalid afterwards.

```ts
canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();   // signals "I want it back" — without this, no restored event
  // Stop the render loop; mark all GL handles as null.
});
canvas.addEventListener('webglcontextrestored', () => {
  // Re-compile programs, re-upload textures, re-create buffers, re-link FBOs.
});
```

A render loop that doesn't gate on a `contextAlive` flag will silently hammer no-op draws after a loss and waste battery.

## VAOs & Attribute State

In WebGL2 a Vertex Array Object captures: enabled attrib slots, attrib pointer (offset / stride / type), divisor, and the bound `ELEMENT_ARRAY_BUFFER`. It does NOT capture the bound `ARRAY_BUFFER` (each `vertexAttribPointer` call reads it implicitly into the VAO state, which is the WebGL1 trap that VAOs fix).

```ts
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);   // captured in VAO

gl.bindVertexArray(null);   // close the recording

// Per-frame:
gl.bindVertexArray(vao);
gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, 0);
gl.bindVertexArray(null);   // unbind — see Migration Gotchas
```

One VAO per draw-call permutation; switching VAOs is cheap. Rebuilding attribute state on every draw (the WebGL1 pattern) is the single biggest CPU-side perf hit when porting.

## Programs & Uniform-location Caching

### Cache locations at link time

`getUniformLocation` walks the program's reflection table — fine at init, catastrophic at draw time.

```ts
// ❌ Bad — every frame, for every uniform
gl.uniform4f(gl.getUniformLocation(program, 'u_color'), r, g, b, 1);

// ✅ Good — cache once after link
const loc = {
  uColor:   gl.getUniformLocation(program, 'u_color'),
  uModel:   gl.getUniformLocation(program, 'u_model'),
  uTexture: gl.getUniformLocation(program, 'u_texture'),
};
// Per-frame:
gl.uniform4f(loc.uColor, r, g, b, 1);
```

### Async compile / link

`KHR_parallel_shader_compile` lets the driver compile on background threads. Without it, the first draw after `linkProgram` blocks until compile finishes — 10–200 ms per program is common.

```ts
const ext = gl.getExtension('KHR_parallel_shader_compile');
gl.linkProgram(program);

if (ext) {
  // Poll on later frames instead of stalling now:
  const isReady = () => gl.getProgramParameter(program, ext.COMPLETION_STATUS_KHR);
  // …schedule first draw once isReady() returns true.
} else {
  // Safe to call getProgramParameter(LINK_STATUS) — accept the stall.
}
```

Inspecting `LINK_STATUS` or `getProgramInfoLog` BEFORE the async compile completes forces the stall it was meant to avoid. Only call those on the failure path.

## Buffers (UBO, PBO, async readback)

### UBO — uniform blocks

Pair with `layout(std140) uniform Frame { … }` in the shader (see [`writing-glsl` § UBOs](../writing-glsl/SKILL.md#ubos--std140-layout) for std140 padding rules).

```ts
const FRAME_BINDING = 0;
const ubo = gl.createBuffer();
gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
gl.bufferData(gl.UNIFORM_BUFFER, frameLayoutSize, gl.DYNAMIC_DRAW);

// Wire the program's `Frame` block to binding 0:
const blockIndex = gl.getUniformBlockIndex(program, 'Frame');
gl.uniformBlockBinding(program, blockIndex, FRAME_BINDING);

// Bind the buffer to that binding point (once at setup):
gl.bindBufferBase(gl.UNIFORM_BUFFER, FRAME_BINDING, ubo);

// Per-frame update:
gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
gl.bufferSubData(gl.UNIFORM_BUFFER, 0, frameDataF32);
```

One UBO swap can replace 10+ `gl.uniform*` calls — the CPU win compounds across draws sharing the same block.

### PBO — async readback (full pattern)

```ts
function startReadback(gl: WebGL2RenderingContext, w: number, h: number) {
  const pbo = gl.createBuffer();
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
  gl.bufferData(gl.PIXEL_PACK_BUFFER, w * h * 4, gl.STREAM_READ);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, 0);
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();                              // ensures the GPU starts the work this frame
  return { pbo, sync, w, h };
}

function pollReadback(gl: WebGL2RenderingContext, job: ReturnType<typeof startReadback>) {
  const status = gl.clientWaitSync(job.sync, 0, 0);   // 0 timeout = non-blocking
  if (status === gl.TIMEOUT_EXPIRED) return null;     // try next frame
  if (status === gl.WAIT_FAILED) { /* cleanup, surface error */ return null; }

  const dst = new Uint8Array(job.w * job.h * 4);
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, job.pbo);
  gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, dst);
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
  gl.deleteSync(job.sync);
  gl.deleteBuffer(job.pbo);
  return dst;
}
```

### Buffer hint cheat sheet

| Usage | Hint |
|---|---|
| Per-frame uniform block | `DYNAMIC_DRAW` |
| Per-frame instance data | `STREAM_DRAW` |
| Static mesh | `STATIC_DRAW` |
| PBO target for readback | `STREAM_READ` |
| Transform-feedback dest | `STATIC_COPY` |

## Framebuffers (FBO, MRT, sRGB, MS)

### Immutable storage + completeness check

```ts
function makeColorFBO(gl: WebGL2RenderingContext, w: number, h: number) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, w, h);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`FBO incomplete: 0x${status.toString(16)}`);
  }
  return { fbo, tex };
}
```

`texStorage2D` is **immutable** — size and internal format are locked at creation. Resizing means deleting and re-creating. Compared to `texImage2D`, immutable textures skip per-mip re-validation and let the driver place storage optimally.

### MRT — multiple render targets

```ts
gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTex,  0);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, normalTex, 0);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, idTex,     0);

gl.drawBuffers([
  gl.COLOR_ATTACHMENT0,
  gl.COLOR_ATTACHMENT1,
  gl.COLOR_ATTACHMENT2,
]);
```

Pair with `layout(location=N) out vec4 …` in the fragment shader; slot N matches the position in the `drawBuffers` array.

### sRGB framebuffers

Render INTO `gl.SRGB8_ALPHA8`-storage textures and sampling automatically does the linear→sRGB conversion on write. Reading samples them back as linear. This is the correct way to do gamma — applying `pow(c, 2.2)` in the shader is the WebGL1 hack.

### Multisample renderbuffers

```ts
const rb = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, w, h);   // 4× MSAA
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rb);

// Later, resolve to a single-sample texture FBO for sampling:
gl.bindFramebuffer(gl.READ_FRAMEBUFFER, msFBO);
gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, resolveFBO);
gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST);
```

Renderbuffers are write-only; if you need to sample the result, blit to a texture FBO first.

## Transform Feedback

Capture vertex-shader outputs into a buffer — useful for GPU particle updates, GPU skinning bake-out, and any "compute via vertex shader" pattern.

```ts
// 1. Mark the varyings to capture BEFORE linkProgram:
gl.transformFeedbackVaryings(program, ['v_position', 'v_velocity'], gl.INTERLEAVED_ATTRIBS);
gl.linkProgram(program);

// 2. Bind output buffer(s):
const outBuf = gl.createBuffer();
gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, outBuf);
gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, byteSize, gl.STATIC_COPY);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, outBuf);

// 3. Disable rasterizer if you don't need fragments:
gl.enable(gl.RASTERIZER_DISCARD);
gl.beginTransformFeedback(gl.POINTS);
gl.drawArrays(gl.POINTS, 0, count);
gl.endTransformFeedback();
gl.disable(gl.RASTERIZER_DISCARD);
```

For long-lived TF setups, wrap the capture state in a `gl.createTransformFeedback()` object so you can bind/unbind the whole capture context in one call.

## Extensions & Feature Detection

| Extension | What it adds | When to require |
|---|---|---|
| `EXT_color_buffer_float` | Render INTO float color attachments | Any FP16 / FP32 offscreen pass |
| `EXT_disjoint_timer_query_webgl2` | GPU-time `queryCounter` | Profiling builds (gated, not always on) |
| `EXT_texture_filter_anisotropic` | `TEXTURE_MAX_ANISOTROPY_EXT` | Oblique sampling quality |
| `OES_draw_buffers_indexed` | Per-MRT-slot blend state | Advanced compositing |
| `KHR_parallel_shader_compile` | Async compile (no sync stall) | Always — feature-detect, fall back to sync |
| `WEBGL_lose_context` | Programmatic context loss in tests | Test harness only |

```ts
const ext = gl.getExtension('EXT_color_buffer_float');
if (!ext) {
  // Either fall back (RGBA8 + manual encoding) or surface a clear error to the user.
}
```

Capability detect at init, cache the result, never call `getExtension` per frame.

## Anti-patterns

### Synchronous `readPixels` in the render loop

Already covered as a Migration gotcha — the right pattern is PBO + `fenceSync`.

### `getError` in the hot path

```ts
// ❌ Bad — every getError forces a CPU↔GPU sync
gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_INT, 0);
const err = gl.getError();
if (err) console.warn(err);

// ✅ Good — check once at init, in dev builds only
if (DEV) {
  const err = gl.getError();
  if (err) throw new Error(`GL error at init: 0x${err.toString(16)}`);
}
```

`getError` returns the FIRST error since the last call, so polling every frame both stalls AND masks all but the first error per frame.

### Uniform-location lookup at draw time

Cache them at link time. See [Programs & Uniform-location Caching](#programs--uniform-location-caching).

### Mid-render shader compile / link

Every program compile / link forces a sync the first time the program is used. Compile all programs at init or behind a loading screen; never on the first frame they're needed for.

### Redundant state changes

```ts
// ❌ Bad — every draw re-issues the same blend state
function draw() {
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.drawElements(…);
}

// ✅ Good — track state, only emit deltas
const state = { blend: false, blendFunc: '' };
function setBlend(on: boolean, src?: number, dst?: number) {
  if (on !== state.blend) { on ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND); state.blend = on; }
  const key = `${src},${dst}`;
  if (on && key !== state.blendFunc) { gl.blendFunc(src!, dst!); state.blendFunc = key; }
}
```

### Mutating immutable storage

`texSubImage2D` updates a region of `texStorage2D` storage; `texImage2D` re-allocates and is rejected on an immutable texture. The error surfaces only at runtime — tsc cannot catch the misuse.

## Performance

### One context, many canvases

`getContext('webgl2')` on a second canvas inside the same page is supported but each context has its own resources and synchronization cost. For multi-view UIs, prefer a single context that renders into multiple offscreen FBOs blitted to multiple canvases.

### Instancing > draw-call batching

```ts
// One draw call, N instances:
gl.vertexAttribDivisor(2, 1);    // attrib 2 = per-instance transform
gl.drawElementsInstanced(gl.TRIANGLES, idxCount, gl.UNSIGNED_INT, 0, instanceCount);
```

CPU-side cost is roughly `O(draw_calls + total_instances/100)` — driving 1000 trees through `drawElementsInstanced` is cheaper than 1000 individual draws by 10–100×.

### Minimize FBO switches

`bindFramebuffer` is one of the more expensive state changes in WebGL2. When two passes can share an FBO (e.g. ping-pong over different attachment slots), do — switching between two FBOs every pass is the classic perf trap.

### Pre-allocate TypedArrays

```ts
// ❌ Bad — allocates per frame
gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array([...mat, time, …]));

// ✅ Good — pre-allocate, write in place
const frameBuf = new Float32Array(FRAME_FLOATS);
function updateFrame(…) {
  frameBuf.set(mat, 0);
  frameBuf[16] = time;
  gl.bufferSubData(gl.UNIFORM_BUFFER, 0, frameBuf);
}
```

GC pauses caused by per-frame allocations show up as 5–20 ms stalls every few seconds.

### Profile with GPU time, not RAF time

```ts
const tq = gl.getExtension('EXT_disjoint_timer_query_webgl2');
if (tq) {
  const q = gl.createQuery();
  gl.beginQuery(tq.TIME_ELAPSED_EXT, q);
  drawPass();
  gl.endQuery(tq.TIME_ELAPSED_EXT);
  // On a later frame: gl.getQueryParameter(q, gl.QUERY_RESULT) is GPU ns.
}
```

RAF time conflates CPU + GPU + compositor — only GPU time tells you whether you're shader-bound or driver-bound.

### Shader permutations over über-shaders

Cross-reference [`writing-glsl` § Performance / Mid-shader recompiles](../writing-glsl/SKILL.md#performance) — coordinate the permutation strategy: N small linked programs are cheaper at draw time than one über-shader with runtime branches on uniforms that only take a handful of values.
