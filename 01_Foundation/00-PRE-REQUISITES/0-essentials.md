# JAVASCRIPT FUNDAMENTALS — COMPLETE GUIDE (BASICS TO ADVANCED)

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

### 1.2 Execution Context

Everything in JavaScript runs inside an **Execution Context**. It is the environment where your code is evaluated and executed.

**Two types of execution context:**

| Type | Created When | Contains |
|:-----|:-------------|:---------|
| **Global Execution Context (GEC)** | Script starts running | Global object (`window`/`globalThis`), `this`, variable environment |
| **Function Execution Context (FEC)** | A function is **called** | Local variables, `arguments`, `this`, reference to outer scope |

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

  ┌─────────────┬────────────────────────────┐
  │  false      │  the boolean false         │
  │  0  / -0    │  zero (and negative zero)  │
  │  0n         │  BigInt zero               │
  │  ""         │  empty string              │
  │  null       │  intentional nothing       │
  │  undefined  │  not yet assigned          │
  │  NaN        │  not a number              │
  └─────────────┴────────────────────────────┘

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

Before ES6 classes, closures were the main way to create private data.

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

Crucial for optimizing DSA algorithms (like Fibonacci or DP).

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

### 9.5 The Classic Closure Pitfall (var in Loops)

This is a notorious interview question.

```javascript
// THE PROBLEM: Using `var`
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);
    }, 100);
}
// Output: 3, 3, 3
// Why? `var` is function-scoped. There is only ONE `i` shared by all callbacks.
// By the time the timeouts run, the loop is finished and `i` is 3.

// THE MODERN SOLUTION: Using `let`
for (let j = 0; j < 3; j++) {
    setTimeout(function() {
        console.log(j);
    }, 100);
}
// Output: 0, 1, 2
// Why? `let` creates a NEW block scope for EVERY iteration.
// Each callback closes over its OWN separate `j` variable.

// THE ES5 SOLUTION: IIFE (if you MUST use var)
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

Function declarations are completely hoisted. The name AND the entire body of the function are available before the line where they are defined.

```javascript
// ✅ This works perfectly
console.log(multiply(2, 3)); // 6

function multiply(a, b) {
    return a * b;
}
```

### 10.3 `var` Variables (Hoisted as `undefined`)

`var` declarations are hoisted, but their initialization is NOT. They are initialized with the value `undefined`.

```javascript
console.log(message); // Output: undefined  (no ReferenceError!)
var message = "Hello";
console.log(message); // Output: "Hello"

// What the engine actually does:
// var message;             ← Hoisted to the top
// console.log(message);    ← undefined
// message = "Hello";       ← Assignment happens where it was written
// console.log(message);    ← "Hello"
```

### 10.4 `let` and `const` (Hoisted, but in the TDZ)

`let` and `const` ARE hoisted (the engine knows they exist), but they are **UNINITIALIZED**. You cannot access them before the line where they are declared.

The period between the start of the scope and the line where the variable is declared is called the **Temporal Dead Zone (TDZ)**.

```javascript
// console.log(age);     // ❌ ReferenceError: Cannot access 'age' before initialization

let age = 25;            // TDZ ends here. Variable is initialized.
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

**Proof that `let`/`const` are actually hoisted:**
If they weren't hoisted, the `console.log` inside the block below would find the outer `x`. Instead, it throws an error because it knows about the *inner* `x` but it's in the TDZ!

```javascript
let x = "outer";

function test() {
    console.log(x);      // ❌ ReferenceError! 
                         // It doesn't look outward because the engine 
                         // already hoisted the inner `let x` to the top of test(),
                         // meaning we are in the inner x's TDZ.
    let x = "inner";
}
test();
```

### 10.5 Function Expressions & Arrow Functions (Hoisted like variables)

If you assign a function to a variable, it follows the hoisting rules of that variable's keyword (`var`, `let`, or `const`).

```javascript
// 1. Using var
console.log(sayHi);      // Output: undefined (var hoisting)
// sayHi();              // ❌ TypeError: sayHi is not a function (trying to call undefined)
var sayHi = function() { console.log("Hi"); };

// 2. Using const (or let)
// console.log(sayBye);  // ❌ ReferenceError (TDZ)
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

## 11. Pass by Value vs Reference & Copying

### 11.1 The Golden Rule of Function Arguments

In JavaScript, **ALL** function arguments are passed by **value**. 
However, if the argument is an object/array, the "value" that gets passed is a **reference** (memory address) to that object.

### 11.2 Passing Primitives (Pass by Value)

When you pass a primitive (`Number`, `String`, `Boolean`), JavaScript passes a **copy** of the actual value.

```javascript
function changePrimitive(val) {
    val = 99;                 // Only changes the LOCAL copy
    console.log("Inside:", val); // 99
}

let num = 10;
changePrimitive(num);
console.log("Outside:", num);   // 10  ← Unchanged!
```

### 11.3 Passing Objects (Call by Sharing / Pass by Reference-Value)

When you pass an object or array, JavaScript passes a **copy of the reference**. 

```javascript
function modifyObject(obj) {
    // We are mutating the SHARED object in the heap
    obj.name = "Hacker";
}

let user = { name: "Alice" };
modifyObject(user);
console.log("Outside:", user.name);  // "Hacker" ← IT CHANGED!
```

**THE TRAP:** You can modify the *contents* of the passed object, but you CANNOT reassign the original variable pointing to it.

```javascript
function reassignObject(obj) {
    // This creates a NEW object and points the local `obj` variable to it.
    // It does NOT change the `user` variable outside!
    obj = { name: "Hacker" };
    console.log("Inside:", obj.name); // "Hacker"
}

let user = { name: "Alice" };
reassignObject(user);
console.log("Outside:", user.name);  // "Alice" ← UNCHANGED!
```

### 11.4 Copying Objects: Shallow vs Deep

Since `let b = a` just copies the reference, how do we actually duplicate an object so we can modify it safely?

#### Shallow Copy
A shallow copy creates a new top-level object, but **nested objects are still shared references**.

```javascript
const original = { name: "Alice", address: { city: "NYC" } };

// 1. Spread Operator (Modern way)
const copy1 = { ...original };

// 2. Object.assign (Older way)
const copy2 = Object.assign({}, original);

// The top level is safely copied:
copy1.name = "Bob";
console.log(original.name); // "Alice" (safe!)

// BUT nested objects are still SHARED:
copy1.address.city = "LA";
console.log(original.address.city); // "LA" (the original was mutated!)
```

#### Deep Copy
A deep copy recursively duplicates everything. The new object is 100% independent.

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
// Note: structuredClone handles Dates, Maps, Sets, but throws an error on Functions.

// 2. The JSON trick (Older, hacky way)
const deep2 = JSON.parse(JSON.stringify(original));
// Limitations of JSON trick:
// - Dates become strings
// - Functions are completely lost/removed
// - undefined values are lost
// - Cannot handle circular references
```

---

## 12. Error Handling

### 12.1 The `try...catch...finally` Block

When an error occurs in JavaScript, the script usually "dies" (stops executing) and prints the error to the console. The `try...catch` block allows you to catch the error and keep the script running.

```javascript
try {
    // Code that might throw an error
    console.log("Start of try");
    lalala; // Error! Variable is not defined!
    console.log("End of try (never reached)");
    
} catch (err) {
    // Code that handles the error
    console.log("An error occurred!");
    
} finally {
    // Code that ALWAYS runs, regardless of success or error
    // (Great for cleanup tasks, closing files, etc.)
    console.log("This will always execute.");
}
```

### 12.2 The `Error` Object

When an error is caught, the `catch` block receives an **Error object** containing details about what went wrong.

```javascript
try {
    nonExistentFunction();
} catch (err) {
    console.log(err.name);    // "ReferenceError"
    console.log(err.message); // "nonExistentFunction is not defined"
    console.log(err.stack);   // The call stack trace showing WHERE it happened
}
```

**Built-in Error Types:**
1. `ReferenceError`: Using an undeclared variable (e.g., `TDZ` or misspelled name).
2. `TypeError`: Doing something to a value that is not permitted for its type (e.g., calling a string like a function: `"hello"()`).
3. `SyntaxError`: Invalid JavaScript code (e.g., missing a bracket `}`). Note: Syntax errors are caught during parsing, usually BEFORE the code even runs, so `try...catch` often can't catch them.
4. `RangeError`: A numeric variable is outside its valid range (e.g., infinite recursion causing a stack overflow).

### 12.3 Throwing Your Own Errors

You can generate an error manually using the `throw` keyword. This is especially useful in DSA for validating inputs.

```javascript
function divide(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new TypeError("Both arguments must be numbers");
    }
    if (b === 0) {
        throw new Error("Cannot divide by zero"); // General error
    }
    return a / b;
}

try {
    divide(10, 0);
} catch (err) {
    console.log(`${err.name}: ${err.message}`); // "Error: Cannot divide by zero"
}
```

Optional `catch` Binding (ES2019): If you don't need the error object, you can omit the `(err)` part.

```javascript
try {
    dangerousOperation();
} catch {
    console.log("Something failed, but I don't care about the details.");
}
```

---

## 13. JSON, Regular Expressions & Template Literals

### 13.1 JSON (JavaScript Object Notation)

JSON is a lightweight data-interchange format. Even though it looks like a JavaScript object, it is just a **string** format.

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
console.log(jsonString);        // '{"name":"Alice","age":25,"isActive":true,"skills":["JS","React"]}'

// Pretty printing (add 2 spaces of indentation)
const prettyJson = JSON.stringify(user, null, 2);

// 2. JSON.parse() → JSON string to Object
const parsedUser = JSON.parse(jsonString);
console.log(typeof parsedUser); // "object"
console.log(parsedUser.name);   // "Alice"
```

**JSON Limitations (What gets ignored or throws errors):**
- Functions: `stringify` removes them.
- `undefined`: `stringify` removes it.
- `Symbol`: `stringify` ignores it.
- Circular references: `stringify` throws a `TypeError`.
- Dates: `stringify` converts them to ISO strings (but `parse` keeps them as strings, it doesn't auto-convert back to a `Date` object).

### 13.2 Regular Expressions (RegExp)

Regular expressions are patterns used to match character combinations in strings. Essential for string manipulation tasks in DSA.

```javascript
// Two ways to create a RegExp:
const regex1 = /hello/i;               // Literal syntax (preferred)
const regex2 = new RegExp("hello", "i"); // Constructor syntax (used if pattern is dynamic)

// Flags:
// i = case-insensitive ('a' matches 'A')
// g = global (find ALL matches, not just the first)
// m = multiline (^ and $ match start/end of EACH LINE)

const str = "Hello world! hello again.";

// 1. regex.test() → returns boolean (Does it match?)
console.log(/world/.test(str));  // true
console.log(/xyz/.test(str));    // false

// 2. string.match(regex) → returns array of matches (or null)
console.log(str.match(/hello/ig)); // ["Hello", "hello"]

// 3. string.replace(regex, replacement)
console.log(str.replace(/hello/ig, "Hi")); // "Hi world! Hi again."

// Common DSA Regex patterns:
// Remove all non-alphanumeric characters (useful for Palindrome checks)
const dirtyStr = "A man, a plan, a canal: Panama";
const cleanStr = dirtyStr.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
console.log(cleanStr); // "amanaplanacanalpanama"

// Split string by multiple spaces/punctuation
const sentence = "Word1,  word2! word3.";
const words = sentence.split(/[\s,!\.]+/).filter(Boolean); // ["Word1", "word2", "word3"]
```

### 13.3 Template Literals (ES6)

Template literals use backticks (`` ` ``) instead of quotes.

```javascript
// 1. String Interpolation (no more + concatenation)
const name = "Alice";
const score = 95;
const msg = `Player ${name} scored ${score} points!`;

// 2. Multiline Strings (no more \n)
const html = `
    <div>
        <h1>Welcome</h1>
        <p>This is a multiline string.</p>
    </div>
`;
```

#### Tagged Templates
You can parse template literals with a function. This is how libraries like `styled-components` in React or SQL query builders work.

```javascript
// The tag function receives the string parts array and the interpolated values
function highlight(strings, ...values) {
    let result = "";
    for (let i = 0; i < values.length; i++) {
        result += strings[i];
        // Wrap the value in a <mark> tag
        result += `<mark>${values[i]}</mark>`; 
    }
    result += strings[strings.length - 1]; // Append the last string piece
    return result;
}

const user = "Alice";
const pass = "12345";
const output = highlight`Login: ${user}, Password: ${pass} is invalid.`;
// Output: "Login: <mark>Alice</mark>, Password: <mark>12345</mark> is invalid."
```

---

## 14. Advanced Topics

### 14.1 WeakMap and WeakSet

Regular `Map` and `Set` hold strong references to their objects. If you put an object in a `Map`, that object **cannot be garbage collected**, even if all other variables pointing to it are deleted.

`WeakMap` and `WeakSet` solve this by holding **weak references**.

```javascript
// 1. Regular Map (Strong Reference)
let strongMap = new Map();
let user1 = { name: "Alice" };
strongMap.set(user1, "Admin");

user1 = null; 
// The object {name: "Alice"} is STILL in memory because strongMap holds it!

// 2. WeakMap (Weak Reference)
let weakMap = new WeakMap();
let user2 = { name: "Bob" };
weakMap.set(user2, "Guest");

user2 = null;
// The object {name: "Bob"} is now GARBAGE COLLECTED. 
// It is automatically removed from the weakMap.
```

**Key rules of WeakMap/WeakSet:**
1. Keys **MUST** be objects (you can't use strings or numbers).
2. They are **NOT iterable** (no `keys()`, `values()`, or `for...of`). You can't see what's inside them because the garbage collector could run at any moment and remove an object.
3. Use cases: Storing private data for objects, DOM node metadata, or caching (memoization) where you want the cache to clear if the object is deleted.

### 14.2 Iterators and Iterables

An **Iterable** is any object that implements the `[Symbol.iterator]` method (like Arrays, Strings, Sets, Maps).
An **Iterator** is an object with a `next()` method that returns `{ value: any, done: boolean }`.

```javascript
// Manually using an iterator
const arr = ["a", "b", "c"];
const iterator = arr[Symbol.iterator]();

console.log(iterator.next()); // { value: 'a', done: false }
console.log(iterator.next()); // { value: 'b', done: false }
console.log(iterator.next()); // { value: 'c', done: false }
console.log(iterator.next()); // { value: undefined, done: true }

// Making a CUSTOM object iterable
const range = {
    start: 1,
    end: 3,
    // Provide the Symbol.iterator method
    [Symbol.iterator]() {
        let current = this.start;
        let last = this.end;

        // Return the iterator object
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

// Now we can use for...of on our custom object!
for (const num of range) {
    console.log(num); // 1, 2, 3
}
```

### 14.3 Generators (`function*` and `yield`)

Generators are functions that can be **paused and resumed**. They provide an easy, built-in way to write iterators.

```javascript
// 1. Definition (note the asterisk *)
function* myGenerator() {
    console.log("Started");
    yield 1;                 // Pauses here, returns 1
    
    console.log("Resumed!");
    yield 2;                 // Pauses here, returns 2
    
    console.log("Finished");
    return 3;                // Sets done: true, value: 3
}

// 2. Calling the generator does NOT execute it! It returns an iterator.
const gen = myGenerator();

console.log(gen.next()); // "Started", { value: 1, done: false }
console.log(gen.next()); // "Resumed!", { value: 2, done: false }
console.log(gen.next()); // "Finished", { value: 3, done: true }

// 3. Infinite Generators (Great for ID generation or infinite streams)
function* idMaker() {
    let index = 1;
    while (true) {
        yield index++;
    }
}
const ids = idMaker();
console.log(ids.next().value); // 1
console.log(ids.next().value); // 2
console.log(ids.next().value); // 3
```

### 14.4 Recursion (The Call Stack in Action)

Recursion is a function calling itself. It is **essential** for DSA (Trees, Graphs, Backtracking).

Every recursive function MUST have:
1. **Base Case:** The condition that stops the recursion.
2. **Recursive Step:** The part where the function calls itself with a smaller input.

```javascript
// Factorial: 5! = 5 * 4 * 3 * 2 * 1

function factorial(n) {
    // 1. Base Case
    if (n === 1) return 1;
    
    // 2. Recursive Step
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
  
  The Unwinding Phase (returning back down):
  1. factorial(1) pops off and returns 1 to below.
  2. factorial(2) receives 1. Calculates 2 * 1 = 2. Returns 2. Pops off.
  3. factorial(3) receives 2. Calculates 3 * 2 = 6. Returns 6. Pops off.
```

**Warning: Stack Overflow**
If you forget the base case, or input is too large (e.g., `factorial(100000)`), the Call Stack will exceed its size limit and crash with `RangeError: Maximum call stack size exceeded`.

---

> **Congratulations!** You now understand JavaScript internally. You know how memory is managed, how the engine executes code, how variables are scoped, and how data interacts. You are now fully prepared to tackle DSA using JavaScript!

---
