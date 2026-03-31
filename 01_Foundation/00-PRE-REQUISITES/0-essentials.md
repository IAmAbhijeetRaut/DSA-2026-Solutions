# JAVASCRIPT FUNDAMENTALS — COMPLETE GUIDE (BASICS TO ADVANCED)
### ENGINE-LEVEL EXPANDED EDITION

> **Pre-requisite reading for DSA.** This file covers everything you need to know about JavaScript as a language — from how the engine runs your code, to variables, types, memory, functions, closures, and advanced internals. Read this BEFORE `essentials-1.md` (methods) and `essentials-2.md` (OOP).

---

## TABLE OF CONTENTS

1. [JavaScript Engine & Runtime](#1-javascript-engine--runtime)
2. [Variables & Declarations](#2-variables--declarations)
3. [Data Types Deep Dive](#3-data-types-deep-dive)
4. [Memory Model: Stack vs Heap](#4-memory-model-stack-vs-heap)
5. [Type Coercion, Truthy/Falsy & Equality](#5-type-coercion-truthyfalsy--equality)
6. [Operators](#6-operators-arithmetic-logical-bitwise)
7. [Control Flow & Loops](#7-control-flow--loops)
8. [Functions: The Complete Picture](#8-functions-the-complete-picture)
9. [Scope, Closures & Lexical Environment](#9-scope-closures--lexical-environment)
10. [Hoisting & Temporal Dead Zone](#10-hoisting--temporal-dead-zone)
11. [Pass by Value vs Reference & Copying](#11-pass-by-value-vs-reference--copying)
12. [Error Handling](#12-error-handling)
13. [JSON, Regular Expressions & Template Literals](#13-json-regular-expressions--template-literals)
14. [Advanced Topics](#14-advanced-topics)

---

## 1. JavaScript Engine & Runtime

### 1.1 What Is JavaScript?

JavaScript is a **high-level, single-threaded, dynamically-typed, interpreted/JIT-compiled** programming language. Every browser has a JavaScript engine that reads, compiles, and executes your code.

```text
YOUR CODE (.js)
     │
     ▼
┌──────────────────────────────────────────────────────┐
│                   JAVASCRIPT ENGINE                   │
│                                                      │
│  ┌──────────┐    ┌───────────┐    ┌───────────────┐  │
│  │  Parser  │───▶│    AST    │───▶│   Interpreter │  │
│  │(Lexing + │    │(Abstract  │    │  (Ignition)   │  │
│  │ Parsing) │    │ Syntax    │    │  Bytecode     │  │
│  └──────────┘    │ Tree)     │    └───────┬───────┘  │
│                  └───────────┘            │          │
│                                    HOT CODE?         │
│                                     YES │            │
│                                 ┌───────▼───────┐    │
│                                 │   Optimizing  │    │
│                                 │   Compiler    │    │
│                                 │  (TurboFan)   │    │
│                                 │  Machine Code │    │
│                                 └───────────────┘    │
│                                                      │
│   Examples:  V8 (Chrome/Node)    SpiderMonkey (FF)   │
│              JavaScriptCore (Safari)                 │
└──────────────────────────────────────────────────────┘
```

**Key facts:**
- JavaScript is **NOT** Java. They share the name for marketing reasons (1995).
- JavaScript is **single-threaded** — it can execute only ONE piece of code at a time.
- Modern engines (V8, SpiderMonkey) use **JIT compilation** — they interpret code first, then compile frequently-executed ("hot") code to optimized machine code.

---

>>> 🧠 INTERNALS: THE FULL V8 PIPELINE

The diagram above shows a simplified view. Here is the complete V8 pipeline:

```text
SOURCE CODE
    │
    ▼
[Scanner / Tokenizer]
    │  Converts raw text → tokens (keywords, identifiers, literals, punctuation)
    │  e.g., "let x = 5" → [LET, IDENTIFIER(x), ASSIGN, NUMBER(5), SEMICOLON]
    ▼
[Parser]
    │  Tokens → Abstract Syntax Tree (AST)
    │  Two parsers in V8:
    │    • Eager parser: fully parses code that runs immediately
    │    • Lazy parser (pre-parser): skips function bodies not called at startup
    │      (saves time — most functions are never called on initial load)
    ▼
[AST]
    │  e.g., VariableDeclaration { kind: "let", id: Identifier(x), init: Literal(5) }
    ▼
[Ignition — Bytecode Interpreter]
    │  AST → compact bytecode (NOT machine code yet)
    │  Bytecode is 25-50% smaller than machine code → faster startup, less memory
    │  Ignition collects "type feedback" while executing
    │  (Which types are actually passed to this function?)
    ▼
[Profiler / Type Feedback Collector]
    │  Tracks: "add() was called 10,000 times with integers — it's hot"
    ▼
[TurboFan — Optimizing JIT Compiler]
    │  Takes bytecode + type feedback → highly optimized machine code
    │  Assumptions: "x is always an integer" → remove type checks
    ▼
[Optimized Machine Code]
    │  Runs as fast as C++ for the happy path
    ▼
[Deoptimization Guard]
    │  If assumption breaks (x is suddenly a string) → DEOPTIMIZE
    │  Throw away machine code, fall back to Ignition bytecode
    │  (Deoptimization is expensive — avoid it!)
```

**Why does this matter for your code?**
- Writing predictable, consistent types makes TurboFan's job easy → faster code
- Mixing types (passing strings sometimes, numbers other times to the same function) causes deoptimization

---

>>> ⚡ PERFORMANCE: HIDDEN CLASSES (V8 SHAPES)

V8 uses a concept called **hidden classes** (also called "shapes" or "maps" internally) to optimize object property access. This is critical for writing performant code.

```javascript
// ✅ GOOD — V8 assigns ONE hidden class for both objects
function Point(x, y) {
  this.x = x;
  this.y = y;
}
const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
// p1 and p2 share the SAME hidden class → V8 caches property offsets
// Property access is as fast as a C++ struct offset lookup!

// ❌ BAD — Different hidden classes created
const obj1 = {};
obj1.x = 1;
obj1.y = 2;

const obj2 = {};
obj2.y = 1;  // Different initialization order!
obj2.x = 2;

// obj1 and obj2 have DIFFERENT hidden classes because properties
// were added in different orders → V8 can't optimize uniformly
```

**Hidden class transitions:**
```text
  {} ──── add .x ────▶ HiddenClass_A { x }
                              │
                        add .y
                              │
                              ▼
                       HiddenClass_B { x, y }

  Both p1 and p2 follow the SAME transition chain → SHARED hidden class ✅
```

**Rule of thumb:**
1. Always initialize all properties in the constructor
2. Always initialize in the same order
3. Avoid adding properties dynamically after construction
4. Avoid `delete` on objects (it causes hidden class transitions)

---

>>> 🔍 DEEP DIVE: INLINE CACHING (IC)

Inline caching is why repeated property access is fast in V8:

```javascript
function getX(point) {
  return point.x;  // First call: slow lookup, cache the result
                   // Subsequent calls with same hidden class: instant!
}

getX(p1); // MISS: look up 'x' on HiddenClass_B, cache offset
getX(p2); // HIT: same hidden class → use cached offset directly
getX({ x: 5, y: 6, z: 7 }); // MISS: different hidden class → POLYMORPHIC IC
```

**IC States:**
- **Uninitialized:** First time — slow
- **Monomorphic:** All calls use same hidden class — fastest
- **Polymorphic:** 2–4 different hidden classes — still fast
- **Megamorphic:** 5+ different hidden classes — falls back to slow lookup, never caches

---

### 1.2 Execution Context

Everything in JavaScript runs inside an **Execution Context**. It is the environment where your code is evaluated and executed.

**Two types of execution context:**

| Type | Created When | Contains |
|:-----|:-------------|:---------|
| **Global Execution Context (GEC)** | Script starts running | Global object (`window`/`globalThis`), `this`, variable environment |
| **Function Execution Context (FEC)** | A function is **called** | Local variables, `arguments`, `this`, reference to outer scope |

---

>>> 🧠 INTERNALS: EXECUTION CONTEXT FULL ANATOMY (ECMAScript Spec)

The ECMAScript specification defines an Execution Context as having these components:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    EXECUTION CONTEXT                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Code Evaluation State                                   │   │
│  │  (Used to pause/resume execution — generators, async)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Function (if FEC)                                       │   │
│  │  The function object that caused this EC to be created  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Realm                                                   │   │
│  │  The set of built-ins, global object — each iframe/     │   │
│  │  worker has its own Realm                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LexicalEnvironment                                      │   │
│  │  Where let/const/function declarations live             │   │
│  │  [ Environment Record | outer reference ]               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  VariableEnvironment                                     │   │
│  │  Where var declarations live                             │   │
│  │  (Same as LexicalEnvironment in most cases,             │   │
│  │   BUT separate for eval() and with statements)          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ThisBinding                                             │   │
│  │  The current value of `this`                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Why LexicalEnvironment vs VariableEnvironment?**
- In a normal function, both point to the same Environment Record
- They diverge in `eval()` and legacy `with` statements
- `let`/`const` bindings are always added to LexicalEnvironment
- `var` bindings are added to VariableEnvironment (function scope)
- This is why `var` in a block is visible throughout the function but `let` is not

---

### 1.3 The Two Phases of Execution

Every execution context goes through **two phases**:

```text
┌─────────────────────────────────────────────────────────────────┐
│                    EXECUTION CONTEXT                            │
│                                                                 │
│  PHASE 1: CREATION (Memory Allocation)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Create the Variable Object (VO / Environment Record) │  │
│  │     • var declarations → allocated, set to undefined      │  │
│  │     • let/const declarations → allocated, UNINITIALIZED   │  │
│  │     • function declarations → allocated, set to FULL fn   │  │
│  │  2. Create the Scope Chain                                │  │
│  │  3. Determine the value of `this`                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  PHASE 2: EXECUTION (Code Runs Line by Line)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Assign values to variables                            │  │
│  │  2. Execute function calls                                │  │
│  │  3. Run all statements                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Example — watch the two phases in action:**

```javascript
console.log(x);     // Output: undefined  (var is hoisted, set to undefined in creation phase)
console.log(y);     // ReferenceError!    (let is hoisted but UNINITIALIZED — TDZ)
console.log(greet); // Output: [Function: greet]  (function declaration fully hoisted)

var x = 10;
let y = 20;
function greet() { return "hello"; }
```

```text
CREATION PHASE memory snapshot:
┌──────────────────────────┐
│  x        → undefined    │  ← var: allocated + set to undefined
│  y        → <TDZ>        │  ← let: allocated but UNINITIALIZED
│  greet    → function(){} │  ← function: fully stored
└──────────────────────────┘

EXECUTION PHASE (line by line):
  Line 1: console.log(x)     → reads x → finds undefined → prints undefined
  Line 2: console.log(y)     → reads y → still in TDZ → ReferenceError!
  Line 3: (never reached due to error above)
  Line 5: x = 10             → assigns 10 to x
  Line 6: y = 20             → initializes y to 20 (exits TDZ)
```

---

>>> 🔍 DEEP DIVE: ENVIRONMENT RECORDS (SPEC-LEVEL)

The ECMAScript spec defines multiple types of Environment Records:

```text
EnvironmentRecord (abstract base)
    │
    ├── DeclarativeEnvironmentRecord
    │       Used for: let, const, function, class, import
    │       ├── FunctionEnvironmentRecord
    │       │       Used for: function calls
    │       │       Adds: arguments object, this binding, super
    │       └── ModuleEnvironmentRecord
    │               Used for: ES6 modules (import/export)
    │
    └── ObjectEnvironmentRecord
            Used for: global scope (window object), with statement
            Bindings live on an actual object, not an internal record
```

**Why this matters:**
- `var` in global scope → added to ObjectEnvironmentRecord → becomes `window.x` (browser)
- `let`/`const` in global scope → added to DeclarativeEnvironmentRecord → NOT on `window`
- This explains the `var`/`let` global object behavior in the comparison table

```javascript
var a = 1;
let b = 2;

console.log(window.a); // 1  — var is in the global Object ER
console.log(window.b); // undefined — let is in the Declarative ER
```

---

### 1.4 The Call Stack

The **Call Stack** is how JavaScript keeps track of "where am I currently executing?" It is a **LIFO (Last In, First Out)** data structure.

```javascript
function first() {
    console.log("first start");
    second();
    console.log("first end");
}

function second() {
    console.log("second start");
    third();
    console.log("second end");
}

function third() {
    console.log("third");
}

first();
```

**Call Stack visualization (step by step):**

```text
Step 1: Script starts         Step 2: first() called       Step 3: second() called
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │          │  third()        │ ← TOP
│                 │          │                 │          │  second()       │
│                 │          │  first()        │ ← TOP   │  first()        │
│  Global         │ ← TOP   │  Global         │          │  Global         │
└─────────────────┘          └─────────────────┘          └─────────────────┘

Step 4: third() done          Step 5: second() done        Step 6: first() done
┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │          │                 │
│  second()       │ ← TOP   │                 │          │                 │
│  first()        │          │  first()        │ ← TOP   │                 │
│  Global         │          │  Global         │          │  Global         │ ← TOP
└─────────────────┘          └─────────────────┘          └─────────────────┘
```

**Output:**
```
first start
second start
third
second end
first end
```

**Key rules of the Call Stack:**
1. The **Global Execution Context** is always at the bottom.
2. When a function is **called**, a new execution context is **pushed** onto the stack.
3. When a function **returns**, its context is **popped** off the stack.
4. JavaScript always executes the context at the **top** of the stack.
5. If the stack grows too deep (e.g., infinite recursion), you get a **Stack Overflow** error.

```javascript
// Stack Overflow example
function infinite() {
    infinite();  // calls itself forever
}
infinite();  // RangeError: Maximum call stack size exceeded
```

---

>>> 🔍 DEEP DIVE: WHAT'S ACTUALLY STORED ON THE CALL STACK FRAME?

Each frame on the call stack is NOT just a function name — it contains:

```text
┌──────────────────────────────────────────────────────────┐
│  STACK FRAME for: second()                               │
│                                                          │
│  Return Address: (line in first() after second() call)  │
│  Local Variables: (values of let/var in this function)  │
│  Parameters: (copies of primitive args, refs for objs)  │
│  Saved Registers: (CPU state to restore on return)      │
│  'this' binding: (the value of `this` in this call)     │
│  Reference to Outer Scope (LexicalEnvironment pointer)  │
└──────────────────────────────────────────────────────────┘
```

**Stack size limits (approximate):**
- Chrome/V8: ~10,000–15,000 frames (depends on frame size)
- Firefox/SpiderMonkey: ~25,000 frames
- Node.js: ~10,000–15,000 frames

**Tail Call Optimization (TCO):**  
ES6 specifies that engines *should* optimize "tail calls" (when a function's last action is calling another function) by reusing the current frame instead of creating a new one. In practice, only JavaScriptCore (Safari) implements this. V8 and SpiderMonkey do NOT implement TCO.

```javascript
// Tail-recursive factorial (optimizable in theory, not in V8)
function factorial(n, acc = 1) {
    if (n <= 1) return acc;
    return factorial(n - 1, n * acc);  // tail call — last operation is the call
}
```

---

>>> ⚠️ EDGE CASE: SAME FUNCTION ON THE STACK MULTIPLE TIMES

Each call creates a **new** execution context. Variables from one call do NOT bleed into another.

```javascript
function count(n) {
    if (n === 0) return;
    console.log(n);
    count(n - 1);
    console.log(n + " again");  // Each frame has its own `n`
}
count(3);
// 3, 2, 1, "1 again", "2 again", "3 again"
```

---

### 1.5 Single-Threaded but Non-Blocking

JavaScript is single-threaded — only one call stack, one thing at a time. But it can still handle asynchronous operations (timers, network requests) because the **runtime** provides extra machinery:

```text
┌──────────────────────────────────────────────────────────────────┐
│                     JAVASCRIPT RUNTIME                           │
│                                                                  │
│  ┌────────────────┐     ┌─────────────────────────────────────┐  │
│  │   CALL STACK   │     │          WEB APIs / Node APIs       │  │
│  │                │     │  (setTimeout, fetch, DOM events,    │  │
│  │  [currently    │     │   file I/O — provided by the        │  │
│  │   executing    │     │   environment, NOT by JS itself)    │  │
│  │   code]        │     └─────────────┬───────────────────────┘  │
│  └───────┬────────┘                   │                          │
│          │                            │ callback ready           │
│          │                   ┌────────▼────────┐                 │
│          │                   │  CALLBACK QUEUE  │                 │
│          │                   │  (Task Queue)    │                 │
│          │                   └────────┬─────────┘                │
│          │                            │                          │
│          │         ┌──────────────────▼──────────┐               │
│          ◄─────────┤      EVENT LOOP             │               │
│                    │  "Is the call stack empty?" │               │
│                    │  YES → move callback to     │               │
│                    │        the call stack        │               │
│                    └─────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────┘
```

```javascript
console.log("1");

setTimeout(() => {
    console.log("2");
}, 0);

console.log("3");

// Output: 1, 3, 2
// Why? setTimeout's callback goes to the queue. The event loop
// only moves it to the call stack AFTER the current code finishes.
```

**The event loop checks:** "Is the call stack empty?" → If YES, it picks the next callback from the queue and pushes it onto the stack.

---

>>> 🧠 INTERNALS: THE COMPLETE EVENT LOOP — MICROTASKS vs MACROTASKS

The diagram above is simplified. There are actually **two** separate queues:

```text
┌──────────────────────────────────────────────────────────────────────┐
│                       COMPLETE EVENT LOOP                            │
│                                                                      │
│  ┌─────────────┐                                                     │
│  │ CALL STACK  │ ◄─── Event Loop picks tasks from queues here       │
│  └──────┬──────┘                                                     │
│         │ empty?                                                      │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  STEP 1: DRAIN the MICROTASK QUEUE (completely empty it)        │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │  Microtask Queue                                         │   │ │
│  │  │  • Promise .then() / .catch() / .finally() callbacks    │   │ │
│  │  │  • queueMicrotask()                                      │   │ │
│  │  │  • MutationObserver callbacks                           │   │ │
│  │  │  • async/await (each `await` continuation)              │   │ │
│  │  │                                                          │   │ │
│  │  │  RULE: Run ALL microtasks before moving to macrotasks.  │   │ │
│  │  │        If a microtask queues another microtask, it      │   │ │
│  │  │        runs BEFORE any macrotask!                       │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│         │ microtask queue empty                                       │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  STEP 2: PICK ONE task from the MACROTASK QUEUE                 │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │  Macrotask Queue (Task Queue)                            │   │ │
│  │  │  • setTimeout / setInterval callbacks                   │   │ │
│  │  │  • I/O callbacks (fetch, file read)                     │   │ │
│  │  │  • UI rendering (browser: between each task)            │   │ │
│  │  │  • setImmediate (Node.js only)                          │   │ │
│  │  │  • MessageChannel callbacks                             │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│         │ one macrotask run                                           │
│         └──── go back to STEP 1 (drain microtasks again)             │
└──────────────────────────────────────────────────────────────────────┘
```

**Critical ordering rule:**

```javascript
console.log("1 — synchronous");

setTimeout(() => console.log("2 — macrotask"), 0);

Promise.resolve()
  .then(() => console.log("3 — microtask 1"))
  .then(() => console.log("4 — microtask 2"));

queueMicrotask(() => console.log("5 — microtask 3"));

console.log("6 — synchronous");

// Output ORDER:
// 1 — synchronous
// 6 — synchronous
// 3 — microtask 1     ← ALL microtasks run before any macrotask
// 4 — microtask 2
// 5 — microtask 3
// 2 — macrotask       ← macrotask runs last
```

**Why this matters in practice:**

```javascript
// React's setState is batched using microtasks (React 18+)
// Sequencing fetch + DOM update? Promise .then() always runs before setTimeout
// Infinite microtask loops STARVE the macrotask queue (and rendering!):

function starveUI() {
  Promise.resolve().then(starveUI); // Never yields to rendering!
}
starveUI(); // Page freezes
```

---

>>> ⚠️ EDGE CASE: Node.js HAS ADDITIONAL QUEUES

Node.js adds more phases to the event loop via libuv:

```text
Node.js Event Loop Phases (each phase has its OWN callback queue):

   ┌──────────────────────────────────────────┐
   │  timers phase                             │  setTimeout, setInterval
   │  pending callbacks phase                 │  I/O errors from previous tick
   │  idle, prepare phase (internal)          │
   │  poll phase                              │  I/O callbacks (most things)
   │  check phase                             │  setImmediate callbacks
   │  close callbacks phase                   │  socket.on('close', ...)
   └──────────────────────────────────────────┘
   
   Between EVERY phase: drain process.nextTick() queue
   Then: drain Promise microtask queue
   
process.nextTick() callbacks run BEFORE Promise microtasks!
```

```javascript
// Node.js specific ordering
setImmediate(() => console.log("setImmediate"));
setTimeout(() => console.log("setTimeout 0"), 0);
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("Promise"));

// Output in Node.js:
// nextTick       ← process.nextTick runs before Promises
// Promise        ← microtask
// setTimeout 0   ← macrotask (timers phase)
// setImmediate   ← check phase (after poll)
```

---

## 2. Variables & Declarations

### 2.1 The Three Ways to Declare Variables

JavaScript has three keywords for variable declaration: `var`, `let`, and `const`.

```javascript
var oldWay = "I'm function-scoped";      // ES5 (1999) — avoid in modern code
let modern = "I'm block-scoped";          // ES6 (2015) — use for values that change
const fixed = "I'm block-scoped + fixed"; // ES6 (2015) — use for values that don't change
```

### 2.2 var vs let vs const — Complete Comparison

| Feature | `var` | `let` | `const` |
|:--------|:------|:------|:--------|
| **Scope** | Function scope | Block scope `{}` | Block scope `{}` |
| **Hoisting** | ✅ Hoisted, initialized as `undefined` | ✅ Hoisted, but **uninitialized** (TDZ) | ✅ Hoisted, but **uninitialized** (TDZ) |
| **Re-declaration** | ✅ Allowed (same scope) | ❌ SyntaxError | ❌ SyntaxError |
| **Re-assignment** | ✅ Allowed | ✅ Allowed | ❌ TypeError |
| **Global object property** | ✅ `var x` creates `window.x` | ❌ No | ❌ No |

### 2.3 Scope: Function vs Block

```javascript
// VAR — function-scoped (ignores blocks like if/for)
function varExample() {
    if (true) {
        var x = 10;
    }
    console.log(x);  // Output: 10  ← x LEAKS out of the if-block!
}
varExample();

// LET — block-scoped (stays inside {})
function letExample() {
    if (true) {
        let y = 20;
    }
    console.log(y);  // ReferenceError: y is not defined ← y stays in the block
}
letExample();
```

```text
VAR SCOPE:                           LET SCOPE:
┌─── function ──────────────┐       ┌─── function ──────────────┐
│                            │       │                            │
│  ┌─── if block ────────┐  │       │  ┌─── if block ────────┐  │
│  │  var x = 10;        │  │       │  │  let y = 20;        │  │
│  └─────────────────────┘  │       │  └─────────────────────┘  │
│                            │       │                            │
│  console.log(x); → 10 ✓  │       │  console.log(y); → ❌     │
│  ↑ x is visible here      │       │  ↑ y is NOT visible here  │
└────────────────────────────┘       └────────────────────────────┘
```

### 2.4 Re-declaration Rules

```javascript
// VAR allows re-declaration (silently overwrites — dangerous!)
var a = 1;
var a = 2;
console.log(a);  // Output: 2  ← no error, just overwrites

// LET does NOT allow re-declaration in the same scope
let b = 1;
let b = 2;       // SyntaxError: Identifier 'b' has already been declared

// CONST does NOT allow re-declaration
const c = 1;
const c = 2;     // SyntaxError: Identifier 'c' has already been declared
```

### 2.5 Re-assignment Rules

```javascript
var x = 1;
x = 2;           // ✅ OK

let y = 1;
y = 2;           // ✅ OK

const z = 1;
z = 2;           // ❌ TypeError: Assignment to constant variable
```

### 2.6 const with Objects and Arrays (The Trap!)

`const` prevents **re-assignment of the binding** (the variable can't point to a different value). But if the value is an object or array, you CAN still **modify its contents**.

```javascript
const person = { name: "Alice", age: 25 };

// ✅ Modifying properties is ALLOWED (the object itself is mutable)
person.name = "Bob";
person.city = "NYC";
console.log(person);  // Output: { name: "Bob", age: 25, city: "NYC" }

// ❌ Re-assigning the variable is NOT allowed
person = { name: "Charlie" };  // TypeError: Assignment to constant variable

// Same with arrays:
const arr = [1, 2, 3];
arr.push(4);          // ✅ OK — modifying the array
arr[0] = 99;          // ✅ OK — modifying an element
arr = [5, 6];         // ❌ TypeError — can't reassign the binding
```

```text
WHAT const ACTUALLY LOCKS:

  const person ──────────▶ { name: "Alice" }    ← the OBJECT can change
       │                        ↑
       │                        │ person.name = "Bob" ✅
       │
       └── THIS ARROW is locked by const
           You can't make person point somewhere else ❌
```

**To make an object truly immutable, use `Object.freeze()`:**

```javascript
const frozen = Object.freeze({ name: "Alice", age: 25 });
frozen.name = "Bob";       // silently fails (or TypeError in strict mode)
console.log(frozen.name);  // Output: "Alice"  ← unchanged

// NOTE: Object.freeze() is SHALLOW — nested objects are NOT frozen
const nested = Object.freeze({ user: { name: "Alice" } });
nested.user.name = "Bob";  // ✅ This WORKS — nested object is not frozen
```

---

>>> 🔍 DEEP DIVE: Object.freeze() vs Object.seal() vs Object.preventExtensions()

Three levels of object "locking":

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Method                   │ Add Props? │ Delete Props? │ Edit Values? │
├──────────────────────────┼────────────┼───────────────┼──────────────┤
│ Object.preventExtensions │    ❌ No   │    ✅ Yes     │   ✅ Yes    │
│ Object.seal()            │    ❌ No   │    ❌ No      │   ✅ Yes    │
│ Object.freeze()          │    ❌ No   │    ❌ No      │   ❌ No     │
└──────────────────────────────────────────────────────────────────────┘
```

```javascript
const obj = { x: 1, y: 2 };

// preventExtensions: can't ADD new properties, but can modify/delete existing
Object.preventExtensions(obj);
obj.x = 99;    // ✅ works
obj.z = 3;     // ❌ silently fails (TypeError in strict mode)
delete obj.y;  // ✅ works

// seal: can't add or delete, but CAN modify existing
const sealed = Object.seal({ a: 1 });
sealed.a = 2;   // ✅ works
delete sealed.a; // ❌ fails
sealed.b = 3;   // ❌ fails

// freeze: nothing can change
const frozen = Object.freeze({ a: 1 });
frozen.a = 2;   // ❌ silently fails (TypeError in strict mode)
```

**Deep freeze utility (freeze nested objects too):**

```javascript
function deepFreeze(obj) {
    Object.getOwnPropertyNames(obj).forEach(name => {
        const value = obj[name];
        if (value && typeof value === 'object') {
            deepFreeze(value);
        }
    });
    return Object.freeze(obj);
}

const config = deepFreeze({ db: { host: "localhost", port: 5432 } });
config.db.host = "hacked"; // ❌ TypeError in strict mode, silently fails otherwise
```

---

>>> ⚠️ EDGE CASE: var IN for LOOPS — THE CLASSIC INTERVIEW QUESTION

```javascript
// PROBLEM with var in for loops
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 0);
}
// Prints: 3, 3, 3 (not 0, 1, 2)
// Why? There is ONE `i` shared across all iterations (function scope)

// SOLUTION with let
for (let j = 0; j < 3; j++) {
    setTimeout(() => console.log(j), 0);
}
// Prints: 0, 1, 2
// Why? let creates a NEW binding per iteration (block scope)
```

**What `let` actually does per iteration (spec-level):**

```text
for (let j = 0; j < 3; j++) { ... }

Internally treated approximately as:
{
  let j = 0;           // outer binding
  // LOOP BODY:
  {
    let j_iteration = j;   // NEW binding created per iteration
    setTimeout(() => console.log(j_iteration), 0);
    j = j_iteration + 1;   // update outer binding
  }
}
```

Each setTimeout callback closes over its **own** `j_iteration`, so they print 0, 1, 2.

---

>>> 🧪 DEBUGGING: HOW TO DETECT var SCOPE LEAKS

```javascript
// Red flag: var inside a block
if (condition) {
    var result = compute();  // ← leaks to function scope
}
// `result` is accessible here — often unintentional

// Safe pattern: use let
if (condition) {
    let result = compute();  // ← stays in block
}
// `result` is NOT accessible here — intentional scoping
```

---

### 2.7 When to Use Which

```text
DECISION FLOWCHART:

  Will this value EVER change?
         │
    ┌────┴────┐
    NO        YES
    │         │
  const      let
```

**Rules of thumb:**
1. **Default to `const`** — use it for everything until you need to reassign.
2. **Use `let`** — only when you know the value will change (loop counters, accumulators, flags).
3. **Never use `var`** — it's legacy. Block scoping (`let`/`const`) is safer and more predictable.

### 2.8 Variable Naming Conventions

```javascript
// ✅ Valid names
let firstName = "John";         // camelCase (standard for variables/functions)
let MAX_SIZE = 100;             // UPPER_SNAKE_CASE (constants by convention)
let _private = "hidden";        // underscore prefix (convention for "private")
let $element = document.body;   // dollar sign (used in jQuery, some frameworks)
let café = "coffee";            // Unicode allowed (but avoid for readability)

// ❌ Invalid names
let 2fast = "no";               // can't start with a number
let my-var = "no";              // hyphens not allowed
let let = "no";                 // reserved keywords not allowed
let class = "no";               // reserved keyword
```

**Reserved words you CANNOT use as variable names:**
`break`, `case`, `catch`, `class`, `const`, `continue`, `default`, `delete`, `do`, `else`, `export`, `extends`, `finally`, `for`, `function`, `if`, `import`, `in`, `instanceof`, `let`, `new`, `return`, `super`, `switch`, `this`, `throw`, `try`, `typeof`, `var`, `void`, `while`, `with`, `yield`

---

## 3. Data Types Deep Dive

JavaScript has **8 data types** — 7 primitives and 1 non-primitive.

### 3.1 The Complete Type System

```text
                    JAVASCRIPT DATA TYPES
                           │
            ┌──────────────┴──────────────┐
            │                             │
      PRIMITIVES (7)              NON-PRIMITIVE (1)
      (immutable, stored          (mutable, stored
       by VALUE)                   by REFERENCE)
            │                             │
    ┌───┬───┼───┬────┬────┬────┐         │
    │   │   │   │    │    │    │         │
  Number String Boolean null undefined Symbol BigInt    Object
                                                        │
                                                ┌───────┼───────┐
                                                │       │       │
                                             Array  Function  Date
                                             RegExp  Map/Set  etc.
```

### 3.2 Primitive Types — One by One

#### Number

JavaScript has **one number type** for both integers and decimals (64-bit floating point, IEEE 754).

```javascript
let integer = 42;
let decimal = 3.14;
let negative = -7;
let scientific = 2.5e6;     // 2,500,000
let hex = 0xFF;              // 255
let octal = 0o77;            // 63
let binary = 0b1010;         // 10

// Special number values
console.log(Infinity);               // Infinity
console.log(-Infinity);              // -Infinity
console.log(0.1 + 0.2);             // 0.30000000000000004 (floating point!)
console.log(0.1 + 0.2 === 0.3);     // false (!)
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991 (2^53 - 1)
console.log(Number.MIN_SAFE_INTEGER); // -9007199254740991

// NaN — Not a Number (but typeof says "number"!)
console.log(typeof NaN);            // "number"  ← one of JS's quirks
console.log(NaN === NaN);           // false     ← NaN is NOT equal to itself!
console.log(Number.isNaN(NaN));     // true      ← correct way to check
console.log(isNaN("hello"));        // true      ← converts string first (avoid)
console.log(Number.isNaN("hello")); // false     ← safer, no conversion
```

```text
FLOATING POINT GOTCHA:

  0.1 in binary = 0.0001100110011... (infinite repeating)
  0.2 in binary = 0.0011001100110... (infinite repeating)

  Sum = 0.30000000000000004  (rounding error)

  FIX: Compare with tolerance
  Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON  → true ✓
```

---

>>> 🔍 DEEP DIVE: IEEE 754 DOUBLE-PRECISION FORMAT

JavaScript's Number uses 64-bit IEEE 754 double-precision:

```text
  64 bits total:
  ┌─┬────────────┬──────────────────────────────────────────────────┐
  │S│  Exponent  │                    Mantissa                      │
  │1│   11 bits  │                    52 bits                       │
  └─┴────────────┴──────────────────────────────────────────────────┘
  
  Value = (-1)^S × 2^(exponent - 1023) × (1 + mantissa)
```

**Key consequences:**
- Safe integers: -(2^53 - 1) to (2^53 - 1) — integers in this range are exact
- Outside this range, not every integer can be represented:

```javascript
console.log(Number.MAX_SAFE_INTEGER);      // 9007199254740991
console.log(Number.MAX_SAFE_INTEGER + 1);  // 9007199254740992 (correct)
console.log(Number.MAX_SAFE_INTEGER + 2);  // 9007199254740992 (WRONG — same!)
console.log(Number.MAX_SAFE_INTEGER + 3);  // 9007199254740994 (skips 3!)
```

**Special encodings in IEEE 754:**
- `Infinity`: exponent all 1s, mantissa all 0s
- `NaN`: exponent all 1s, mantissa nonzero (there are actually ~2^52 different NaN values, but JS treats them all as `NaN`)
- `-0`: sign bit = 1, everything else = 0

```javascript
// -0 is a real value in JavaScript
const negZero = -0;
console.log(negZero === 0);         // true  (=== treats -0 and 0 as equal!)
console.log(Object.is(negZero, 0)); // false (Object.is does NOT treat them as equal)
console.log(1 / negZero);           // -Infinity
console.log(1 / 0);                 // Infinity
// -0 appears as "0" when stringified: String(-0) → "0"
```

**Number precision for DSA:**
```javascript
// Safe for: array indices, loop counters, most integer math
// UNSAFE for: financial calculations, very large integers
// Use BigInt for large integers, or a decimal library for money
```

---

>>> ⚠️ EDGE CASE: NaN PROPAGATION

NaN is "contagious" — any arithmetic with NaN produces NaN:

```javascript
console.log(NaN + 1);      // NaN
console.log(NaN * 0);      // NaN
console.log(NaN === NaN);  // false — the ONLY value not equal to itself
console.log(NaN !== NaN);  // true

// The ONLY reliable checks:
Number.isNaN(NaN);         // true
Object.is(NaN, NaN);       // true

// isNaN() (global) is dangerous — it coerces first:
isNaN("hello");            // true — converts "hello" to NaN first
isNaN(undefined);          // true — converts undefined to NaN first
Number.isNaN("hello");     // false — no coercion, "hello" is not actually NaN
```

---

#### String

A string is a **sequence of characters** enclosed in quotes. Strings are **immutable** — you cannot change individual characters.

```javascript
let single = 'hello';
let double = "hello";
let backtick = `hello`;     // template literal (allows expressions)

// Strings are IMMUTABLE
let str = "hello";
str[0] = "H";              // silently fails — strings can't be changed in place
console.log(str);           // Output: "hello"  ← unchanged

// To "change" a string, you create a NEW one
str = "H" + str.slice(1);
console.log(str);           // Output: "Hello"  ← new string

// Template literals (backticks) — the modern way
const name = "Alice";
const age = 25;
const greeting = `Hello, ${name}! You are ${age} years old.`;
console.log(greeting);      // Output: "Hello, Alice! You are 25 years old."

// Multiline strings
const multiline = `Line 1
Line 2
Line 3`;

// String length
console.log("hello".length);  // Output: 5

// Accessing characters
console.log("hello"[0]);      // Output: "h"
console.log("hello".charAt(4)); // Output: "o"
console.log("hello".at(-1));   // Output: "o"  (ES2022 — negative indexing!)
```

---

>>> 🔍 DEEP DIVE: STRING INTERNAL REPRESENTATION (UTF-16)

JavaScript strings are **UTF-16** encoded internally. This causes surprising behavior with emoji and certain Unicode characters:

```javascript
// Most characters: 1 UTF-16 code unit = 1 character
"hello".length;       // 5 ✓

// Emoji and some symbols: 2 UTF-16 code units (a "surrogate pair")
"😀".length;          // 2  ← NOT 1! (two 16-bit code units)
"𠮷".length;          // 2  ← Japanese character outside BMP

// This breaks index access:
"😀"[0];              // "?" — half of a surrogate pair (not a valid char)
"😀"[1];              // "?" — other half

// Correct iteration for Unicode:
// for...of uses full Unicode code points (not UTF-16 code units)
for (const char of "😀abc") {
    console.log(char); // "😀", "a", "b", "c"
}

// Correct length in characters:
[..."😀abc"].length;   // 4 ✓
Array.from("😀abc").length; // 4 ✓

// String.prototype.normalize() for composed vs decomposed Unicode
"\u00e9" === "\u0065\u0301"; // false — same character, different encodings!
"\u00e9".normalize() === "\u0065\u0301".normalize(); // true after normalization
```

**String interning:**
V8 interns (deduplicates) short strings to save memory. Two identical string literals may reference the same object in the engine, but you should NEVER rely on this — JavaScript does not expose object identity for strings.

---

#### Boolean

Only two values: `true` and `false`.

```javascript
let isActive = true;
let isDeleted = false;

// Booleans from expressions
console.log(5 > 3);           // true
console.log(5 === "5");        // false (strict equality)
console.log(5 == "5");         // true  (loose equality — type coercion!)
```

#### null

`null` means **intentionally empty** — you explicitly assign it to say "this has no value."

```javascript
let user = null;               // I explicitly set this to "nothing"
console.log(typeof null);      // "object"  ← FAMOUS BUG in JavaScript!
                               // This is a bug from 1995 that was never fixed.
                               // null is NOT an object. It's a primitive.
```

---

>>> 🔍 DEEP DIVE: WHY typeof null === "object" (THE REAL REASON)

This is not just a "historical accident" — here's the actual technical reason:

In the original C implementation of JavaScript (1995), values were stored as 32-bit words. The low 3 bits were used as a "type tag":

```text
Type tags:
  000 → object
  001 → integer
  010 → double
  100 → string
  110 → boolean

null: represented as the NULL pointer in C (0x00000000)
      Low 3 bits of 0x00000000 = 000 → "object" type tag

So typeof null read the type tag bits, saw 000, and returned "object".
```

A TC39 proposal (ES6 era) to fix `typeof null` to return `"null"` was rejected because it would break existing web code that relied on `typeof obj === "object"` being true for null.

**Correct null check:**
```javascript
// ❌ Does not distinguish null from other objects
typeof value === "object"  // true for null AND {}

// ✅ Correct null check
value === null

// ✅ Correct "is a real object (not null)" check
typeof value === "object" && value !== null
```

---

#### undefined

`undefined` means **not yet assigned** — the variable exists but hasn't been given a value.

```javascript
let x;
console.log(x);               // undefined  ← declared but not assigned
console.log(typeof x);        // "undefined"

// Difference from null:
// null     = "I intentionally set this to nothing"
// undefined= "This hasn't been set yet"

function greet(name) {
    console.log(name);          // undefined (if called without argument)
}
greet();

// Function with no return statement returns undefined
function noReturn() { /* nothing */ }
console.log(noReturn());       // undefined
```

```text
null vs undefined:

  null      → "I know about this variable. Its value is NOTHING."
               Analogy: An empty box 📦 (box exists, nothing inside)

  undefined → "I haven't given this variable a value yet."
               Analogy: A label with no box 🏷️ (label exists, no box)
```

---

>>> ⚠️ EDGE CASE: undefined IS A LEGITIMATE VALUE, NOT JUST AN ABSENCE

```javascript
// undefined can be passed as an argument explicitly
function f(x = 10) {
    console.log(x);
}
f(undefined);  // 10  — undefined triggers the default parameter!
f(null);       // null — null does NOT trigger the default (only undefined does)
f();           // 10  — same as passing undefined

// void operator always returns undefined (useful in old code):
void 0;        // undefined
void "hello";  // undefined
void someFunc(); // undefined (and calls someFunc)

// undefined vs "not defined": typeof is safe for both
typeof undeclaredVar;         // "undefined" — no error
console.log(undeclaredVar);   // ReferenceError — blows up
```

---

#### Symbol (ES2015)

Symbols are **guaranteed unique identifiers**. No two symbols are ever equal, even with the same description.

```javascript
const id1 = Symbol("id");
const id2 = Symbol("id");
console.log(id1 === id2);     // false  ← each Symbol is unique

// Primary use: unique object property keys that won't collide
const user = {
    name: "Alice",
    [Symbol("id")]: 12345     // hidden from normal iteration
};

console.log(Object.keys(user));           // ["name"]  ← Symbol key is hidden
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(id)]
```

---

>>> 🔍 DEEP DIVE: WELL-KNOWN SYMBOLS (HOW JS INTERNALS ARE EXPOSED)

The ECMAScript spec uses built-in "well-known" symbols to allow code to hook into language internals:

```javascript
// Symbol.iterator — makes an object iterable (used by for...of)
const range = {
    [Symbol.iterator]() {
        let n = 1;
        return { next: () => n <= 3 ? { value: n++, done: false } : { done: true } };
    }
};
for (const x of range) console.log(x); // 1, 2, 3

// Symbol.toPrimitive — controls how an object converts to a primitive
const obj = {
    [Symbol.toPrimitive](hint) {
        if (hint === "number") return 42;
        if (hint === "string") return "hello";
        return true;  // "default" hint
    }
};
console.log(+obj);       // 42    (number hint)
console.log(`${obj}`);   // "hello" (string hint)
console.log(obj + "");   // "true"  (default hint)

// Symbol.hasInstance — controls instanceof behavior
class EvenNumber {
    static [Symbol.hasInstance](num) {
        return num % 2 === 0;
    }
}
console.log(2 instanceof EvenNumber);  // true
console.log(3 instanceof EvenNumber);  // false

// Symbol.for() — global symbol registry (cross-realm shared symbols)
const s1 = Symbol.for("shared");
const s2 = Symbol.for("shared");
console.log(s1 === s2); // true — SAME symbol (unlike Symbol("shared"))
```

**Complete list of well-known symbols:**
`Symbol.iterator`, `Symbol.asyncIterator`, `Symbol.toPrimitive`, `Symbol.toStringTag`, `Symbol.hasInstance`, `Symbol.isConcatSpreadable`, `Symbol.species`, `Symbol.match`, `Symbol.replace`, `Symbol.search`, `Symbol.split`, `Symbol.unscopables`

---

#### BigInt (ES2020)

For integers **larger than 2^53 - 1** (the limit of regular Number).

```javascript
const big = 9007199254740991n;       // append 'n' to create BigInt
const big2 = BigInt("9007199254740991");

console.log(big + 1n);               // 9007199254740992n  ← correct!
console.log(9007199254740991 + 1);   // 9007199254740992   ← WRONG with Number!
console.log(9007199254740991 + 2);   // 9007199254740992   ← same wrong value

// BigInt CANNOT be mixed with Number in operations
// console.log(big + 1);             // TypeError: Cannot mix BigInt and Number
console.log(big + BigInt(1));        // ✅ OK
```

---

>>> ⚠️ EDGE CASE: BigInt GOTCHAS

```javascript
// Division truncates (no decimals)
5n / 2n;  // 2n  (not 2.5n — BigInt has no fractional part)

// Comparison with Number works (loose)
1n == 1;   // true  (loose equality — type coercion)
1n === 1;  // false (strict equality — different types)

// Sorting: BigInt and Number compare correctly with < and >
1n < 2;    // true

// Math functions don't work with BigInt
Math.sqrt(4n);  // TypeError: Cannot convert a BigInt to a number

// JSON.stringify ignores BigInt (throws TypeError!)
JSON.stringify({ x: 1n }); // TypeError: Do not know how to serialize a BigInt
// Fix: add toJSON method
BigInt.prototype.toJSON = function() { return this.toString(); };
```

---

### 3.3 Non-Primitive: Object

Everything that is not a primitive is an **Object**. This includes arrays, functions, dates, regex, maps, sets, and plain objects.

```javascript
// Plain object
const person = { name: "Alice", age: 25 };

// Array (special object with numbered keys)
const arr = [10, 20, 30];
console.log(typeof arr);              // "object"  ← arrays are objects!

// Function (callable object)
function greet() { return "hi"; }
console.log(typeof greet);            // "function" ← special typeof result

// Date, RegExp, Map, Set — all objects
console.log(typeof new Date());       // "object"
console.log(typeof /regex/);          // "object"
console.log(typeof new Map());        // "object"
```

---

>>> 🧠 INTERNALS: OBJECT PROPERTY DESCRIPTORS

Every property on an object isn't just a name-value pair — it has a full descriptor with flags:

```javascript
const obj = { x: 1 };

// Full property descriptor
Object.getOwnPropertyDescriptor(obj, 'x');
// {
//   value: 1,
//   writable: true,      ← can the value be changed?
//   enumerable: true,    ← does it show in for...in / Object.keys()?
//   configurable: true   ← can the descriptor itself be changed or the property deleted?
// }

// Define a property with custom descriptor
Object.defineProperty(obj, 'readOnly', {
    value: 42,
    writable: false,
    enumerable: true,
    configurable: false
});
obj.readOnly = 99;  // silently fails (TypeError in strict mode)
console.log(obj.readOnly); // 42

// Create a non-enumerable property (hidden from loops)
Object.defineProperty(obj, 'hidden', {
    value: "secret",
    enumerable: false
});
Object.keys(obj);        // ["x", "readOnly"]  ← "hidden" not listed
"hidden" in obj;         // true  ← `in` sees ALL properties including non-enumerable
```

**Getter/Setter properties (accessor descriptors):**
```javascript
const person = {
    _age: 0,
    get age() { return this._age; },
    set age(value) {
        if (value < 0) throw new Error("Age can't be negative");
        this._age = value;
    }
};

person.age = 25;   // calls the setter
person.age;        // 25 — calls the getter
```

---

>>> 🔍 DEEP DIVE: THE PROTOTYPE CHAIN

Every object in JavaScript has an internal `[[Prototype]]` link pointing to another object (or `null`). When you access a property:

```text
PROPERTY LOOKUP ALGORITHM:

  obj.prop
    │
    ├── Look in obj's OWN properties
    │   Found? → Return it
    │   Not found? ↓
    │
    ├── Follow [[Prototype]] to obj's prototype
    │   Found? → Return it
    │   Not found? ↓
    │
    ├── Follow [[Prototype]] to the next prototype
    │   ... continue up the chain ...
    │
    └── Reach null (end of chain) → return undefined
```

```javascript
const animal = { breathes: true };
const dog = Object.create(animal);  // dog's [[Prototype]] = animal
dog.sound = "woof";

console.log(dog.sound);     // "woof"    — own property
console.log(dog.breathes);  // true      — inherited from animal
console.log(dog.hasOwnProperty("sound"));    // true
console.log(dog.hasOwnProperty("breathes")); // false — inherited

// Prototype chain visualization:
// dog → { sound: "woof" }
//   └──[[Prototype]]──▶ animal → { breathes: true }
//                         └──[[Prototype]]──▶ Object.prototype → { toString, ... }
//                                               └──[[Prototype]]──▶ null
```

**Checking prototypes:**
```javascript
Object.getPrototypeOf(dog) === animal; // true
dog.__proto__ === animal;              // true (legacy, avoid in production)
animal.isPrototypeOf(dog);             // true
```

---

### 3.4 typeof — The Type-Checking Operator

```javascript
console.log(typeof 42);               // "number"
console.log(typeof "hello");          // "string"
console.log(typeof true);             // "boolean"
console.log(typeof undefined);        // "undefined"
console.log(typeof null);             // "object"      ← BUG (should be "null")
console.log(typeof Symbol());         // "symbol"
console.log(typeof 42n);              // "bigint"
console.log(typeof {});               // "object"
console.log(typeof []);               // "object"      ← arrays are objects
console.log(typeof function(){});     // "function"    ← special case
```

**Complete typeof reference table:**

| Value | `typeof` result | Actual type |
|:------|:----------------|:------------|
| `42` | `"number"` | Number |
| `"hello"` | `"string"` | String |
| `true` | `"boolean"` | Boolean |
| `undefined` | `"undefined"` | Undefined |
| `null` | `"object"` ⚠️ | Null (bug!) |
| `Symbol()` | `"symbol"` | Symbol |
| `42n` | `"bigint"` | BigInt |
| `{}` | `"object"` | Object |
| `[]` | `"object"` | Array (use `Array.isArray()`) |
| `function(){}` | `"function"` | Function |
| `NaN` | `"number"` ⚠️ | NaN (quirk) |

---

>>> 🔍 DEEP DIVE: Object.prototype.toString — THE REAL TYPE CHECKER

For reliable type checking (beyond typeof), use `Object.prototype.toString.call()`:

```javascript
const tag = v => Object.prototype.toString.call(v);

tag(42);            // "[object Number]"
tag("hi");          // "[object String]"
tag(true);          // "[object Boolean]"
tag(null);          // "[object Null]"     ← correctly identifies null
tag(undefined);     // "[object Undefined]"
tag([]);            // "[object Array]"    ← correctly identifies array
tag({});            // "[object Object]"
tag(new Date());    // "[object Date]"
tag(/regex/);       // "[object RegExp]"
tag(new Map());     // "[object Map]"
tag(new Set());     // "[object Set]"
tag(function(){});  // "[object Function]"
tag(Symbol());      // "[object Symbol]"
tag(42n);           // "[object BigInt]"

// This works because Object.prototype.toString reads the
// internal [[Class]] slot (pre-ES6) or @@toStringTag (ES6+)
```

**Custom toString tag:**
```javascript
class MyCollection {
    get [Symbol.toStringTag]() { return "MyCollection"; }
}
Object.prototype.toString.call(new MyCollection()); // "[object MyCollection]"
```

---

### 3.5 Autoboxing — Why Primitives Have Methods

Primitives are simple values — they are NOT objects. So how does `"hello".toUpperCase()` work?

**Autoboxing:** When you access a method on a primitive, JavaScript **temporarily wraps** it in a wrapper object, calls the method, and immediately discards the wrapper.

```javascript
const str = "hello";
console.log(str.toUpperCase());  // "HELLO"

// What JavaScript does behind the scenes:
// 1. Create temporary: new String("hello")
// 2. Call .toUpperCase() on the wrapper
// 3. Return the result: "HELLO"
// 4. Discard the wrapper — str is still a primitive

console.log(typeof str);        // "string"  ← still a primitive, not an object
```

```text
AUTOBOXING:

  "hello".toUpperCase()
     │
     ▼
  ┌──────────────────────────────────┐
  │ 1. Wrap:   new String("hello")   │
  │ 2. Call:   .toUpperCase()        │
  │ 3. Return: "HELLO"              │
  │ 4. Discard the wrapper object    │
  └──────────────────────────────────┘
     │
     ▼
  "HELLO"   (result is a primitive string)
```

**Wrapper objects exist for:** `String`, `Number`, `Boolean`, `Symbol`, `BigInt`
**No wrapper for:** `null`, `undefined` (calling methods on these throws TypeError)

---

>>> ⚠️ EDGE CASE: WRAPPER OBJECTS vs PRIMITIVES — A SUBTLE TRAP

```javascript
// Primitive string
const primitiveStr = "hello";
typeof primitiveStr;         // "string"

// Wrapper object (AVOID!)
const wrappedStr = new String("hello");
typeof wrappedStr;           // "object"

// The behavior difference:
primitiveStr === "hello";    // true
wrappedStr === "hello";      // false  ← wrapper is an object, not a primitive!

// Falsy trap:
Boolean(new Boolean(false)); // true! The WRAPPER OBJECT is truthy even though
                             // the VALUE inside is false
if (new Boolean(false)) {
    console.log("This RUNS!"); // ← this executes, surprisingly
}
```

**Rule:** Never use `new String()`, `new Number()`, `new Boolean()`. Use the primitive values directly.

---

### 3.6 Checking Types — The Right Way

```javascript
// For primitives: use typeof
typeof 42 === "number"           // ✅
typeof "hi" === "string"         // ✅

// For null: check directly
value === null                   // ✅

// For arrays: use Array.isArray()
Array.isArray([1, 2])            // ✅ true
Array.isArray({})                // ✅ false

// For objects (general): typeof + null check
typeof obj === "object" && obj !== null  // ✅

// For class instances: use instanceof
date instanceof Date             // ✅
arr instanceof Array             // ✅
```

---

>>> ⚠️ EDGE CASE: instanceof FAILS ACROSS REALMS (IFRAMES)

```javascript
// Each iframe has its own global context (its own Array constructor)
const iframe = document.createElement("iframe");
document.body.appendChild(iframe);
const iframeArray = iframe.contentWindow.Array;

const arr = new iframeArray();
arr instanceof Array;       // false! arr's [[Prototype]] chain leads to the
                            // IFRAME's Array.prototype, not THIS window's

// Fix: always use Array.isArray() — it works across realms
Array.isArray(arr);         // true ✅

// Same issue with instanceof for custom classes in cross-realm scenarios
// Object.prototype.toString is immune to this problem
Object.prototype.toString.call(arr); // "[object Array]" ✅
```

---

## 4. Memory Model: Stack vs Heap

Understanding where JavaScript stores data explains many "weird" behaviors (why modifying one variable affects another, why `===` works differently for objects, etc.).

### 4.1 Two Memory Areas

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      JAVASCRIPT MEMORY                              │
│                                                                     │
│  ┌─────────────────────┐         ┌────────────────────────────────┐ │
│  │      STACK           │         │           HEAP                 │ │
│  │  (Fast, structured,  │         │  (Large, unstructured,         │ │
│  │   fixed size)        │         │   dynamic size)                │ │
│  │                      │         │                                │ │
│  │  Stores:             │         │  Stores:                       │ │
│  │  • Primitive VALUES  │         │  • Objects                     │ │
│  │  • REFERENCES (ptrs) │         │  • Arrays                      │ │
│  │    to heap objects   │         │  • Functions                   │ │
│  │  • Execution context │         │  • Any non-primitive           │ │
│  │    info              │         │                                │ │
│  └─────────────────────┘         └────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Primitives Live on the Stack

When you create a primitive, its **actual value** is stored directly on the stack. Assigning it to another variable creates an **independent copy**.

```javascript
let a = 10;
let b = a;      // COPY the value
b = 20;

console.log(a);  // Output: 10  ← unchanged! b has its own copy
console.log(b);  // Output: 20
```

```text
STEP 1: let a = 10         STEP 2: let b = a          STEP 3: b = 20
                                    (copy value)
STACK:                      STACK:                      STACK:
┌──────────────┐           ┌──────────────┐           ┌──────────────┐
│  a   │  10   │           │  a   │  10   │           │  a   │  10   │ ← unchanged
├──────┼───────┤           ├──────┼───────┤           ├──────┼───────┤
│              │           │  b   │  10   │           │  b   │  20   │ ← changed
└──────────────┘           └──────────────┘           └──────────────┘

a and b are INDEPENDENT copies — changing b does NOT affect a.
```

### 4.3 Objects Live on the Heap (References on Stack)

When you create an object, the **object itself** is stored on the heap. The variable on the stack holds a **reference** (memory address) pointing to the heap location.

```javascript
let x = { name: "Alice", age: 25 };
let y = x;              // COPY the reference (not the object!)
y.name = "Bob";

console.log(x.name);    // Output: "Bob"  ← x is ALSO changed!
console.log(y.name);    // Output: "Bob"
```

```text
STEP 1: let x = { name: "Alice" }

  STACK:                          HEAP:
  ┌──────┬─────────┐            ┌──────────────────────┐
  │  x   │  0xA1 ──┼───────────▶│ { name: "Alice",    │
  └──────┴─────────┘            │   age: 25 }          │
                                └──────────────────────┘

STEP 2: let y = x   (copies the REFERENCE, not the object)

  STACK:                          HEAP:
  ┌──────┬─────────┐            ┌──────────────────────┐
  │  x   │  0xA1 ──┼─────┬─────▶│ { name: "Alice",    │
  ├──────┼─────────┤     │      │   age: 25 }          │
  │  y   │  0xA1 ──┼─────┘      └──────────────────────┘
  └──────┴─────────┘
  Both x and y point to the SAME object!

STEP 3: y.name = "Bob"  (modifies the shared object)

  STACK:                          HEAP:
  ┌──────┬─────────┐            ┌──────────────────────┐
  │  x   │  0xA1 ──┼─────┬─────▶│ { name: "Bob",      │ ← changed!
  ├──────┼─────────┤     │      │   age: 25 }          │
  │  y   │  0xA1 ──┼─────┘      └──────────────────────┘
  └──────┴─────────┘
  x.name is ALSO "Bob" because x and y share the same object!
```

### 4.4 Arrays Work the Same Way (They're Objects)

```javascript
let arr1 = [1, 2, 3];
let arr2 = arr1;        // arr2 points to SAME array
arr2.push(4);

console.log(arr1);       // Output: [1, 2, 3, 4]  ← arr1 is modified too!
console.log(arr2);       // Output: [1, 2, 3, 4]
console.log(arr1 === arr2); // true — same reference
```

```javascript
// HOWEVER: creating a NEW array is different
let arr3 = [1, 2, 3];
let arr4 = [1, 2, 3];   // separate array in heap

console.log(arr3 === arr4); // false — different references, even if contents match!
```

```text
arr3 and arr4 comparison:

  STACK:                          HEAP:
  ┌──────┬─────────┐            ┌──────────────────┐
  │ arr3 │  0xB1 ──┼────────────▶│ [1, 2, 3]        │  ← object at 0xB1
  ├──────┼─────────┤            └──────────────────┘
  │ arr4 │  0xB2 ──┼────────────▶┌──────────────────┐
  └──────┴─────────┘            │ [1, 2, 3]        │  ← different object at 0xB2
                                └──────────────────┘

  arr3 === arr4  →  0xB1 === 0xB2  →  false (different addresses!)
```

### 4.5 Equality Behavior Explained

```javascript
// PRIMITIVES: === compares VALUES
10 === 10              // true  (same value)
"hello" === "hello"    // true  (same value)

// OBJECTS: === compares REFERENCES (memory addresses)
[1, 2] === [1, 2]     // false (different objects in heap)
{} === {}              // false (different objects in heap)

const a = { x: 1 };
const b = a;
a === b                // true  (same reference)

const c = { x: 1 };
a === c                // false (different reference, even though same content)
```

### 4.6 Garbage Collection

JavaScript has **automatic memory management**. The garbage collector periodically finds objects that are no longer reachable from the root (global scope, active call stack) and frees their memory.

```javascript
let user = { name: "Alice" };    // object created on heap
user = null;                      // reference removed — object is now unreachable

// The garbage collector will eventually reclaim the memory
// used by { name: "Alice" } since nothing points to it anymore.
```

```text
BEFORE: user = null                    AFTER: user = null
  STACK:           HEAP:               STACK:           HEAP:
  ┌──────┬──────┐  ┌──────────────┐   ┌──────┬──────┐  ┌──────────────┐
  │ user │ 0xA1─┼─▶│{name:"Alice"}│   │ user │ null │  │{name:"Alice"}│ 🗑️
  └──────┴──────┘  └──────────────┘   └──────┴──────┘  └──────────────┘
                                                        ↑ unreachable!
                                                        GC will clean this up
```

**The algorithm (Mark-and-Sweep):**
1. Start from "roots" (global object, current call stack variables)
2. "Mark" every object reachable from roots
3. "Sweep" (delete) all unmarked objects

---

>>> 🧠 INTERNALS: V8 GARBAGE COLLECTION IN DEPTH (GENERATIONAL GC)

V8 uses a **generational garbage collector** based on the observation that "most objects die young":

```text
HEAP LAYOUT IN V8:
┌────────────────────────────────────────────────────────────────┐
│                          V8 HEAP                               │
│                                                                │
│  ┌──────────────────────┐  ┌────────────────────────────────┐  │
│  │    YOUNG GENERATION  │  │        OLD GENERATION          │  │
│  │    (New Space)       │  │        (Old Space)             │  │
│  │    (1-8 MB)          │  │        (100s of MB)            │  │
│  │                      │  │                                │  │
│  │  ┌────────┬────────┐ │  │  Objects that survived 2+     │  │
│  │  │  From  │   To   │ │  │  minor GCs live here          │  │
│  │  │ Space  │ Space  │ │  │                               │  │
│  │  └────────┴────────┘ │  │  Collected by MAJOR GC       │  │
│  │  New allocations     │  │  (Mark-Sweep-Compact)         │  │
│  │  live here first     │  │  (Slower, happens less often) │  │
│  └──────────────────────┘  └────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Minor GC (Scavenger) — young generation:**
- Very fast: just copy live objects from "From Space" to "To Space"
- Objects that survive 2 GC cycles get "promoted" to Old Generation
- Runs frequently (~every few ms), typically < 1ms pause

**Major GC (Mark-Sweep-Compact) — old generation:**
- Full Mark-and-Sweep as described above
- Also compacts (moves objects together to reduce fragmentation)
- Runs less often but causes longer pauses (1–100ms)
- V8 uses "incremental marking" and "concurrent sweeping" to reduce pauses

---

>>> ⚠️ EDGE CASE: MEMORY LEAKS IN JAVASCRIPT

Even with a GC, you CAN cause memory leaks (objects that should be freed but aren't):

```javascript
// 1. Accidental global variables
function leaky() {
    forgotLet = "I'm global now!"; // no var/let/const → creates global
}

// 2. Forgotten event listeners
const button = document.getElementById("btn");
function handler() { /* ... */ }
button.addEventListener("click", handler);
// If button is removed from DOM without removing listener,
// `handler` closure (and everything it closes over) leaks!
button.removeEventListener("click", handler); // FIX

// 3. Detached DOM nodes
let detachedTree;
function detach() {
    const root = document.createElement("div");
    // Add many children...
    detachedTree = root;  // holding a reference after removing from DOM
    document.body.removeChild(root); // removed from DOM but NOT from memory!
}

// 4. Closures capturing large objects unintentionally
function processLargeData() {
    const bigArray = new Array(1_000_000).fill("data");
    
    return function smallFunction() {
        // This closure keeps bigArray alive even though we only need count
        return bigArray.length; // bigArray can't be GC'd!
    };
}
// Fix: extract only what you need
function processLargeData_fixed() {
    const bigArray = new Array(1_000_000).fill("data");
    const count = bigArray.length; // extract just what's needed
    // bigArray goes out of scope and can be GC'd
    return function() { return count; };
}

// 5. Timers that reference large objects
let obj = { bigData: new Array(1_000_000) };
const timer = setInterval(() => {
    console.log(obj.bigData.length); // timer holds reference to obj
}, 1000);
clearInterval(timer); // FIX: always clear timers when done
```

---

## 5. Type Coercion, Truthy/Falsy & Equality

### 5.1 What Is Type Coercion?

JavaScript is **dynamically typed** — variables don't have fixed types. When an operation expects a certain type, JavaScript will automatically **convert** (coerce) values. This can be **implicit** (automatic) or **explicit** (manual).

### 5.2 Explicit Coercion (You Do It Manually)

```javascript
// To Number
Number("42");          // 42
Number("3.14");        // 3.14
Number("");            // 0
Number("hello");       // NaN
Number(true);          // 1
Number(false);         // 0
Number(null);          // 0
Number(undefined);     // NaN
parseInt("42px");      // 42  (parses until non-digit)
parseFloat("3.14em");  // 3.14

// To String
String(42);            // "42"
String(true);          // "true"
String(null);          // "null"
String(undefined);     // "undefined"
String([1, 2, 3]);     // "1,2,3"
(42).toString();       // "42"
(255).toString(16);    // "ff"  (hexadecimal)
(10).toString(2);      // "1010" (binary)

// To Boolean
Boolean(1);            // true
Boolean(0);            // false
Boolean("hello");      // true
Boolean("");           // false
Boolean(null);         // false
Boolean(undefined);    // false
Boolean({});           // true  (even empty objects!)
Boolean([]);           // true  (even empty arrays!)
!!value;               // shorthand for Boolean(value)
```

### 5.3 Implicit Coercion (JavaScript Does It Automatically)

```javascript
// The + operator with strings → string concatenation
"5" + 3;              // "53"   (number 3 → string "3")
"5" + true;           // "5true"
"5" + null;           // "5null"
"5" + undefined;      // "5undefined"

// Arithmetic operators (-, *, /, %) → convert to number
"5" - 3;              // 2      (string "5" → number 5)
"5" * 2;              // 10
"6" / "2";            // 3
true + true;          // 2      (true → 1)
false + 1;            // 1      (false → 0)
null + 5;             // 5      (null → 0)

// The unary + operator → convert to number
+"42";                // 42
+true;                // 1
+false;               // 0
+"";                  // 0
+"hello";             // NaN
+null;                // 0
```

```text
THE + OPERATOR DUAL BEHAVIOR:

  Is either operand a string?
         │
    ┌────┴────┐
    YES       NO
    │         │
  STRING    NUMERIC
  concat    addition
    │         │
  "5" + 3   5 + 3
  = "53"    = 8
```

---

>>> 🧠 INTERNALS: THE ToPrimitive ALGORITHM (SPEC-LEVEL)

When JavaScript needs to convert an object to a primitive, it calls the **ToPrimitive** abstract operation:

```text
ToPrimitive(input, preferredType):

  1. If input already IS a primitive → return as-is

  2. Does input have [Symbol.toPrimitive]?
     YES → call it with the hint ("number", "string", or "default")
     
  3. Otherwise use OrdinaryToPrimitive(hint):
     
     If hint is "string":
       → Try input.toString() first
       → If not a primitive, try input.valueOf()
       
     If hint is "number" or "default":
       → Try input.valueOf() first
       → If not a primitive, try input.toString()

  4. If result is still not a primitive → throw TypeError
```

```javascript
// Observing ToPrimitive with valueOf and toString:
const weirdObj = {
    valueOf() { console.log("valueOf called"); return 10; },
    toString() { console.log("toString called"); return "hello"; }
};

// Arithmetic (number hint):
weirdObj + 5;     // "valueOf called" → 15  (valueOf runs first)

// String context:
`${weirdObj}`;    // "valueOf called" then used as string → "10"
// Wait — template literals use the "default" hint which prefers valueOf

// Explicitly string context via String():
String(weirdObj); // "toString called" → "hello"
```

**Why `[] + []` and `[] + {}` produce surprising results:**

```javascript
[] + [];    // ""
// [] → ToPrimitive → [].valueOf() returns [] (not primitive) →
//                    [].toString() returns "" → "" + "" = ""

[] + {};    // "[object Object]"
// [] → "" (via toString), {} → "[object Object]" (via toString) → concat

{} + [];    // 0 in some contexts!
// When {} appears at the STATEMENT start, it's parsed as an EMPTY BLOCK, not an object
// So this becomes: {}  (empty block)  +  []  → +[] → +("") → 0
// In an expression context: ({}) + [] → "[object Object]"
```

---

>>> 🔍 DEEP DIVE: ToString, ToNumber, ToBoolean ALGORITHMS

**ToNumber (exact spec rules):**

```text
Value             → Number
─────             ─────────
undefined         → NaN
null              → 0
true              → 1
false             → 0
""                → 0
" "               → 0   (whitespace-only strings → 0!)
"123"             → 123
"12.3"            → 12.3
"0x1F"            → 31  (hex)
"0b1010"          → 10  (binary)
"0o17"            → 15  (octal)
"123abc"          → NaN (contains non-numeric)
"  42  "          → 42  (leading/trailing whitespace stripped)
[]                → 0   ([] → "" → 0)
[1]               → 1   ([1] → "1" → 1)
[1,2]             → NaN ([1,2] → "1,2" → NaN)
{}                → NaN ({} → "[object Object]" → NaN)
Symbol()          → TypeError (Symbols cannot be converted to numbers!)
```

**ToString (exact spec rules):**

```text
Value             → String
─────             ─────────
undefined         → "undefined"
null              → "null"
true              → "true"
false             → "false"
0                 → "0"
-0                → "0"   (negative zero becomes "0"!)
NaN               → "NaN"
Infinity          → "Infinity"
-Infinity         → "-Infinity"
123               → "123"
[]                → ""
[1, 2, 3]         → "1,2,3"
[null]            → ""    (null in array → empty string element)
[undefined]       → ""
[[1], [2]]        → "1,2" (nested arrays are flattened to string)
{}                → "[object Object]"
Symbol("x")       → TypeError (Symbols can't be converted to strings implicitly)
                    String(Symbol("x")) → "Symbol(x)"  (explicit only)
```

---

### 5.4 Falsy Values — The Complete List

There are exactly **7 falsy values** in JavaScript. Everything else is **truthy**.

```javascript
// The 7 falsy values:
Boolean(false);        // false
Boolean(0);            // false
Boolean(-0);           // false
Boolean(0n);           // false  (BigInt zero)
Boolean("");           // false  (empty string)
Boolean(null);         // false
Boolean(undefined);    // false
Boolean(NaN);          // false

// EVERYTHING ELSE is truthy — including these surprises:
Boolean("0");          // true   ← string "0" is NOT empty!
Boolean(" ");          // true   ← string with space is NOT empty!
Boolean("false");      // true   ← string "false" is NOT empty!
Boolean([]);           // true   ← empty array is truthy!
Boolean({});           // true   ← empty object is truthy!
Boolean(function(){}); // true   ← functions are truthy!
Boolean(-1);           // true   ← any non-zero number
Boolean(Infinity);     // true
```

```text
FALSY VALUES (memorize these — there are only 7):

  ┌─────────────────┬────────────────────────────┐
  │  false          │  the boolean false          │
  │  0  / -0        │  zero (and negative zero)   │
  │  0n             │  BigInt zero                │
  │  ""             │  empty string               │
  │  null           │  intentional nothing        │
  │  undefined      │  not yet assigned           │
  │  NaN            │  not a number               │
  └─────────────────┴────────────────────────────┘

  EVERYTHING ELSE → truthy
  (including [], {}, "0", "false", -1, Infinity)
```

### 5.5 == (Loose Equality) vs === (Strict Equality)

```javascript
// === (STRICT) — compares value AND type. NO coercion.
5 === 5;               // true
5 === "5";             // false  (number ≠ string)
0 === false;           // false  (number ≠ boolean)
null === undefined;    // false  (different types)
NaN === NaN;           // false  (NaN is never equal to anything!)

// == (LOOSE) — converts types FIRST, then compares.
5 == "5";              // true   ("5" → 5, then 5 == 5)
0 == false;            // true   (false → 0, then 0 == 0)
"" == false;           // true   ("" → 0, false → 0)
null == undefined;     // true   (special rule: null == undefined is always true)
null == 0;             // false  (null only == null and undefined)
```

**How == coercion works (simplified):**

```text
  x == y
    │
    ├── Same type? → compare directly (like ===)
    │
    ├── null == undefined? → true (special case)
    │
    ├── Number == String? → convert String to Number, compare
    │
    ├── Boolean == anything? → convert Boolean to Number first
    │   (true → 1, false → 0), then compare
    │
    └── Object == primitive? → convert Object using ToPrimitive
```

**Common gotchas with ==:**

```javascript
"" == false            // true   ("" → 0, false → 0)
" \t\n" == 0           // true   (whitespace string → 0)
"0" == false           // true   ("0" → 0, false → 0)
[] == false            // true   ([] → "" → 0, false → 0)
[] == ![]              // true   (most confusing one!)
                       // ![] → false, then [] == false → true
```

---

>>> 🔍 DEEP DIVE: ABSTRACT EQUALITY COMPARISON ALGORITHM (SPEC-EXACT)

The ECMAScript spec defines `==` via the **Abstract Equality Comparison** algorithm:

```text
x == y:

  1. If Type(x) === Type(y):
       → Perform Strict Equality Comparison (===)
       
  2. null == undefined → return true
  3. undefined == null → return true
  
  4. If Type(x) is Number and Type(y) is String:
       → return x == ToNumber(y)
       
  5. If Type(x) is String and Type(y) is Number:
       → return ToNumber(x) == y
       
  6. If Type(x) is BigInt and Type(y) is String:
       → let n = StringToBigInt(y)
       → if n is NaN return false, else return x == n
       
  7. If Type(x) is Boolean:
       → return ToNumber(x) == y   (true→1, false→0, THEN re-run comparison)
       
  8. If Type(y) is Boolean:
       → return x == ToNumber(y)
       
  9. If Type(x) is String, Number, BigInt, or Symbol AND Type(y) is Object:
       → return x == ToPrimitive(y)
       
  10. If Type(x) is Object AND Type(y) is String, Number, BigInt, or Symbol:
       → return ToPrimitive(x) == y
       
  11. return false
```

**Tracing through the notorious `[] == ![]`:**
```text
[] == ![]
    │
    ├── ![] → !Boolean([]) → !true → false
    │
    ├── [] == false
    │
    ├── Step 7: false is Boolean → [] == ToNumber(false) → [] == 0
    │
    ├── Step 10: [] is Object, 0 is Number → ToPrimitive([]) == 0
    │
    ├── ToPrimitive([]) → [].valueOf() = [] (not primitive) →
    │                     [].toString() = "" → "" == 0
    │
    ├── Step 5: "" is String, 0 is Number → ToNumber("") == 0 → 0 == 0
    │
    └── true
```

---

>>> 🔍 DEEP DIVE: Object.is() — THE FOURTH EQUALITY

Beyond `==` and `===`, there's `Object.is()`:

```javascript
// Object.is(x, y) — same as === EXCEPT:
// 1. Treats NaN as equal to NaN
// 2. Treats +0 and -0 as NOT equal

Object.is(NaN, NaN);   // true   (=== says false)
Object.is(0, -0);      // false  (=== says true)
Object.is(1, 1);       // true
Object.is("a", "a");   // true
Object.is(null, null); // true

// Use case: when you need precise equality including NaN and -0 handling
// React uses Object.is internally for state/prop comparison
```

**Summary of all 4 equality types:**

```text
┌───────────────┬───────────┬───────────┬───────────┬─────────────┐
│               │  NaN==NaN │  0==-0    │  Coerces  │  Use When   │
├───────────────┼───────────┼───────────┼───────────┼─────────────┤
│  ==  (loose)  │   false   │   true    │   YES     │  Avoid      │
│  === (strict) │   false   │   true    │   NO      │  Default    │
│  Object.is()  │   true    │   false   │   NO      │  Precision  │
│  SameValue*   │   true    │   false   │   NO      │  Internal   │
└───────────────┴───────────┴───────────┴───────────┴─────────────┘
* SameValue is the spec's internal algorithm; Object.is exposes it
```

---

### 5.6 Best Practice: Always Use ===

```javascript
// ✅ GOOD — use strict equality
if (x === 5) { /* ... */ }
if (name === "") { /* ... */ }
if (result !== null) { /* ... */ }

// ❌ AVOID — loose equality causes subtle bugs
if (x == 5) { /* ... */ }        // might match "5" too
if (count == false) { /* ... */ } // matches 0, "", null...
```

**The ONE exception where == is acceptable:**

```javascript
// Checking for null OR undefined in one shot
if (value == null) {
    // This catches BOTH null and undefined
    // This is a common, accepted pattern
}

// Equivalent to:
if (value === null || value === undefined) { /* ... */ }
```

---

## 6. Operators (Arithmetic, Logical, Bitwise)

### 6.1 Arithmetic Operators

```javascript
5 + 3;      // 8     (addition)
5 - 3;      // 2     (subtraction)
5 * 3;      // 15    (multiplication)
5 / 3;      // 1.666... (division — always float!)
5 % 3;      // 2     (modulo — remainder)
5 ** 3;     // 125   (exponentiation — same as Math.pow(5,3))

// Increment / Decrement
let x = 5;
x++;        // post-increment: returns 5, THEN x becomes 6
++x;        // pre-increment: x becomes 7, THEN returns 7
x--;        // post-increment: returns 7, THEN x becomes 6
--x;        // pre-decrement: x becomes 5, THEN returns 5

// The difference matters in expressions:
let a = 5;
let b = a++;   // b = 5 (old value), a = 6
let c = ++a;   // a = 7 (incremented first), c = 7
```

---

>>> ⚠️ EDGE CASE: MODULO vs REMAINDER — NEGATIVE NUMBERS

JavaScript's `%` is technically a **remainder** operator, not true mathematical modulo:

```javascript
5 % 3;     // 2  (same for positive numbers)
-5 % 3;    // -2  (NOT 1 — the sign follows the DIVIDEND, not the divisor)
5 % -3;    // 2   (sign follows the dividend — same as positive case)

// True mathematical modulo (always non-negative):
function mod(n, d) {
    return ((n % d) + d) % d;
}
mod(-5, 3);  // 1  ← correct mathematical modulo
```

**Why this matters in DSA:**
```javascript
// Circular array index — WRONG for negative indices:
arr[(-1) % arr.length];  // arr[-1] — doesn't work, arr[-1] is undefined

// CORRECT:
arr[((index % arr.length) + arr.length) % arr.length];
```

---

### 6.2 Assignment Operators

```javascript
let x = 10;
x += 5;     // x = x + 5  → 15
x -= 3;     // x = x - 3  → 12
x *= 2;     // x = x * 2  → 24
x /= 4;     // x = x / 4  → 6
x %= 4;     // x = x % 4  → 2
x **= 3;    // x = x ** 3 → 8

// Logical assignment (ES2021)
let a = null;
a ??= 10;   // a = 10  (assign ONLY if a is null/undefined)

let b = 0;
b ||= 5;    // b = 5   (assign if b is falsy)

let c = 1;
c &&= 2;    // c = 2   (assign if c is truthy)
```

### 6.3 Comparison Operators

```javascript
5 > 3;      // true   (greater than)
5 < 3;      // false  (less than)
5 >= 5;     // true   (greater than or equal)
5 <= 4;     // false  (less than or equal)
5 === 5;    // true   (strict equal — value AND type)
5 !== "5";  // true   (strict not equal)
5 == "5";   // true   (loose equal — coerces types)
5 != "5";   // false  (loose not equal)
```

---

>>> ⚠️ EDGE CASE: STRING COMPARISON USES LEXICOGRAPHIC ORDER

```javascript
// Numbers: normal numeric comparison
5 > 3;      // true

// Strings: compared character-by-character by Unicode code point
"b" > "a";          // true  (code point 98 > 97)
"banana" > "apple"; // true  (b > a at first char)
"10" > "9";         // false! ("1" < "9" lexicographically)
"10" > 9;           // true  ("10" coerced to number 10 > 9)

// This is a COMMON BUG when sorting arrays of number-as-strings:
["10", "9", "3"].sort(); // ["10", "3", "9"] ← WRONG (lexicographic)
["10", "9", "3"].sort((a, b) => a - b); // ["3", "9", "10"] ← CORRECT
```

---

### 6.4 Logical Operators & Short-Circuit Evaluation

Logical operators don't just return `true`/`false` — they return **one of the operands**.

```javascript
// && (AND) — returns first FALSY value, or last value if all truthy
true && "hello";         // "hello"  (both truthy → return last)
false && "hello";        // false    (first is falsy → return it)
0 && "hello";            // 0        (0 is falsy → return it)
"hi" && "bye" && 42;     // 42       (all truthy → return last)
"hi" && 0 && 42;         // 0        (first falsy → return it)

// || (OR) — returns first TRUTHY value, or last value if all falsy
false || "hello";        // "hello"  (first falsy, second truthy → return "hello")
"" || 0 || "fallback";   // "fallback" (first truthy)
0 || "" || null;         // null     (all falsy → return last)

// ! (NOT) — converts to boolean and inverts
!true;                   // false
!0;                      // true
!"hello";                // false
!!0;                     // false  (double-NOT = convert to boolean)
!!"hello";               // true
```

```text
SHORT-CIRCUIT EVALUATION:

  && stops at the first FALSY value (why run more checks if one is false?)
  || stops at the first TRUTHY value (why run more checks if one is true?)

  Common patterns:

  // Conditional execution (like a short if-statement)
  isLoggedIn && showDashboard();   // only calls showDashboard if isLoggedIn is truthy

  // Default values
  const name = userInput || "Anonymous";  // use "Anonymous" if userInput is falsy

  // BUT || has a problem with 0 and "" (they're falsy but valid values)
  const count = 0;
  count || 10;           // 10  ← WRONG! 0 is a valid count!
  count ?? 10;           // 0   ← CORRECT! ?? only checks null/undefined
```

### 6.5 Nullish Coalescing (??) and Optional Chaining (?.)

```javascript
// ?? — returns right side ONLY if left is null or undefined (not 0, not "")
null ?? "default";       // "default"
undefined ?? "default";  // "default"
0 ?? "default";          // 0          ← 0 is kept! (unlike ||)
"" ?? "default";         // ""         ← "" is kept! (unlike ||)
false ?? "default";      // false      ← false is kept!

// ?. — safely access nested properties (returns undefined instead of throwing)
const user = { address: { city: "NYC" } };
user.address.city;       // "NYC"
user.phone?.number;      // undefined (no error, even though phone doesn't exist)
// Without ?.: user.phone.number → TypeError: Cannot read property 'number' of undefined

// Works with methods too
user.greet?.();          // undefined (doesn't throw if greet doesn't exist)

// Works with arrays
const arr = [1, 2, 3];
arr?.[5];                // undefined
```

```text
?? vs || :

  Value       || "default"      ?? "default"
  ─────       ────────────      ────────────
  null        "default"         "default"
  undefined   "default"         "default"
  0           "default"   ←!!   0          ← keeps 0
  ""          "default"   ←!!   ""         ← keeps ""
  false       "default"   ←!!   false      ← keeps false
  NaN         "default"   ←!!   NaN        ← keeps NaN

  Rule: ?? only overrides null/undefined. || overrides ALL falsy values.
```

---

>>> ⚠️ EDGE CASE: ?. AND ?? OPERATOR PRECEDENCE GOTCHAS

```javascript
// ?? has LOWER precedence than || and &&
// You CANNOT mix them without parentheses:
null || undefined ?? "default";  // SyntaxError!
(null || undefined) ?? "default"; // "default" ✅

// ?. short-circuits the REST of the chain
null?.foo.bar; // undefined — stops at null?.foo, does NOT access .bar
// Without ?.: null.foo → TypeError

// ?. works for method calls AND bracket notation
const arr = null;
arr?.[0];           // undefined (no error)
arr?.push(1);       // undefined (no error, push not called)

// Chaining multiple ?.:
user?.address?.city?.toUpperCase();
// Evaluates left to right, stops at the first null/undefined
```

---

### 6.6 Bitwise Operators (Essential for DSA)

Bitwise operators work on 32-bit integers, operating on individual bits.

```javascript
// AND (&) — both bits must be 1
5 & 3;      // 1
// 5 = 101
// 3 = 011
// &   001 = 1

// OR (|) — at least one bit must be 1
5 | 3;      // 7
// 5 = 101
// 3 = 011
// |   111 = 7

// XOR (^) — bits must be DIFFERENT
5 ^ 3;      // 6
// 5 = 101
// 3 = 011
// ^   110 = 6

// NOT (~) — flip all bits
~5;         // -6  (inverts all 32 bits)
// ~n = -(n+1)

// Left shift (<<) — multiply by 2^n
5 << 1;     // 10  (5 × 2)
5 << 2;     // 20  (5 × 4)
1 << 10;    // 1024 (2^10)

// Right shift (>>) — divide by 2^n (floor)
20 >> 1;    // 10  (20 ÷ 2)
20 >> 2;    // 5   (20 ÷ 4)
```

**DSA Bit Tricks:**

```javascript
// 1. Check if a number is even or odd
function isEven(n) {
    return (n & 1) === 0;
}
// Why: the last bit of even numbers is always 0
// 6 = 110 → last bit 0 → even
// 7 = 111 → last bit 1 → odd

// 2. Swap two numbers without a temp variable
let a = 5, b = 3;
a = a ^ b;  // a = 6
b = a ^ b;  // b = 5
a = a ^ b;  // a = 3

// 3. Check if a number is a power of 2
function isPowerOf2(n) {
    return n > 0 && (n & (n - 1)) === 0;
}
// Why: powers of 2 have exactly one bit set
// 8  = 1000,  7 = 0111,  8 & 7 = 0000 → true
// 6  = 0110,  5 = 0101,  6 & 5 = 0100 → false

// 4. Find the element that appears once (all others appear twice)
function findSingle(nums) {
    return nums.reduce((acc, n) => acc ^ n, 0);
}
findSingle([4, 1, 2, 1, 2]);  // 4
// Why: x ^ x = 0 (pairs cancel out), x ^ 0 = x (single remains)

// 5. Check if k-th bit is set (0-indexed from right)
function isKthBitSet(n, k) {
    return (n & (1 << k)) !== 0;
}
isKthBitSet(10, 1);  // true  (10 = 1010, bit 1 is set)
isKthBitSet(10, 2);  // false (10 = 1010, bit 2 is 0)

// 6. Count set bits (Brian Kernighan's algorithm)
function countSetBits(n) {
    let count = 0;
    while (n > 0) {
        n = n & (n - 1);  // removes the rightmost set bit
        count++;
    }
    return count;
}
countSetBits(13);  // 3  (13 = 1101 → three 1-bits)
```

---

>>> 🔍 DEEP DIVE: BITWISE OPERATORS AND 32-BIT SIGNED INTEGERS

```javascript
// Bitwise operators ALWAYS convert operands to 32-bit SIGNED integers
// This causes surprising behavior for large numbers:

2 ** 32 | 0;    // 0   (overflows 32-bit int, wraps to 0)
2 ** 31 | 0;    // -2147483648  (becomes most negative 32-bit int due to sign bit)

// Trick: use | 0 or >>> 0 to convert to integer
// (useful in DSA for fast float-to-int conversion, faster than Math.floor)
3.7 | 0;        // 3   (truncates toward zero, like Math.trunc)
-3.7 | 0;       // -3  (unlike Math.floor which would give -4)
3.7 >>> 0;      // 3   (unsigned right shift — converts to UNSIGNED 32-bit int)
-1 >>> 0;       // 4294967295  (0xFFFFFFFF — -1 as unsigned 32-bit)

// >>> (unsigned right shift) vs >> (signed right shift):
-8 >> 1;        // -4  (fills with sign bit — preserves sign)
-8 >>> 1;       // 2147483644  (fills with zeros — treats as unsigned)
```

---

>>> ⚡ PERFORMANCE: BITWISE TRICKS ACTUALLY USED IN PRODUCTION

```javascript
// Fast integer division by power of 2:
n >> 1;    // n / 2 (faster than Math.floor(n/2) for hot paths)
n >> 2;    // n / 4

// Fast modulo by power of 2:
n & (k - 1);  // n % k, where k is a power of 2 (e.g., n & 7 = n % 8)

// Fast multiply by power of 2:
n << 1;    // n * 2
n << 3;    // n * 8

// Toggle a boolean using XOR:
let flag = 0;
flag ^= 1;  // 1 (toggle on)
flag ^= 1;  // 0 (toggle off)

// Swap without temp (only for performance benchmarks, not readability):
a ^= b; b ^= a; a ^= b;
```

---

### 6.7 Operator Precedence (What Runs First)

```text
HIGHEST PRIORITY → LOWEST PRIORITY:

  ()            Grouping
  !  ~  ++  --  Unary operators
  **            Exponentiation
  *  /  %       Multiplication, division, modulo
  +  -          Addition, subtraction
  <<  >>  >>>   Bit shifts
  <  <=  >  >=  Comparison
  ==  !=  ===   Equality
  &             Bitwise AND
  ^             Bitwise XOR
  |             Bitwise OR
  &&            Logical AND
  ||            Logical OR
  ??            Nullish coalescing
  =  +=  -=     Assignment
  ,             Comma

  RULE: When in doubt, use parentheses () to make intent clear.
```

---

>>> ⚠️ EDGE CASE: ** (EXPONENTIATION) IS RIGHT-ASSOCIATIVE

```javascript
// Most operators are left-associative: 2 - 1 - 1 = (2 - 1) - 1 = 0
// But ** is right-associative:
2 ** 3 ** 2;  // = 2 ** (3 ** 2) = 2 ** 9 = 512  (NOT (2**3)**2 = 64)

// Unary minus requires parentheses with **:
-2 ** 2;   // SyntaxError! Must write (-2) ** 2 = 4  or  -(2 ** 2) = -4
(-2) ** 2; // 4
```

---

## 7. Control Flow & Loops

### 7.1 if / else if / else

```javascript
const score = 85;

if (score >= 90) {
    console.log("A");
} else if (score >= 80) {
    console.log("B");        // Output: "B"
} else if (score >= 70) {
    console.log("C");
} else {
    console.log("F");
}
```

### 7.2 Ternary Operator (Conditional Expression)

```javascript
// Syntax: condition ? valueIfTrue : valueIfFalse
const age = 20;
const status = age >= 18 ? "adult" : "minor";
console.log(status);  // "adult"

// Nested ternary (avoid for readability — use if/else instead)
const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F";
```

### 7.3 switch Statement

```javascript
const day = "Monday";

switch (day) {
    case "Monday":
    case "Tuesday":
    case "Wednesday":
    case "Thursday":
    case "Friday":
        console.log("Weekday");
        break;                     // MUST break or it falls through!
    case "Saturday":
    case "Sunday":
        console.log("Weekend");
        break;
    default:
        console.log("Invalid day");
}
// Output: "Weekday"

// WARNING: switch uses === (strict equality)
switch (1) {
    case "1":
        console.log("string");     // NOT reached — "1" !== 1
        break;
    case 1:
        console.log("number");     // ✅ reached
        break;
}
```

---

>>> 🔍 DEEP DIVE: switch FALL-THROUGH — INTENTIONAL USE

```javascript
// Intentional fall-through (no break between cases):
switch (action) {
    case "INCREMENT":
    case "DECREMENT":
        // Both INCREMENT and DECREMENT share this code
        validateRange();
        // FALL THROUGH (intentional — document it!)
    case "SET":
        updateState(action);
        break;
    default:
        throw new Error("Unknown action");
}

// Fall-through is RARELY correct — when in doubt, add break
// ESLint rule: no-fallthrough catches accidental fall-throughs
```

---

### 7.4 for Loop

```javascript
// Standard for loop — most control, most common in DSA
for (let i = 0; i < 5; i++) {
    console.log(i);
}
// Output: 0, 1, 2, 3, 4

// All three parts are optional:
// for (init; condition; update)
let j = 0;
for (; j < 3; ) {
    console.log(j);
    j++;
}

// Counting backwards
for (let i = 4; i >= 0; i--) {
    console.log(i);
}
// Output: 4, 3, 2, 1, 0

// Step by 2
for (let i = 0; i < 10; i += 2) {
    console.log(i);
}
// Output: 0, 2, 4, 6, 8
```

### 7.5 while & do...while

```javascript
// while — checks condition FIRST (might never execute)
let count = 0;
while (count < 3) {
    console.log(count);
    count++;
}
// Output: 0, 1, 2

// do...while — executes FIRST, checks condition AFTER (runs at least once)
let x = 10;
do {
    console.log(x);    // Output: 10  (runs once even though condition is false)
    x++;
} while (x < 5);
```

### 7.6 for...of vs for...in

```javascript
// for...of — iterates over VALUES of iterables (arrays, strings, Maps, Sets)
const fruits = ["apple", "banana", "cherry"];
for (const fruit of fruits) {
    console.log(fruit);
}
// Output: "apple", "banana", "cherry"

// for...in — iterates over KEYS (property names) of objects
const person = { name: "Alice", age: 25, city: "NYC" };
for (const key in person) {
    console.log(`${key}: ${person[key]}`);
}
// Output: "name: Alice", "age: 25", "city: NYC"
```

```text
for...of vs for...in:

  ┌──────────────────────────────────────────────────────────┐
  │  for...of → VALUES → use with arrays, strings, Maps     │
  │  for...in → KEYS   → use with objects                   │
  └──────────────────────────────────────────────────────────┘

  ⚠️ NEVER use for...in on arrays!
  It iterates over ALL enumerable properties (including inherited ones)
  and the order is NOT guaranteed.
```

```javascript
// ⚠️ for...in on arrays — BAD
const arr = [10, 20, 30];
arr.customProp = "bad";

for (const key in arr) {
    console.log(key);    // "0", "1", "2", "customProp"  ← includes custom property!
}

// ✅ for...of on arrays — GOOD
for (const val of arr) {
    console.log(val);    // 10, 20, 30  ← only values, no custom properties
}
```

---

>>> 🔍 DEEP DIVE: for...of INTERNALS — IT USES Symbol.iterator

`for...of` is syntactic sugar over the iterator protocol:

```javascript
// This for...of loop:
for (const x of [1, 2, 3]) { console.log(x); }

// Is equivalent to:
const iter = [1, 2, 3][Symbol.iterator]();
let result;
while (!(result = iter.next()).done) {
    const x = result.value;
    console.log(x);
}
```

**What's iterable in JavaScript:**
- Arrays, Strings, Maps, Sets, TypedArrays
- The `arguments` object
- NodeLists (DOM)
- Generators
- Any object with `[Symbol.iterator]` method

**What's NOT iterable:**
- Plain objects `{}` — add `[Symbol.iterator]` to make them iterable
- WeakMap, WeakSet — not iterable by design

---

>>> ⚠️ EDGE CASE: for...in ITERATES INHERITED PROPERTIES

```javascript
function Animal(name) { this.name = name; }
Animal.prototype.breathes = true;  // inherited property

const dog = new Animal("Rex");

for (const key in dog) {
    console.log(key);  // "name", "breathes"  ← inherited property included!
}

// FIX: use hasOwnProperty to filter
for (const key in dog) {
    if (dog.hasOwnProperty(key)) {
        console.log(key);  // Only "name"
    }
}

// Or better: use Object.keys() which only returns OWN enumerable properties
Object.keys(dog).forEach(key => console.log(key)); // "name"
```

---

### 7.7 break, continue, and Labels

```javascript
// break — exit the loop entirely
for (let i = 0; i < 10; i++) {
    if (i === 5) break;
    console.log(i);
}
// Output: 0, 1, 2, 3, 4

// continue — skip the current iteration, go to next
for (let i = 0; i < 6; i++) {
    if (i === 3) continue;
    console.log(i);
}
// Output: 0, 1, 2, 4, 5  (3 is skipped)

// Labels — name a loop so you can break/continue it from a nested loop
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i === 1 && j === 1) break outer;  // breaks the OUTER loop
        console.log(i, j);
    }
}
// Output: 0 0, 0 1, 0 2, 1 0  (stops when i=1, j=1)
```

### 7.8 Nested Loops — DSA Patterns

```javascript
// 1. 2D Matrix Traversal
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
        console.log(matrix[row][col]);
    }
}
// Output: 1, 2, 3, 4, 5, 6, 7, 8, 9

// 2. Finding pairs in an array (brute force)
const nums = [1, 2, 3, 4];
const target = 5;
for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {   // j starts at i+1 to avoid duplicates
        if (nums[i] + nums[j] === target) {
            console.log(`Pair: ${nums[i]}, ${nums[j]}`);
        }
    }
}
// Output: "Pair: 1, 4", "Pair: 2, 3"

// 3. Two-pointer pattern (iterate from both ends)
const sorted = [1, 3, 5, 7, 9];
let left = 0, right = sorted.length - 1;
while (left < right) {
    const sum = sorted[left] + sorted[right];
    if (sum === 10) {
        console.log(`Found: ${sorted[left]}, ${sorted[right]}`);
        left++;
        right--;
    } else if (sum < 10) {
        left++;
    } else {
        right--;
    }
}
// Output: "Found: 1, 9", "Found: 3, 7"
```

---

## 8. Functions: The Complete Picture

### 8.1 Three Ways to Create Functions

```javascript
// 1. Function Declaration — hoisted, available everywhere in scope
function add(a, b) {
    return a + b;
}

// 2. Function Expression — NOT hoisted, only available after this line
const subtract = function(a, b) {
    return a - b;
};

// 3. Arrow Function — concise syntax, NO own `this`
const multiply = (a, b) => a * b;

// Arrow function variations:
const square = x => x * x;              // single param: no parens needed
const greet = () => "hello";             // no params: empty parens required
const process = (a, b) => {              // multiline: need {} and explicit return
    const result = a + b;
    return result * 2;
};
```

---

>>> 🔍 DEEP DIVE: FUNCTION INTERNALS — WHAT EVERY FUNCTION OBJECT CONTAINS

Every function object in JavaScript has internal slots and properties:

```text
FUNCTION OBJECT (in memory):
┌──────────────────────────────────────────────────────────────┐
│  [[Call]]              Internal method to invoke the function│
│  [[Construct]]         Internal method for `new` operator    │
│                        (Arrow functions do NOT have this!)   │
│                                                              │
│  [[Environment]]       Reference to lexical scope where the  │
│                        function was DEFINED (forms closures) │
│                                                              │
│  [[FormalParameters]]  List of parameter names              │
│  [[ECMAScriptCode]]    The function body                     │
│  [[Realm]]             The realm (global context)           │
│                                                              │
│  .length               Number of expected parameters         │
│  .name                 Function name (inferred if anonymous) │
│  .prototype            Used when function is used with `new` │
│                        (Arrow functions do NOT have this!)   │
└──────────────────────────────────────────────────────────────┘
```

```javascript
// .length = number of DECLARED parameters (rest params don't count, default don't count)
function f(a, b, c) {}
f.length;   // 3

function g(a, b = 1, c) {}
g.length;   // 1 (stops counting at the first default parameter)

function h(a, ...rest) {}
h.length;   // 1 (rest parameter not counted)

// .name — inferred from context
const myFunc = function() {};
myFunc.name;   // "myFunc"  (inferred from variable name!)

const obj = { method() {} };
obj.method.name;  // "method"

const arrow = () => {};
arrow.name;  // "arrow"
```

---

>>> 🔍 DEEP DIVE: this BINDING — THE COMPLETE RULES

`this` is determined at **call time** (not definition time) for regular functions. Arrow functions capture `this` from their **definition scope**.

**Five rules for `this` binding (in priority order):**

```text
1. new binding (highest priority)
   const obj = new MyFunc()
   → `this` = the newly created object

2. Explicit binding
   func.call(obj, args)   → `this` = obj
   func.apply(obj, [args]) → `this` = obj
   const bound = func.bind(obj) → `this` = obj (permanently)

3. Implicit binding
   obj.method()   → `this` = obj (the object to the LEFT of the dot)

4. Default binding (lowest priority)
   func()   → `this` = globalThis (in non-strict mode)
            → `this` = undefined (in strict mode)

5. Arrow function (NOT a rule — arrows IGNORE all the above)
   Arrow function captures `this` from the SURROUNDING lexical scope.
   Cannot be changed by call/apply/bind.
```

```javascript
// Rule 3: Implicit binding — LOST when method is extracted
const obj = {
    name: "Alice",
    greet() { console.log(this.name); }
};

obj.greet();           // "Alice"  — implicit binding, this = obj

const fn = obj.greet;  // Extract the method
fn();                  // undefined (strict) / global (sloppy) — binding LOST!

// Fix: bind it
const boundFn = obj.greet.bind(obj);
boundFn();             // "Alice"  — explicit binding

// Fix: arrow function (captures this from outer scope)
const obj2 = {
    name: "Bob",
    greetLater() {
        setTimeout(() => console.log(this.name), 100);
        //         ↑ arrow: captures `this` from greetLater's context = obj2
    }
};
obj2.greetLater();  // "Bob"  — arrow preserves this

// Rule 1: new binding
function Person(name) {
    this.name = name;
    // When called with `new`, `this` = new empty object
    // The new object is auto-returned
}
const p = new Person("Charlie");
console.log(p.name); // "Charlie"
```

**call() vs apply() vs bind():**
```javascript
function greet(greeting, punctuation) {
    return `${greeting}, ${this.name}${punctuation}`;
}
const user = { name: "Alice" };

greet.call(user, "Hello", "!");    // "Hello, Alice!" (args spread)
greet.apply(user, ["Hello", "!"]); // "Hello, Alice!" (args as array)
const bound = greet.bind(user, "Hi"); // returns new function, "Hi" pre-filled
bound("?"); // "Hi, Alice?"
```

---

### 8.2 Hoisting Behavior

```javascript
// Function declarations ARE hoisted (can be called before definition)
sayHi();                    // ✅ "Hi!" — works!
function sayHi() {
    console.log("Hi!");
}

// Function expressions are NOT hoisted
sayBye();                   // ❌ TypeError: sayBye is not a function
var sayBye = function() {
    console.log("Bye!");
};

// Arrow functions are NOT hoisted (same as expressions)
greet();                    // ❌ ReferenceError: Cannot access 'greet' before initialization
const greet = () => console.log("Hey!");
```

```text
HOISTING COMPARISON:

  Type                    Hoisted?    Callable before declaration?
  ────                    ────────    ────────────────────────────
  function declaration    ✅ Yes      ✅ Yes (fully hoisted)
  var function expr       ✅ Yes      ❌ No (variable hoisted as undefined)
  const/let function      ✅ Yes      ❌ No (TDZ — ReferenceError)
  arrow function          ✅ Yes      ❌ No (TDZ — same as const/let)
```

### 8.3 Parameters & Arguments

```javascript
// Default parameters
function greet(name = "World") {
    console.log(`Hello, ${name}!`);
}
greet();           // "Hello, World!"
greet("Alice");    // "Hello, Alice!"

// Rest parameters (...) — collect remaining args into an array
function sum(...numbers) {
    return numbers.reduce((acc, n) => acc + n, 0);
}
sum(1, 2, 3, 4);   // 10
sum(10, 20);        // 30

// Rest MUST be the last parameter
function example(first, second, ...rest) {
    console.log(first);   // 1
    console.log(second);  // 2
    console.log(rest);    // [3, 4, 5]
}
example(1, 2, 3, 4, 5);

// The arguments object (available in regular functions, NOT in arrow functions)
function old() {
    console.log(arguments);        // [Arguments] { '0': 1, '1': 2, '2': 3 }
    console.log(arguments.length); // 3
    // arguments is array-LIKE, not a real array
    // Convert it: const args = Array.from(arguments);
}
old(1, 2, 3);
```

---

>>> 🔍 DEEP DIVE: DEFAULT PARAMETERS ARE EVALUATED AT CALL TIME

```javascript
// Default parameters are expressions evaluated FRESHLY on each call:
let count = 0;
function f(n = ++count) { return n; }
f();   // 1  (count incremented to 1)
f();   // 2  (count incremented to 2, not cached)
f(10); // 10 (default not used)

// Default parameters create their OWN scope:
function f2(a, b = a * 2) {
    return [a, b];
}
f2(5);      // [5, 10]  — b's default references a

// Later defaults can reference earlier ones:
function f3(size = 10, arr = new Array(size)) {
    return arr;
}
f3();       // Array(10)  — arr uses size's default
f3(5);      // Array(5)

// But NOT the function body's variables:
function f4(x = y) {  // y is a PARAMETER, not a body variable
    let y = 10;       // This `y` is in function body scope, not accessible in default
    return x;
}
f4();  // ReferenceError: y is not defined (at parameter evaluation time)
```

---

>>> ⚠️ EDGE CASE: ARROW FUNCTIONS vs REGULAR FUNCTIONS — FULL DIFFERENCES TABLE

```text
Feature                    Regular Function       Arrow Function
──────────────────────────────────────────────────────────────────
`this` binding             Dynamic (call-time)    Lexical (definition-time)
`arguments` object         ✅ Has it              ❌ No (use rest params)
`new` (as constructor)     ✅ Can use             ❌ TypeError
`.prototype` property      ✅ Has it              ❌ No
`super` keyword            ✅ Has it              ❌ No
`yield` (as generator)     ✅ Can use             ❌ No
`.name` property           ✅ Has it              ✅ (inferred)
Hoisted?                   Yes (declaration)      No (expression)
Used as method?            ✅ Good                ⚠️ Avoid (this issues)
Callback / HOF?            ✅ Fine                ✅ Preferred (clean syntax)
```

```javascript
// Common mistake: using arrow function as object method
const obj = {
    name: "Alice",
    greet: () => {
        console.log(this.name);  // undefined! 
        // Arrow captures `this` from OUTSIDE the object literal
        // which is global/undefined in strict mode
    }
};
obj.greet();  // undefined — NOT "Alice"

// Fix: use regular function method
const obj2 = {
    name: "Alice",
    greet() {
        console.log(this.name);  // "Alice" — implicit binding
    }
};
```

---

### 8.4 Return Values

```javascript
// Functions return undefined by default
function noReturn() {
    // no return statement
}
console.log(noReturn());  // undefined

// return ends the function immediately
function check(n) {
    if (n < 0) return "negative";  // early return
    if (n === 0) return "zero";
    return "positive";
}

// Returning multiple values (use an array or object)
function minMax(arr) {
    return { min: Math.min(...arr), max: Math.max(...arr) };
}
const { min, max } = minMax([3, 1, 4, 1, 5]);
console.log(min, max);  // 1, 5
```

---

>>> ⚠️ EDGE CASE: AUTOMATIC SEMICOLON INSERTION (ASI) WITH RETURN

```javascript
// DANGER: never put a newline immediately after `return`
function broken() {
    return
    { x: 1 };  // ← This object is UNREACHABLE
}
broken();  // undefined — ASI inserts semicolon after `return`!

// SAFE: opening brace on the same line as `return`
function fixed() {
    return {
        x: 1
    };
}
fixed();  // { x: 1 } ✅
```

This is WHY JavaScript style guides (and React) require the opening `{` on the same line. ASI is the culprit.

---

### 8.5 First-Class Functions

In JavaScript, functions are **first-class citizens** — they are treated like any other value. You can:

```javascript
// 1. Assign to a variable
const greet = function() { return "hi"; };

// 2. Store in a data structure
const operations = [
    (a, b) => a + b,
    (a, b) => a - b,
    (a, b) => a * b,
];
operations[0](5, 3);  // 8

// 3. Pass as an argument to another function
function execute(fn, a, b) {
    return fn(a, b);
}
execute((x, y) => x + y, 5, 3);  // 8

// 4. Return from another function
function multiplier(factor) {
    return function(number) {
        return number * factor;
    };
}
const double = multiplier(2);
const triple = multiplier(3);
double(5);   // 10
triple(5);   // 15
```

### 8.6 Higher-Order Functions

A **higher-order function** either takes a function as an argument OR returns a function.

```javascript
// Takes a function as argument:
[1, 2, 3].map(x => x * 2);           // [2, 4, 6]
[1, 2, 3, 4].filter(x => x % 2 === 0); // [2, 4]
[1, 2, 3].reduce((acc, x) => acc + x, 0); // 6

// Returns a function:
function createGreeter(greeting) {
    return function(name) {
        return `${greeting}, ${name}!`;
    };
}
const hello = createGreeter("Hello");
const hi = createGreeter("Hi");
hello("Alice");  // "Hello, Alice!"
hi("Bob");       // "Hi, Bob!"
```

### 8.7 Callback Functions

A **callback** is a function passed to another function to be called later.

```javascript
// Synchronous callback
function processArray(arr, callback) {
    const result = [];
    for (const item of arr) {
        result.push(callback(item));
    }
    return result;
}
processArray([1, 2, 3], x => x * 2);  // [2, 4, 6]

// Asynchronous callback
setTimeout(() => {
    console.log("Runs after 1 second");
}, 1000);
```

### 8.8 IIFE (Immediately Invoked Function Expression)

A function that runs **immediately** after it's defined.

```javascript
// Syntax: wrap in () and call with ()
(function() {
    const secret = "hidden";
    console.log("IIFE ran!");
})();

// With arrow function
(() => {
    console.log("Arrow IIFE!");
})();

// Use case: create a private scope (avoid polluting global scope)
const counter = (() => {
    let count = 0;                 // private — not accessible outside
    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count,
    };
})();

counter.increment();
counter.increment();
counter.getCount();    // 2
// count is NOT accessible here — it's private inside the IIFE
```

### 8.9 Pure Functions vs Side Effects

```javascript
// PURE function — same input always gives same output, no side effects
function add(a, b) {
    return a + b;    // depends ONLY on inputs, modifies NOTHING outside
}
add(2, 3);  // always 5

// IMPURE function — modifies external state (side effect)
let total = 0;
function addToTotal(n) {
    total += n;      // modifies external variable — SIDE EFFECT
    return total;
}
addToTotal(5);  // 5
addToTotal(5);  // 10  ← different result for same input!
```

```text
PURE vs IMPURE:

  PURE:                          IMPURE:
  ┌──────────────────────┐      ┌──────────────────────┐
  │  Same input →        │      │  Same input → might  │
  │  ALWAYS same output  │      │  give DIFFERENT output│
  │                      │      │                      │
  │  No side effects     │      │  Has side effects:   │
  │  (doesn't change     │      │  • Modify external   │
  │   anything outside)  │      │    variables         │
  │                      │      │  • Console.log       │
  │  Predictable ✅      │      │  • Network requests  │
  │  Testable ✅         │      │  • Mutate arguments  │
  └──────────────────────┘      └──────────────────────┘

  For DSA: prefer pure functions — they're easier to debug and test.
```

---

>>> 🔍 DEEP DIVE: FUNCTION COMPOSITION AND CURRYING

**Currying** — transforming a function that takes multiple arguments into a sequence of functions that each take one argument:

```javascript
// Normal function
const add = (a, b) => a + b;
add(2, 3); // 5

// Curried version
const curriedAdd = a => b => a + b;
curriedAdd(2)(3);   // 5
const add2 = curriedAdd(2);  // partial application
add2(3);   // 5
add2(10);  // 12

// General curry utility
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        return function(...moreArgs) {
            return curried.apply(this, args.concat(moreArgs));
        };
    };
}

const curriedMultiply = curry((a, b, c) => a * b * c);
curriedMultiply(2)(3)(4);   // 24
curriedMultiply(2, 3)(4);   // 24
curriedMultiply(2)(3, 4);   // 24
```

**Function composition:**
```javascript
// compose: applies right-to-left
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

// pipe: applies left-to-right (more readable)
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const double = x => x * 2;
const addOne = x => x + 1;
const square = x => x * x;

// pipe(double, addOne, square)(3)
// = square(addOne(double(3)))
// = square(addOne(6))
// = square(7)
// = 49
pipe(double, addOne, square)(3);  // 49
```

---

## 9. Scope, Closures & Lexical Environment

### 9.1 The Three Types of Scope

**Scope** determines where variables are visible and accessible.

```javascript
// 1. GLOBAL SCOPE (visible everywhere)
const globalVar = "I am global";

function exampleScope() {
    // 2. FUNCTION SCOPE (visible only inside this function)
    var funcVar = "I am in a function";
    let modernVar = "Me too";

    if (true) {
        // 3. BLOCK SCOPE (visible only inside these {})
        let blockVar = "I am in a block";
        const alsoBlock = "Me too";
        var leakingVar = "I LEAK out of the block!";  // var ignores block scope
        
        console.log(globalVar);   // ✅ Works (searches outward)
    }

    // console.log(blockVar);     // ❌ ReferenceError (blockVar died)
    console.log(leakingVar);      // ✅ Works (var leaked to function scope)
}
// console.log(funcVar);          // ❌ ReferenceError (funcVar died)
```

### 9.2 Lexical Environment & The Scope Chain

When JavaScript executes code, it creates a **Lexical Environment** for every function call and block. It consists of two parts:
1. **Environment Record:** The local variables declared inside.
2. **Outer Reference:** A pointer to the *outer* lexical environment.

If JS can't find a variable locally, it follows the outer reference to look in the parent scope. This is the **Scope Chain**.

```javascript
const name = "Global";

function outer() {
    const outerVar = "Outer";

    function inner() {
        const innerVar = "Inner";
        console.log(innerVar); // Finds "Inner" locally
        console.log(outerVar); // Not found locally → looks at outer() → finds "Outer"
        console.log(name);     // LOOKS: inner() → outer() → Global → finds "Global"
    }
    
    inner();
}
outer();
```

```text
LEXICAL ENVIRONMENT & SCOPE CHAIN:

  [Global Env] ────▶ name: "Global"
         ▲           outer: <function>
         │(outer ref)
         │
  [outer() Env] ───▶ outerVar: "Outer"
         ▲           inner: <function>
         │(outer ref)
         │
  [inner() Env] ───▶ innerVar: "Inner"

When inner() asks for `name`:
1. Check inner() Env   → not found
2. Check outer() Env   → not found
3. Check Global Env    → found "Global"! ✅
```

---

>>> 🧠 INTERNALS: SCOPE CHAIN RESOLUTION IN THE SPEC

The scope chain resolution algorithm (GetIdentifierReference):

```text
GetIdentifierReference(env, name, strict):

  1. If env is null:
       → return Reference(undefined, name, strict)  [unresolvable reference]
  
  2. Let exists = env.HasBinding(name)
  
  3. If exists is true:
       → return Reference(env, name, strict)
  
  4. Else:
       → let outer = env.[[OuterEnv]]
       → return GetIdentifierReference(outer, name, strict)
                                                    ↑ RECURSIVE walk up the chain
```

**Shadow variables — inner scope wins:**

```javascript
let x = "global";

function outer() {
    let x = "outer";    // shadows the global `x` in this scope
    
    function inner() {
        let x = "inner";  // shadows outer's `x`
        console.log(x);   // "inner" — found in own scope, stops searching
    }
    
    inner();
    console.log(x);  // "outer"
}

outer();
console.log(x);  // "global"
```

**Note:** Variable shadowing is legal but can cause bugs. Tools like ESLint have `no-shadow` rules to warn about it.

---

### 9.3 Closures: The Definition

A **Closure** is a function that remembers its outer variables (its lexical environment) **even after the outer function has finished executing**.

This happens because functions in JavaScript maintain a hidden `[[Environment]]` property pointing to where they were created.

```javascript
function makeCounter() {
    let count = 0;             // Local variable in makeCounter
    
    return function() {        // Returns this inner function
        count++;               // It uses the outer variable `count`
        return count;
    };
}

const counter1 = makeCounter();
// makeCounter() has finished executing. Its execution context is GONE.
// BUT `counter1` still remembers `count`!

console.log(counter1()); // 1
console.log(counter1()); // 2

// Creating a new counter creates a NEW lexical environment
const counter2 = makeCounter();
console.log(counter2()); // 1  (starts fresh)
```

```text
HOW CLOSURES SURVIVE THE CALL STACK:

  1. makeCounter() executes. Creates `count = 0`.
  2. makeCounter() returns the inner function and Pops off the Call Stack.
  3. Normally, `count` would be garbage collected.
  4. BUT the returned inner function still holds a reference to that Lexical Environment!
  5. The heap keeps that Lexical Environment alive (Closure).

  HEAP MEMORY:
  ┌──────────────────────────────────────────────┐
  │ Closure (Lexical Environment of makeCounter) │
  │   └── count: 2                               │ ← The function modifies this!
  └──────────────────────────────────────────────┘
           ▲
           │ (hidden [[Environment]] reference)
           │
     counter1 function
```

### 9.4 Practical Closure Patterns

#### Data Privacy (Encapsulation)

```javascript
function createBankAccount(initialBalance) {
    let balance = initialBalance;  // PRIVATE variable

    return {
        deposit: function(amount) {
            if (amount > 0) balance += amount;
        },
        withdraw: function(amount) {
            if (amount <= balance) balance -= amount;
        },
        getBalance: function() {
            return balance;
        }
    };
}

const account = createBankAccount(100);
account.deposit(50);
console.log(account.getBalance()); // 150
console.log(account.balance);      // undefined  ← Can't access it directly!
```

#### Function Factories

```javascript
function createMultiplier(multiplier) {
    return function(num) {
        return num * multiplier; // Remembers `multiplier`
    };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

#### Memoization (Caching Results)

```javascript
function memoizedAdd() {
    const cache = {}; // Private cache object
    
    return function(n) {
        if (n in cache) {
            console.log("Fetching from cache");
            return cache[n];
        } else {
            console.log("Calculating result");
            const result = n + 10;
            cache[n] = result;
            return result;
        }
    }
}

const add10 = memoizedAdd();
add10(5); // "Calculating result" → 15
add10(5); // "Fetching from cache" → 15 (fast!)
```

---

>>> 🔍 DEEP DIVE: GENERIC MEMOIZE FUNCTION (FOR DSA)

```javascript
// General-purpose memoize for any function with serializable arguments
function memoize(fn) {
    const cache = new Map();
    
    return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}

// Classic DSA use: memoized Fibonacci
const fib = memoize(function(n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
});

fib(40);  // instant (without memoize, this would be ~10^9 operations)
fib(100); // instant

// WeakMap-based memoize (for object arguments — allows GC):
function memoizeWeak(fn) {
    const cache = new WeakMap();
    return function(obj) {
        if (cache.has(obj)) return cache.get(obj);
        const result = fn(obj);
        cache.set(obj, result);
        return result;
    };
}
```

---

### 9.5 The Classic Closure Pitfall (var in Loops)

```javascript
// THE PROBLEM: Using `var`
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);
    }, 100);
}
// Output: 3, 3, 3

// THE MODERN SOLUTION: Using `let`
for (let j = 0; j < 3; j++) {
    setTimeout(function() {
        console.log(j);
    }, 100);
}
// Output: 0, 1, 2

// THE ES5 SOLUTION: IIFE
for (var k = 0; k < 3; k++) {
    (function(cachedK) {
        setTimeout(function() {
            console.log(cachedK);
        }, 100);
    })(k);
}
// Output: 0, 1, 2
```

---

## 10. Hoisting & Temporal Dead Zone

### 10.1 What is Hoisting?

**Hoisting** is JavaScript's behavior of moving declarations to the top of their current scope (during the Creation Phase of the Execution Context, before the code actually runs). 

However, **how** they are hoisted depends on the keyword used (`var`, `let`, `const`, or `function`).

### 10.2 Function Declarations (Fully Hoisted)

```javascript
console.log(multiply(2, 3)); // 6

function multiply(a, b) {
    return a * b;
}
```

### 10.3 `var` Variables (Hoisted as `undefined`)

```javascript
console.log(message); // Output: undefined  (no ReferenceError!)
var message = "Hello";
console.log(message); // Output: "Hello"
```

### 10.4 `let` and `const` (Hoisted, but in the TDZ)

```javascript
// console.log(age);     // ❌ ReferenceError: Cannot access 'age' before initialization

let age = 25;
console.log(age);        // 25
```

```text
THE TEMPORAL DEAD ZONE (TDZ):

  {                      // Block scope starts here
                         // TDZ FOR `name` STARTS
                         
    console.log(name);   // ❌ ERROR! We are inside the TDZ for `name`
                         
    let name = "Alice";  // TDZ FOR `name` ENDS HERE
    
    console.log(name);   // ✅ Works
  }
```

```javascript
let x = "outer";

function test() {
    console.log(x);      // ❌ ReferenceError! 
    let x = "inner";
}
test();
```

### 10.5 Function Expressions & Arrow Functions

```javascript
// 1. Using var
console.log(sayHi);      // Output: undefined (var hoisting)
var sayHi = function() { console.log("Hi"); };

// 2. Using const (or let)
const sayBye = () => console.log("Bye");
```

### 10.6 Hoisting Summary Table

| Declaration Type | Is it Hoisted? | Initial Value during Hoisting | Can you use before declaration? |
|:-----------------|:---------------|:------------------------------|:--------------------------------|
| `function` decl. | ✅ Yes | The actual function body | ✅ Yes |
| `var` | ✅ Yes | `undefined` | ⚠️ Yes (but value is `undefined`) |
| `let` / `const` | ✅ Yes | *uninitialized* (in TDZ) | ❌ No (ReferenceError) |
| Class declaration| ✅ Yes | *uninitialized* (in TDZ) | ❌ No (ReferenceError) |
| `import` | ✅ Yes | The imported module | ✅ Yes (always hoisted to top) |

---

>>> 🔍 DEEP DIVE: WHY TDZ EXISTS (THE DESIGN REASON)

The TDZ was deliberately designed to catch a class of bugs. Before `let`/`const`, with `var`:

```javascript
// Bug-prone pattern with var:
function processUser(id) {
    if (id > 0) {
        var user = fetchUser(id); // only assigned here
    }
    console.log(user); // undefined — no error! silent bug
}

// With let, this becomes a proper error:
function processUser2(id) {
    if (id > 0) {
        let user = fetchUser(id);
    }
    console.log(user); // ReferenceError — caught immediately! ✅
}
```

The TDZ also enforces the discipline of "declare before use" — a good practice in any language.

---

>>> ⚠️ EDGE CASE: typeof AND TDZ

```javascript
// typeof is normally safe for undeclared variables:
typeof undeclaredVar;  // "undefined" — no error (safety hatch)

// BUT typeof does NOT protect you from TDZ:
typeof letVar;         // ❌ ReferenceError — still in TDZ!
let letVar = 5;

// This is by design — the TDZ error tells you about a real problem in your code.
```

---

>>> ⚠️ EDGE CASE: CLASS DECLARATIONS AND TDZ

```javascript
// Classes are in the TDZ just like let/const:
const instance = new MyClass(); // ❌ ReferenceError!

class MyClass {
    constructor() { this.x = 1; }
}

// Unlike function declarations, classes are NOT usable before their definition.
// This prevents confusing behavior with class hierarchies.
```

---

## 11. Pass by Value vs Reference & Copying

### 11.1 The Golden Rule of Function Arguments

In JavaScript, **ALL** function arguments are passed by **value**. 
However, if the argument is an object/array, the "value" that gets passed is a **reference** (memory address) to that object.

### 11.2 Passing Primitives (Pass by Value)

```javascript
function changePrimitive(val) {
    val = 99;
    console.log("Inside:", val); // 99
}

let num = 10;
changePrimitive(num);
console.log("Outside:", num);   // 10  ← Unchanged!
```

### 11.3 Passing Objects (Call by Sharing / Pass by Reference-Value)

```javascript
function modifyObject(obj) {
    obj.name = "Hacker";
}

let user = { name: "Alice" };
modifyObject(user);
console.log("Outside:", user.name);  // "Hacker" ← IT CHANGED!
```

```javascript
function reassignObject(obj) {
    obj = { name: "Hacker" };
    console.log("Inside:", obj.name); // "Hacker"
}

let user = { name: "Alice" };
reassignObject(user);
console.log("Outside:", user.name);  // "Alice" ← UNCHANGED!
```

### 11.4 Copying Objects: Shallow vs Deep

#### Shallow Copy

```javascript
const original = { name: "Alice", address: { city: "NYC" } };

// 1. Spread Operator (Modern way)
const copy1 = { ...original };

// 2. Object.assign (Older way)
const copy2 = Object.assign({}, original);

copy1.name = "Bob";
console.log(original.name); // "Alice" (safe!)

copy1.address.city = "LA";
console.log(original.address.city); // "LA" (the original was mutated!)
```

#### Deep Copy

```javascript
const original = { 
    name: "Alice", 
    address: { city: "NYC" },
    date: new Date(),
    greet() { return "hi"; }
};

// 1. structuredClone (Native, modern, best way!) -> ES2022
const deep1 = structuredClone(original);
deep1.address.city = "LA";
console.log(original.address.city); // "NYC" (safe!)

// 2. The JSON trick (Older, hacky way)
const deep2 = JSON.parse(JSON.stringify(original));
// Limitations: Dates become strings, Functions removed, undefined lost, no circular refs
```

---

>>> 🔍 DEEP DIVE: structuredClone — WHAT IT CAN AND CAN'T CLONE

`structuredClone()` uses the **Structured Clone Algorithm** (also used by postMessage and IndexedDB):

```javascript
// ✅ structuredClone SUPPORTS:
structuredClone({ date: new Date() });        // Date objects
structuredClone(new Map([[1, 2]]));            // Maps
structuredClone(new Set([1, 2, 3]));          // Sets
structuredClone(new Int32Array([1, 2, 3]));   // TypedArrays
structuredClone({ regex: /abc/gi });           // RegExp
structuredClone(new Error("oops"));            // Error objects
structuredClone({ blob: new Blob(["hi"]) });   // Blobs (browser)

// Circular references!
const circ = {};
circ.self = circ;
structuredClone(circ); // ✅ handles circular references

// ❌ structuredClone DOES NOT SUPPORT:
// Functions — throws DataCloneError
structuredClone({ fn: () => {} });  // ❌ DataCloneError

// DOM nodes — throws DataCloneError
structuredClone(document.body);     // ❌ DataCloneError

// Class instances lose their prototype chain
class Point { constructor(x,y){this.x=x;this.y=y;} }
const p = new Point(1,2);
const clone = structuredClone(p);
clone instanceof Point;  // false — it's a plain object now
```

---

>>> 🔍 DEEP DIVE: ARRAY COPYING GOTCHAS

```javascript
const arr = [[1, 2], [3, 4]];

// Shallow copies:
const s1 = arr.slice();
const s2 = [...arr];
const s3 = Array.from(arr);
const s4 = arr.concat();

// All shallow — nested arrays are still shared:
s1[0].push(99);
console.log(arr[0]);  // [1, 2, 99] — original mutated!

// Deep copy of array:
const deep = structuredClone(arr);
deep[0].push(99);
console.log(arr[0]);  // [1, 2] — original safe ✅
```

---

## 12. Error Handling

### 12.1 The `try...catch...finally` Block

```javascript
try {
    console.log("Start of try");
    lalala; // Error! Variable is not defined!
    console.log("End of try (never reached)");
    
} catch (err) {
    console.log("An error occurred!");
    
} finally {
    console.log("This will always execute.");
}
```

### 12.2 The `Error` Object

```javascript
try {
    nonExistentFunction();
} catch (err) {
    console.log(err.name);    // "ReferenceError"
    console.log(err.message); // "nonExistentFunction is not defined"
    console.log(err.stack);   // The call stack trace
}
```

**Built-in Error Types:**
1. `ReferenceError`: Using an undeclared variable.
2. `TypeError`: Doing something to a value not permitted for its type.
3. `SyntaxError`: Invalid JavaScript code.
4. `RangeError`: A numeric variable is outside its valid range.

### 12.3 Throwing Your Own Errors

```javascript
function divide(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new TypeError("Both arguments must be numbers");
    }
    if (b === 0) {
        throw new Error("Cannot divide by zero");
    }
    return a / b;
}

try {
    divide(10, 0);
} catch (err) {
    console.log(`${err.name}: ${err.message}`);
}
```

---

>>> 🔍 DEEP DIVE: CUSTOM ERROR CLASSES (PRODUCTION PATTERN)

```javascript
// Custom error classes for precise error handling:
class ValidationError extends Error {
    constructor(message, field) {
        super(message);
        this.name = "ValidationError";
        this.field = field;
        
        // Fix prototype chain (needed in some environments)
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

class NetworkError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = "NetworkError";
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}

// Usage:
try {
    throw new ValidationError("Name is required", "name");
} catch (err) {
    if (err instanceof ValidationError) {
        console.log(`Field "${err.field}": ${err.message}`);
    } else if (err instanceof NetworkError) {
        console.log(`HTTP ${err.statusCode}: ${err.message}`);
    } else {
        throw err;  // Re-throw unknown errors — don't swallow them!
    }
}
```

---

>>> ⚠️ EDGE CASE: FINALLY ALWAYS RUNS — EVEN WITH return

```javascript
function test() {
    try {
        return "from try";
    } finally {
        console.log("finally runs!");
        // return "from finally";  // ← This would OVERRIDE the try's return!
    }
}
test();
// "finally runs!"
// returns "from try"

// If finally has its own return, it overrides:
function test2() {
    try {
        return "from try";
    } finally {
        return "from finally";  // ← Overrides "from try"!
    }
}
test2(); // "from finally"  — the "from try" is lost!
```

---

>>> 🔍 DEEP DIVE: ERROR HANDLING WITH ASYNC/AWAIT

```javascript
// Async functions — errors from rejected promises become catchable
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new NetworkError(`HTTP error`, response.status);
        }
        const data = await response.json();
        return data;
    } catch (err) {
        if (err instanceof NetworkError) {
            console.error("Network issue:", err.statusCode);
        } else {
            console.error("Unexpected error:", err);
            throw err;  // re-throw unexpected errors
        }
    }
}

// Pattern: centralized error handler
async function withErrorHandling(fn) {
    try {
        return { data: await fn(), error: null };
    } catch (error) {
        return { data: null, error };
    }
}

const { data, error } = await withErrorHandling(() => fetchData("/api/users"));
if (error) { /* handle */ }
else { /* use data */ }
```

---

## 13. JSON, Regular Expressions & Template Literals

### 13.1 JSON (JavaScript Object Notation)

```javascript
const user = { 
    name: "Alice", 
    age: 25, 
    isActive: true,
    skills: ["JS", "React"]
};

// 1. JSON.stringify() → Object to JSON string
const jsonString = JSON.stringify(user);
console.log(typeof jsonString); // "string"

// Pretty printing
const prettyJson = JSON.stringify(user, null, 2);

// 2. JSON.parse() → JSON string to Object
const parsedUser = JSON.parse(jsonString);
console.log(typeof parsedUser); // "object"
console.log(parsedUser.name);   // "Alice"
```

**JSON Limitations:**
- Functions: removed by `stringify`
- `undefined`: removed
- `Symbol`: ignored
- Circular references: `TypeError`
- Dates: converted to ISO strings (not auto-restored)

---

>>> 🔍 DEEP DIVE: JSON.stringify ADVANCED OPTIONS

```javascript
// 2nd argument: "replacer" — filter/transform properties
const obj = { name: "Alice", password: "secret", age: 25 };

// Array replacer: only include these keys
JSON.stringify(obj, ["name", "age"]);
// '{"name":"Alice","age":25}'  — password excluded!

// Function replacer: custom logic
JSON.stringify(obj, (key, value) => {
    if (key === "password") return undefined;  // exclude
    if (typeof value === "number") return value * 2;  // transform
    return value;
});
// '{"name":"Alice","age":50}'

// 3rd argument: "space" — pretty printing
JSON.stringify(obj, null, 2);    // 2 spaces
JSON.stringify(obj, null, "\t"); // tab character

// toJSON method — custom serialization
const custom = {
    name: "Alice",
    createdAt: new Date(),
    toJSON() {
        return { name: this.name, timestamp: this.createdAt.getTime() };
    }
};
JSON.stringify(custom); // uses toJSON() result
```

**JSON.parse with reviver (transform during parsing):**
```javascript
const dateString = '{"name":"Alice","createdAt":"2024-01-01T00:00:00.000Z"}';

const parsed = JSON.parse(dateString, (key, value) => {
    if (key === "createdAt") return new Date(value);  // restore Date!
    return value;
});
parsed.createdAt instanceof Date;  // true ✅
```

---

### 13.2 Regular Expressions (RegExp)

```javascript
// Two ways to create a RegExp:
const regex1 = /hello/i;               // Literal syntax (preferred)
const regex2 = new RegExp("hello", "i"); // Constructor syntax

// Flags:
// i = case-insensitive
// g = global (find ALL matches)
// m = multiline (^ and $ match start/end of each line)

const str = "Hello world! hello again.";

// 1. regex.test() → boolean
console.log(/world/.test(str));  // true

// 2. string.match(regex) → array of matches
console.log(str.match(/hello/ig)); // ["Hello", "hello"]

// 3. string.replace(regex, replacement)
console.log(str.replace(/hello/ig, "Hi")); // "Hi world! Hi again."

// DSA: Remove non-alphanumeric characters
const dirtyStr = "A man, a plan, a canal: Panama";
const cleanStr = dirtyStr.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
console.log(cleanStr); // "amanaplanacanalpanama"

// Split by multiple delimiters
const sentence = "Word1,  word2! word3.";
const words = sentence.split(/[\s,!\.]+/).filter(Boolean);
```

---

>>> 🔍 DEEP DIVE: REGEX GROUPS, LOOKAHEAD, AND NAMED CAPTURES

```javascript
// Capturing groups ()
const dateStr = "2024-01-15";
const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
// match[0] = "2024-01-15" (full match)
// match[1] = "2024" (group 1)
// match[2] = "01"   (group 2)
// match[3] = "15"   (group 3)

// Named capturing groups (?<name>...)  — ES2018
const namedMatch = dateStr.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
namedMatch.groups.year;   // "2024"
namedMatch.groups.month;  // "01"
namedMatch.groups.day;    // "15"

// Non-capturing group (?:...)  — groups for alternation without capturing
/(?:cat|dog)s?/;  // matches "cat", "cats", "dog", "dogs" but doesn't capture

// Lookahead (?=...) and (?!...)
/\d+(?= dollars)/;   // matches numbers followed by " dollars" (doesn't capture " dollars")
/\d+(?! dollars)/;   // matches numbers NOT followed by " dollars"

// Lookbehind (?<=...) and (?<!...)  — ES2018
/(?<=\$)\d+/;    // matches digits preceded by $
/(?<!\$)\d+/;    // matches digits NOT preceded by $

// String.prototype.matchAll (ES2020) — returns all matches with groups
const text = "cat and bat and sat";
const matches = [...text.matchAll(/(\w)at/g)];
matches[0][1];  // "c"
matches[1][1];  // "b"
matches[2][1];  // "s"
```

---

### 13.3 Template Literals (ES6)

```javascript
// 1. String Interpolation
const name = "Alice";
const score = 95;
const msg = `Player ${name} scored ${score} points!`;

// 2. Multiline Strings
const html = `
    <div>
        <h1>Welcome</h1>
    </div>
`;
```

#### Tagged Templates

```javascript
function highlight(strings, ...values) {
    let result = "";
    for (let i = 0; i < values.length; i++) {
        result += strings[i];
        result += `<mark>${values[i]}</mark>`; 
    }
    result += strings[strings.length - 1];
    return result;
}

const user = "Alice";
const pass = "12345";
const output = highlight`Login: ${user}, Password: ${pass} is invalid.`;
```

---

>>> 🔍 DEEP DIVE: TAGGED TEMPLATES IN PRODUCTION

Tagged templates power several production libraries:

```javascript
// SQL injection prevention (e.g., pg library for Node.js):
const userId = userInput; // potentially dangerous user input
const query = sql`SELECT * FROM users WHERE id = ${userId}`;
// The `sql` tag function sanitizes/parameterizes the value — not raw string concat!

// CSS-in-JS (styled-components):
const Button = styled.button`
    background: ${props => props.primary ? 'blue' : 'white'};
    color: ${props => props.primary ? 'white' : 'blue'};
`;

// GraphQL queries (Apollo):
const GET_USER = gql`
    query GetUser($id: ID!) {
        user(id: $id) { name email }
    }
`;

// HTML sanitization (lit-html):
html`<div class="${className}">${unsafeUserContent}</div>`;
// The tag function escapes the user content automatically

// String.raw — gets the raw string without escape processing:
String.raw`Hello\nWorld`;  // "Hello\\nWorld" — backslash-n, not newline
```

---

## 14. Advanced Topics

### 14.1 WeakMap and WeakSet

```javascript
// 1. Regular Map (Strong Reference)
let strongMap = new Map();
let user1 = { name: "Alice" };
strongMap.set(user1, "Admin");
user1 = null; 
// The object is STILL in memory because strongMap holds it!

// 2. WeakMap (Weak Reference)
let weakMap = new WeakMap();
let user2 = { name: "Bob" };
weakMap.set(user2, "Guest");
user2 = null;
// The object is now GARBAGE COLLECTED.
```

**Key rules:**
1. Keys **MUST** be objects
2. They are **NOT iterable**
3. Use cases: private data, DOM metadata, memoization caches

### 14.2 Iterators and Iterables

```javascript
// Manually using an iterator
const arr = ["a", "b", "c"];
const iterator = arr[Symbol.iterator]();

console.log(iterator.next()); // { value: 'a', done: false }
console.log(iterator.next()); // { value: 'b', done: false }
console.log(iterator.next()); // { value: 'c', done: false }
console.log(iterator.next()); // { value: undefined, done: true }

// Custom iterable object
const range = {
    start: 1,
    end: 3,
    [Symbol.iterator]() {
        let current = this.start;
        let last = this.end;
        return {
            next() {
                if (current <= last) {
                    return { value: current++, done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
};

for (const num of range) {
    console.log(num); // 1, 2, 3
}
```

---

>>> 🔍 DEEP DIVE: ASYNC ITERATORS (for await...of)

ES2018 added async iterators for consuming async data streams:

```javascript
// Async iterable (e.g., paginated API results)
async function* paginate(url) {
    let page = 1;
    while (true) {
        const response = await fetch(`${url}?page=${page}`);
        const data = await response.json();
        if (data.results.length === 0) return;
        yield data.results;  // yield a whole page
        page++;
    }
}

// Consume with for await...of:
for await (const page of paginate("/api/items")) {
    processPage(page);
}

// Real-world: Node.js streams are async iterables
const fs = require("fs");
const stream = fs.createReadStream("large-file.txt", { encoding: "utf8" });
for await (const chunk of stream) {
    process(chunk);
}
```

---

### 14.3 Generators (`function*` and `yield`)

```javascript
function* myGenerator() {
    console.log("Started");
    yield 1;
    
    console.log("Resumed!");
    yield 2;
    
    console.log("Finished");
    return 3;
}

const gen = myGenerator();

console.log(gen.next()); // "Started", { value: 1, done: false }
console.log(gen.next()); // "Resumed!", { value: 2, done: false }
console.log(gen.next()); // "Finished", { value: 3, done: true }

// Infinite Generator
function* idMaker() {
    let index = 1;
    while (true) {
        yield index++;
    }
}
const ids = idMaker();
console.log(ids.next().value); // 1
console.log(ids.next().value); // 2
```

---

>>> 🔍 DEEP DIVE: TWO-WAY COMMUNICATION WITH GENERATORS

`yield` is not just output — it can also receive INPUT via `next(value)`:

```javascript
function* calculator() {
    let result = 0;
    while (true) {
        const input = yield result;  // pauses AND receives a value
        if (input === null) break;
        result += input;
    }
    return result;
}

const calc = calculator();
calc.next();    // start the generator (result = 0, waiting for input)
calc.next(5);   // sends 5 → result = 5, yields 5
calc.next(3);   // sends 3 → result = 8, yields 8
calc.next(2);   // sends 2 → result = 10, yields 10
calc.next(null);// sends null → breaks → { value: 10, done: true }

// Generator.return(value) — force-end the generator:
const gen = idMaker();
gen.next();         // { value: 1, done: false }
gen.return("done"); // { value: "done", done: true }
gen.next();         // { value: undefined, done: true }  (finished)

// Generator.throw(error) — inject an error into the generator:
function* safe() {
    try {
        yield 1;
        yield 2;
    } catch (e) {
        console.log("Caught:", e.message);
        yield 3;  // can continue after catching!
    }
}
const s = safe();
s.next();           // { value: 1, done: false }
s.throw(new Error("oops")); // "Caught: oops", { value: 3, done: false }
```

---

>>> 🔍 DEEP DIVE: GENERATOR USE CASES IN PRODUCTION

```javascript
// 1. Lazy infinite sequences (memory efficient)
function* fibonacci() {
    let [a, b] = [0, 1];
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

// Take first 10 fibonacci numbers:
function take(n, iter) {
    const result = [];
    for (const val of iter) {
        result.push(val);
        if (result.length >= n) break;
    }
    return result;
}
take(10, fibonacci()); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// 2. Async flow control (the basis of async/await before it existed)
// (This is approximately how Babel used to transpile async/await to generators)

// 3. Tree/graph traversal without recursion (avoids stack overflow)
function* dfs(node) {
    yield node.value;
    for (const child of node.children) {
        yield* dfs(child);  // yield* delegates to another generator
    }
}
// yield* spreads the yielded values of another iterable inline

// 4. State machines
function* trafficLight() {
    while (true) {
        yield "green";
        yield "yellow";
        yield "red";
    }
}
```

---

### 14.4 Recursion (The Call Stack in Action)

```javascript
function factorial(n) {
    if (n === 1) return 1;
    return n * factorial(n - 1);
}

console.log(factorial(3)); // 6
```

```text
HOW RECURSION USES THE CALL STACK:

  factorial(3) called:
  
  ┌─────────────────────────────────────────────────────────┐
  │ factorial(1) → hits base case, returns 1                │
  ├─────────────────────────────────────────────────────────┤
  │ factorial(2) → suspended, waiting for factorial(1)      │
  ├─────────────────────────────────────────────────────────┤
  │ factorial(3) → suspended, waiting for factorial(2)      │
  └─────────────────────────────────────────────────────────┘
```

---

>>> 🔍 DEEP DIVE: CONVERTING RECURSION TO ITERATION (AVOID STACK OVERFLOW)

When input is too large for recursive calls, use an explicit stack:

```javascript
// Recursive DFS (risky for deep trees — stack overflow)
function dfsRecursive(node) {
    console.log(node.value);
    for (const child of node.children) {
        dfsRecursive(child);
    }
}

// Iterative DFS (safe — explicit stack on heap, not call stack)
function dfsIterative(root) {
    const stack = [root];
    while (stack.length > 0) {
        const node = stack.pop();
        console.log(node.value);
        // Push children in reverse order to maintain left-to-right traversal
        for (let i = node.children.length - 1; i >= 0; i--) {
            stack.push(node.children[i]);
        }
    }
}

// Trampoline — allows tail-recursive style without stack overflow
function trampoline(fn) {
    return function(...args) {
        let result = fn(...args);
        while (typeof result === "function") {
            result = result();
        }
        return result;
    };
}

// Tail-recursive factorial using trampoline:
const factTail = trampoline(function fact(n, acc = 1) {
    if (n <= 1) return acc;
    return () => fact(n - 1, n * acc);  // return a function instead of calling
});
factTail(100000);  // works without stack overflow!
```

---

>>> 🧠 INTERNALS: PROMISE INTERNALS AND THE MICROTASK QUEUE

Connecting Promises back to the event loop:

```javascript
// Promise state machine:
// PENDING → FULFILLED (via resolve())
// PENDING → REJECTED  (via reject())
// (Once settled, state never changes)

// Creating a Promise manually:
const p = new Promise((resolve, reject) => {
    // This executor runs SYNCHRONOUSLY
    console.log("Executor runs now");
    
    setTimeout(() => resolve("value"), 100);  // resolves after 100ms
});

// .then() handlers always run ASYNCHRONOUSLY (microtask queue):
Promise.resolve("hello")
    .then(v => {
        console.log(v);          // runs as microtask
        return v + "!";          // return value becomes next .then's input
    })
    .then(v => console.log(v));  // "hello!"

// Promise.all — all must resolve; if any reject, whole thing rejects
Promise.all([
    fetch("/api/users"),
    fetch("/api/posts"),
]).then(([users, posts]) => { /* both ready */ });

// Promise.allSettled — waits for ALL, gives results regardless of success/failure
Promise.allSettled([
    Promise.resolve(1),
    Promise.reject("error"),
]).then(results => {
    // results = [
    //   { status: "fulfilled", value: 1 },
    //   { status: "rejected", reason: "error" }
    // ]
});

// Promise.race — first to settle wins
Promise.race([
    fetch("/api/fast"),
    new Promise((_, reject) => setTimeout(() => reject("timeout"), 5000))
]);

// Promise.any (ES2021) — first FULFILLED wins (ignores rejections unless ALL reject)
Promise.any([
    Promise.reject("a"),
    Promise.resolve("b"),  // ← wins
    Promise.resolve("c"),
]).then(v => console.log(v));  // "b"
```

---

>>> ⚡ PERFORMANCE FINAL: V8 DEOPTIMIZATION TRIGGERS TO AVOID

```javascript
// 1. Polymorphic functions (mixing types):
function add(a, b) { return a + b; }
add(1, 2);       // V8 optimizes for numbers
add("a", "b");   // DEOPTIMIZATION — now handles strings too
                 // V8 throws away the number-optimized code

// 2. Changing object shape after construction:
const obj = { x: 1 };
obj.y = 2;       // new property after creation → new hidden class → deopt

// 3. delete on objects:
const o = { a: 1, b: 2 };
delete o.a;      // hidden class transition → deopt

// 4. Arguments object in hot functions:
function hot() {
    return arguments[0];  // arguments prevents some optimizations
    // Use rest params instead: function hot(...args) { return args[0]; }
}

// 5. try/catch in hot functions (V8 historically):
function hotLoop() {
    for (let i = 0; i < 1e6; i++) {
        try { /* ... */ } catch(e) { /* ... */ }
        // try/catch in loops can deopt in older V8 versions
        // Modern V8 handles this better
    }
}

// Safe patterns for performance:
// ✅ Monomorphic functions (consistent types)
// ✅ Initialize all properties in constructor
// ✅ Use Map for dynamic keys instead of plain objects
// ✅ Use TypedArrays for numeric data
// ✅ Use const where possible (helps static analysis)
```

---

> **Congratulations!** You now understand JavaScript at the engine level. You know the V8 pipeline, how the Event Loop works with microtask vs macrotask queues, the complete ToPrimitive/ToNumber algorithms, how closures map to heap memory, how hidden classes and inline caches work, and how to write code that performs well in a JIT-compiled runtime. You are fully prepared to tackle DSA using JavaScript — and FAANG-level interview questions about JavaScript internals.