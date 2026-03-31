## STACKS AND QUEUES — COMPLETE REFERENCE

---

## 1. What is a Stack?

A Stack is a linear data structure that follows the **LIFO** (Last-In, First-Out) principle. The last element added is the first one removed. Think of a stack of plates — you add to the top, and you remove from the top.

```text
PUSH 10     PUSH 20     PUSH 30     POP         POP
─────────   ─────────   ─────────   ─────────   ─────────
│       │   │       │   │  30   │   │       │   │       │
│       │   │  20   │   │  20   │   │  20   │   │       │
│  10   │   │  10   │   │  10   │   │  10   │   │  10   │
└───────┘   └───────┘   └───────┘   └───────┘   └───────┘
  top→10      top→20      top→30      top→20      top→10
                                     returns 30  returns 20
```

### 1.1 Core Operations

| Operation | What It Does | Time |
|---|---|---|
| `push(val)` | Add element to the top | O(1) |
| `pop()` | Remove and return top element | O(1) |
| `peek()` / `top()` | View top element without removing | O(1) |
| `isEmpty()` | Check if stack has zero elements | O(1) |
| `size()` | Return number of elements | O(1) |

---

## 2. Stack Implementation — Using Array

```javascript
class Stack {
    #items = [];

    push(val) {
        this.#items.push(val);
    }

    pop() {
        if (this.isEmpty()) return undefined;
        return this.#items.pop();
    }

    peek() {
        if (this.isEmpty()) return undefined;
        return this.#items[this.#items.length - 1];
    }

    isEmpty() {
        return this.#items.length === 0;
    }

    size() {
        return this.#items.length;
    }

    clear() {
        this.#items = [];
    }
}
```

**Usage:**
```javascript
const s = new Stack();
s.push(10);
s.push(20);
s.push(30);
s.peek();      // 30  (top element, not removed)
s.pop();       // 30  (removed and returned)
s.pop();       // 20
s.size();      // 1   (only 10 remains)
s.isEmpty();   // false
```

---

## 3. Stack Implementation — Using Linked List

More memory-efficient for very dynamic sizes. No array resizing. O(1) push/pop by operating at the head.

```javascript
class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

class StackLL {
    #top = null;
    #size = 0;

    push(val) {
        const node = new Node(val);
        node.next = this.#top;     // new node points to old top
        this.#top = node;          // new node becomes the top
        this.#size++;
    }

    pop() {
        if (this.isEmpty()) return undefined;
        const val = this.#top.val;
        this.#top = this.#top.next;  // move top down
        this.#size--;
        return val;
    }

    peek() {
        if (this.isEmpty()) return undefined;
        return this.#top.val;
    }

    isEmpty() {
        return this.#size === 0;
    }

    size() {
        return this.#size;
    }
}
```

**Visualization:**
```text
push(10)       push(20)         push(30)           pop()
top→[10|null]  top→[20|→]→[10|null]  top→[30|→]→[20|→]→[10|null]  top→[20|→]→[10|null]
                                                                    returns 30
```

---

## 4. The JavaScript Call Stack

JavaScript uses an internal stack to manage function execution. Every time a function is called, a "frame" is pushed. When it returns, the frame is popped.

```javascript
function multiply(a, b) {
    return a * b;
}

function square(n) {
    return multiply(n, n);
}

function printSquare(n) {
    const result = square(n);
    console.log(result);
}

printSquare(5);
```

**Call Stack visualization:**
```text
Step 1: printSquare(5) called
┌───────────────────────┐
│    printSquare(5)      │
└───────────────────────┘

Step 2: square(5) called inside printSquare
┌───────────────────────┐
│      square(5)         │  ← top
│    printSquare(5)      │
└───────────────────────┘

Step 3: multiply(5, 5) called inside square
┌───────────────────────┐
│    multiply(5, 5)      │  ← top
│      square(5)         │
│    printSquare(5)      │
└───────────────────────┘

Step 4: multiply returns 25 → popped
┌───────────────────────┐
│      square(5)         │  ← top (has result 25)
│    printSquare(5)      │
└───────────────────────┘

Step 5: square returns 25 → popped
┌───────────────────────┐
│    printSquare(5)      │  ← top (has result 25)
└───────────────────────┘

Step 6: console.log(25), printSquare returns → popped
┌───────────────────────┐
│        (empty)         │
└───────────────────────┘
```

### Stack Overflow

When recursion has no base case, frames pile up infinitely until memory runs out:

```javascript
function infinite() {
    infinite();      // no base case → stack overflow
}
infinite();          // RangeError: Maximum call stack size exceeded
```

---

## 5. What is a Queue?

A Queue is a linear data structure that follows the **FIFO** (First-In, First-Out) principle. The first element added is the first one removed. Think of a line at a ticket counter.

```text
ENQUEUE 10   ENQUEUE 20   ENQUEUE 30   DEQUEUE      DEQUEUE
─────────    ─────────    ─────────    ─────────    ─────────
front→10     front→10     front→10     front→20     front→30
               20           20           30
                             30
                                       returns 10   returns 20
```

### 5.1 Core Operations

| Operation | What It Does | Time (Array) | Time (Linked List) |
|---|---|---|---|
| `enqueue(val)` | Add to the back | O(1) | O(1) |
| `dequeue()` | Remove from the front | **O(n)** ← problem | O(1) |
| `front()` / `peek()` | View front element | O(1) | O(1) |
| `isEmpty()` | Check if empty | O(1) | O(1) |
| `size()` | Return count | O(1) | O(1) |

**Why O(n) dequeue with arrays?** `Array.shift()` removes the first element and then re-indexes every remaining element — that's O(n) work.

---

## 6. Queue Implementation — Using Array (Simple)

```javascript
class Queue {
    #items = [];

    enqueue(val) {
        this.#items.push(val);       // O(1) — add to end
    }

    dequeue() {
        if (this.isEmpty()) return undefined;
        return this.#items.shift();  // O(n) — removes from front, re-indexes
    }

    front() {
        if (this.isEmpty()) return undefined;
        return this.#items[0];
    }

    isEmpty() {
        return this.#items.length === 0;
    }

    size() {
        return this.#items.length;
    }
}
```

**⚠️ This is fine for small queues, but `shift()` is O(n). For performance-critical code, use a linked list or object-based queue.**

---

## 7. Queue Implementation — Using Object (O(1) Dequeue)

Use a plain object with head/tail pointers. No re-indexing.

```javascript
class Queue {
    #items = {};
    #head = 0;
    #tail = 0;

    enqueue(val) {
        this.#items[this.#tail] = val;
        this.#tail++;
    }

    dequeue() {
        if (this.isEmpty()) return undefined;
        const val = this.#items[this.#head];
        delete this.#items[this.#head];
        this.#head++;
        return val;
    }

    front() {
        if (this.isEmpty()) return undefined;
        return this.#items[this.#head];
    }

    isEmpty() {
        return this.#tail - this.#head === 0;
    }

    size() {
        return this.#tail - this.#head;
    }
}
```

**Visualization:**
```text
enqueue(A), enqueue(B), enqueue(C):
items = { 0: "A", 1: "B", 2: "C" }
         head=0              tail=3

dequeue() → returns "A":
items = { 1: "B", 2: "C" }
         head=1       tail=3

dequeue() → returns "B":
items = { 2: "C" }
         head=2  tail=3
```

---

## 8. Queue Implementation — Using Linked List

True O(1) for both enqueue and dequeue.

```javascript
class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}

class QueueLL {
    #front = null;
    #rear = null;
    #size = 0;

    enqueue(val) {
        const node = new Node(val);
        if (this.isEmpty()) {
            this.#front = node;
            this.#rear = node;
        } else {
            this.#rear.next = node;   // link old rear to new node
            this.#rear = node;        // new node becomes rear
        }
        this.#size++;
    }

    dequeue() {
        if (this.isEmpty()) return undefined;
        const val = this.#front.val;
        this.#front = this.#front.next;
        this.#size--;
        if (this.isEmpty()) this.#rear = null;
        return val;
    }

    front() {
        if (this.isEmpty()) return undefined;
        return this.#front.val;
    }

    isEmpty() {
        return this.#size === 0;
    }

    size() {
        return this.#size;
    }
}
```

**Visualization:**
```text
enqueue(A)    enqueue(B)                enqueue(C)
front→[A]     front→[A]→[B]←rear       front→[A]→[B]→[C]←rear
rear→[A]

dequeue()     → returns A
              front→[B]→[C]←rear
```

---

## 9. Circular Queue (Ring Buffer)

A fixed-size queue that wraps around. When the rear reaches the end of the array, it loops back to index 0. Memory-efficient — no wasted space.

```javascript
class CircularQueue {
    #items;
    #front = -1;
    #rear = -1;
    #size = 0;
    #capacity;

    constructor(capacity) {
        this.#capacity = capacity;
        this.#items = new Array(capacity);
    }

    enqueue(val) {
        if (this.isFull()) return false;
        this.#rear = (this.#rear + 1) % this.#capacity;   // wrap around
        this.#items[this.#rear] = val;
        if (this.#front === -1) this.#front = 0;
        this.#size++;
        return true;
    }

    dequeue() {
        if (this.isEmpty()) return undefined;
        const val = this.#items[this.#front];
        this.#front = (this.#front + 1) % this.#capacity;  // wrap around
        this.#size--;
        if (this.isEmpty()) {
            this.#front = -1;
            this.#rear = -1;
        }
        return val;
    }

    front() {
        if (this.isEmpty()) return undefined;
        return this.#items[this.#front];
    }

    isEmpty() { return this.#size === 0; }
    isFull()  { return this.#size === this.#capacity; }
    size()    { return this.#size; }
}
```

**Visualization — capacity=5:**
```text
Initial:    [_, _, _, _, _]   front=-1, rear=-1

enqueue(A): [A, _, _, _, _]   front=0, rear=0
enqueue(B): [A, B, _, _, _]   front=0, rear=1
enqueue(C): [A, B, C, _, _]   front=0, rear=2
enqueue(D): [A, B, C, D, _]   front=0, rear=3
enqueue(E): [A, B, C, D, E]   front=0, rear=4  ← FULL

dequeue():  [_, B, C, D, E]   front=1, rear=4  → returns A
dequeue():  [_, _, C, D, E]   front=2, rear=4  → returns B

enqueue(F): [_, _, C, D, E]   → rear = (4+1) % 5 = 0
            [F, _, C, D, E]   front=2, rear=0  ← WRAPPED AROUND!

How wrapping works:
     Index:  0   1   2   3   4
             F   _   C   D   E
            rear    front
```

---

## 10. Deque (Double-Ended Queue)

Add or remove from **both** ends. Combines stack + queue behaviour.

```javascript
class Deque {
    #items = {};
    #front = 0;
    #rear = 0;

    addFront(val) {
        this.#front--;
        this.#items[this.#front] = val;
    }

    addRear(val) {
        this.#items[this.#rear] = val;
        this.#rear++;
    }

    removeFront() {
        if (this.isEmpty()) return undefined;
        const val = this.#items[this.#front];
        delete this.#items[this.#front];
        this.#front++;
        return val;
    }

    removeRear() {
        if (this.isEmpty()) return undefined;
        this.#rear--;
        const val = this.#items[this.#rear];
        delete this.#items[this.#rear];
        return val;
    }

    peekFront() {
        return this.#items[this.#front];
    }

    peekRear() {
        return this.#items[this.#rear - 1];
    }

    isEmpty() {
        return this.#rear - this.#front === 0;
    }

    size() {
        return this.#rear - this.#front;
    }
}
```

**When behaves like:**
| Use only these | Behaves like |
|---|---|
| `addRear` + `removeRear` | Stack (LIFO) |
| `addRear` + `removeFront` | Queue (FIFO) |
| All four methods | Deque |

---

## 11. Stack vs Queue — Summary

```text
STACK (LIFO)                          QUEUE (FIFO)
┌─────────┐                          ┌─────────────────────────────┐
│ push →  ↕  ← pop                   │ enqueue → [A][B][C] → dequeue
│   (same end)                       │   (rear)           (front)
└─────────┘                          └─────────────────────────────┘
Last in, first out                    First in, first out
```

| Feature | Stack | Queue |
|---|---|---|
| Principle | LIFO | FIFO |
| Insert | `push` (top) | `enqueue` (rear) |
| Remove | `pop` (top) | `dequeue` (front) |
| Peek | `peek` (top) | `front` (front) |
| Real-world | Undo button, browser back, call stack | Printer queue, task scheduling, BFS |
| All ops O(1)? | ✅ Yes (array or linked list) | ✅ Only with linked list or object |

---

## 12. Pattern 1: Matching Brackets / Valid Parentheses

The classic stack problem. Use LIFO to match the most recent opening bracket with the current closing bracket.

```javascript
function isValid(s) {
    const stack = [];
    const map = {
        ")": "(",
        "]": "[",
        "}": "{"
    };

    for (const ch of s) {
        if (ch === "(" || ch === "[" || ch === "{") {
            stack.push(ch);                    // opening: push
        } else {
            if (stack.length === 0) return false;   // nothing to match
            if (stack.pop() !== map[ch]) return false;  // wrong match
        }
    }

    return stack.length === 0;   // all matched?
}
```

**Visualization:**
```text
Input: "({[]})"

ch='('  → push    stack: ['(']
ch='{'  → push    stack: ['(', '{']
ch='['  → push    stack: ['(', '{', '[']
ch=']'  → pop '[' matches map[']']='[' ✓   stack: ['(', '{']
ch='}'  → pop '{' matches map['}']='{'  ✓   stack: ['(']
ch=')'  → pop '(' matches map[')']='('  ✓   stack: []

Stack empty → true ✓

---

Input: "([)]"

ch='('  → push    stack: ['(']
ch='['  → push    stack: ['(', '[']
ch=')'  → pop '[' !== '('  → false ✗
```

---

## 13. Pattern 2: Min Stack

A stack that supports `getMin()` in O(1) time. Key idea: maintain a **second stack** that tracks the minimum at each level.

```javascript
class MinStack {
    #stack = [];
    #minStack = [];

    push(val) {
        this.#stack.push(val);
        const currentMin = this.#minStack.length === 0
            ? val
            : Math.min(val, this.#minStack[this.#minStack.length - 1]);
        this.#minStack.push(currentMin);
    }

    pop() {
        this.#stack.pop();
        this.#minStack.pop();
    }

    top() {
        return this.#stack[this.#stack.length - 1];
    }

    getMin() {
        return this.#minStack[this.#minStack.length - 1];
    }
}
```

**Visualization:**
```text
Operation    mainStack    minStack     getMin()
─────────    ─────────    ────────     ────────
push(5)      [5]          [5]          5
push(3)      [5,3]        [5,3]        3
push(7)      [5,3,7]      [5,3,3]      3      ← min is still 3
push(1)      [5,3,7,1]    [5,3,3,1]    1
pop()        [5,3,7]      [5,3,3]      3      ← back to 3
pop()        [5,3]        [5,3]        3
pop()        [5]          [5]          5
```

---

## 14. Pattern 3: Implement Queue Using Two Stacks

Reverse the LIFO order by pouring elements between two stacks, creating FIFO.

```javascript
class MyQueue {
    #inStack = [];
    #outStack = [];

    push(val) {
        this.#inStack.push(val);
    }

    pop() {
        this.#moveIfNeeded();
        return this.#outStack.pop();
    }

    peek() {
        this.#moveIfNeeded();
        return this.#outStack[this.#outStack.length - 1];
    }

    empty() {
        return this.#inStack.length === 0 && this.#outStack.length === 0;
    }

    #moveIfNeeded() {
        if (this.#outStack.length === 0) {
            while (this.#inStack.length > 0) {
                this.#outStack.push(this.#inStack.pop());
            }
        }
    }
}
```

**Visualization:**
```text
push(1), push(2), push(3):
  inStack:  [1, 2, 3]      outStack: []

pop():
  outStack is empty → move all from inStack to outStack
  inStack:  []              outStack: [3, 2, 1]
                                       ↑ top=1 is the first-in element
  pop from outStack → returns 1 (FIFO ✓)

  outStack: [3, 2]

push(4):
  inStack:  [4]             outStack: [3, 2]

pop():
  outStack not empty → pop directly → returns 2 (FIFO ✓)
  outStack: [3]
```

**Time complexity:** Each element is moved at most once from inStack to outStack. Amortized O(1) per operation.

---

## 15. Pattern 4: Implement Stack Using Two Queues

```javascript
class MyStack {
    #q1 = [];
    #q2 = [];

    push(val) {
        this.#q2.push(val);

        // Move all from q1 to q2 (so new element is at front)
        while (this.#q1.length > 0) {
            this.#q2.push(this.#q1.shift());
        }

        // Swap q1 and q2
        [this.#q1, this.#q2] = [this.#q2, this.#q1];
    }

    pop() {
        return this.#q1.shift();
    }

    top() {
        return this.#q1[0];
    }

    empty() {
        return this.#q1.length === 0;
    }
}
```

---

## 16. Pattern 5: Monotonic Stack

A stack where elements are always in sorted order (increasing or decreasing). Used to find the "next greater" or "next smaller" element efficiently.

### 16.1 Next Greater Element

For each element, find the first element to its right that is larger.

```javascript
function nextGreaterElement(nums) {
    const n = nums.length;
    const result = new Array(n).fill(-1);   // -1 means no greater element
    const stack = [];                       // stores indices

    for (let i = n - 1; i >= 0; i--) {
        // Pop all elements smaller than or equal to current
        while (stack.length > 0 && stack[stack.length - 1] <= nums[i]) {
            stack.pop();
        }

        // If stack not empty, top is the next greater element
        if (stack.length > 0) {
            result[i] = stack[stack.length - 1];
        }

        // Push current element
        stack.push(nums[i]);
    }

    return result;
}

nextGreaterElement([4, 5, 2, 10, 8]);
// [5, 10, 10, -1, -1]
```

**Visualization:**
```text
nums = [4, 5, 2, 10, 8]
Traverse right to left:

i=4: num=8   stack=[]       → pop nothing. Stack empty → result[4]=-1.  Push 8.  stack=[8]
i=3: num=10  stack=[8]      → pop 8 (8≤10). Stack empty → result[3]=-1. Push 10. stack=[10]
i=2: num=2   stack=[10]     → 10>2 → result[2]=10.  Push 2.             stack=[10, 2]
i=1: num=5   stack=[10, 2]  → pop 2 (2≤5). 10>5 → result[1]=10. Push 5. stack=[10, 5]
i=0: num=4   stack=[10, 5]  → 5>4 → result[0]=5. Push 4.               stack=[10, 5, 4]

Result: [5, 10, 10, -1, -1]
```

### 16.2 Next Smaller Element

Same idea, but maintain a monotonic **increasing** stack.

```javascript
function nextSmallerElement(nums) {
    const n = nums.length;
    const result = new Array(n).fill(-1);
    const stack = [];

    for (let i = n - 1; i >= 0; i--) {
        while (stack.length > 0 && stack[stack.length - 1] >= nums[i]) {
            stack.pop();
        }

        if (stack.length > 0) {
            result[i] = stack[stack.length - 1];
        }

        stack.push(nums[i]);
    }

    return result;
}

nextSmallerElement([4, 5, 2, 10, 8]);
// [2, 2, -1, 8, -1]
```

### 16.3 Monotonic Stack Variants Cheat Sheet

| Find | Stack Type | Pop When | Direction |
|---|---|---|---|
| Next Greater (right) | Decreasing | `stack.top <= current` | Right → Left |
| Next Smaller (right) | Increasing | `stack.top >= current` | Right → Left |
| Previous Greater (left) | Decreasing | `stack.top <= current` | Left → Right |
| Previous Smaller (left) | Increasing | `stack.top >= current` | Left → Right |

---

## 17. Pattern 6: Stock Span Problem

For each day, how many consecutive previous days had a price ≤ today's price?

```javascript
class StockSpanner {
    #stack = [];   // pairs of [price, span]

    next(price) {
        let span = 1;

        while (this.#stack.length > 0 && this.#stack[this.#stack.length - 1][0] <= price) {
            span += this.#stack.pop()[1];   // absorb the span of popped elements
        }

        this.#stack.push([price, span]);
        return span;
    }
}

const s = new StockSpanner();
s.next(100);   // 1
s.next(80);    // 1
s.next(60);    // 1
s.next(70);    // 2   (70 ≥ 60, so covers day with 60 + itself)
s.next(60);    // 1
s.next(75);    // 4   (75 ≥ 60 ≥ 70 ≥ 60, absorbs their spans: 1+2+1 = 4)
s.next(85);    // 6
```

**Visualization:**
```text
Price:  100  80   60   70   60   75   85
Span:    1    1    1    2    1    4    6

Price=70:  stack had [60,1]. 60≤70 → pop, absorb span 1 → span=1+1=2
           push [70,2]

Price=75:  stack had [60,1],[70,2]. 
           60≤75 → pop, absorb 1 → span=2
           70≤75 → pop, absorb 2 → span=4
           push [75,4]

Price=85:  stack had [80,1],[75,4].
           75≤85 → pop, absorb 4 → span=5
           80≤85 → pop, absorb 1 → span=6
           push [85,6]
```

---

## 18. Pattern 7: Evaluate Reverse Polish Notation (Postfix)

Postfix notation: operators come **after** operands. No need for parentheses.

```text
Infix:     (3 + 4) * 2
Postfix:   3 4 + 2 *
```

```javascript
function evalRPN(tokens) {
    const stack = [];

    for (const token of tokens) {
        if (token === "+" || token === "-" || token === "*" || token === "/") {
            const b = stack.pop();     // second operand (popped first)
            const a = stack.pop();     // first operand
            let result;

            switch (token) {
                case "+": result = a + b; break;
                case "-": result = a - b; break;
                case "*": result = a * b; break;
                case "/": result = Math.trunc(a / b); break;  // truncate toward zero
            }

            stack.push(result);
        } else {
            stack.push(Number(token));   // operand: push
        }
    }

    return stack[0];   // final result
}

evalRPN(["2", "1", "+", "3", "*"]);      // ((2+1)*3) = 9
evalRPN(["4", "13", "5", "/", "+"]);     // (4+(13/5)) = 4+2 = 6
```

**Visualization:**
```text
Tokens: ["2", "1", "+", "3", "*"]

"2"  → push 2          stack: [2]
"1"  → push 1          stack: [2, 1]
"+"  → pop 1, pop 2    → 2+1=3 → push 3    stack: [3]
"3"  → push 3          stack: [3, 3]
"*"  → pop 3, pop 3    → 3*3=9 → push 9    stack: [9]

Result: 9
```

---

## 19. Pattern 8: Daily Temperatures

Given daily temperatures, find how many days you have to wait for a warmer day. Uses a monotonic decreasing stack of indices.

```javascript
function dailyTemperatures(temps) {
    const n = temps.length;
    const result = new Array(n).fill(0);
    const stack = [];   // stores indices

    for (let i = 0; i < n; i++) {
        while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
            const prevDay = stack.pop();
            result[prevDay] = i - prevDay;
        }
        stack.push(i);
    }

    return result;
}

dailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]);
// [1, 1, 4, 2, 1, 1, 0, 0]
```

**Visualization:**
```text
temps = [73, 74, 75, 71, 69, 72, 76, 73]

i=0: 73  stack=[]        push 0      stack=[0]
i=1: 74  74>73 → pop 0, result[0]=1-0=1.  push 1     stack=[1]
i=2: 75  75>74 → pop 1, result[1]=2-1=1.  push 2     stack=[2]
i=3: 71  push 3                                       stack=[2,3]
i=4: 69  push 4                                       stack=[2,3,4]
i=5: 72  72>69 → pop 4, result[4]=5-4=1
         72>71 → pop 3, result[3]=5-3=2.   push 5     stack=[2,5]
i=6: 76  76>72 → pop 5, result[5]=6-5=1
         76>75 → pop 2, result[2]=6-2=4.   push 6     stack=[6]
i=7: 73  push 7                                       stack=[6,7]

Remaining in stack: indices 6,7 → result stays 0 (no warmer day)
Result: [1, 1, 4, 2, 1, 1, 0, 0]
```

---

## 20. BFS Uses a Queue

Breadth-First Search (graph/tree traversal) processes nodes level by level — a natural use of FIFO.

```javascript
function bfs(graph, start) {
    const visited = new Set();
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
        const node = queue.shift();
        console.log(node);

        for (const neighbor of graph[node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
}
```

```text
Graph:   1 — 2 — 5
         |   |
         3   4

BFS from 1:
Queue: [1]           process 1 → add 2, 3
Queue: [2, 3]        process 2 → add 4, 5
Queue: [3, 4, 5]     process 3 → (neighbors already visited)
Queue: [4, 5]        process 4
Queue: [5]           process 5

Output: 1, 2, 3, 4, 5 (level by level)
```

---

## 21. When to Use Stack vs Queue

| Clue in Problem | Use |
|---|---|
| "Most recent", "undo", "back button" | Stack |
| "Matching brackets", "nested structure" | Stack |
| "Next greater/smaller element" | Stack (monotonic) |
| "Evaluate expression" | Stack |
| "Process in order", "first come first served" | Queue |
| "Level by level", "BFS" | Queue |
| "Sliding window maximum" | Deque |
| "Process from both ends" | Deque |

---

## 22. Time and Space Complexity Summary

| Data Structure | Push/Enqueue | Pop/Dequeue | Peek | Space |
|---|---|---|---|---|
| Stack (array) | O(1) | O(1) | O(1) | O(n) |
| Stack (linked list) | O(1) | O(1) | O(1) | O(n) |
| Queue (array + shift) | O(1) | **O(n)** | O(1) | O(n) |
| Queue (object) | O(1) | O(1) | O(1) | O(n) |
| Queue (linked list) | O(1) | O(1) | O(1) | O(n) |
| Circular Queue | O(1) | O(1) | O(1) | O(k) fixed |
| Deque (object) | O(1) | O(1) | O(1) | O(n) |

---

## 23. Edge Cases Checklist

| Edge Case | What to Check |
|---|---|
| Empty stack/queue | Always check `isEmpty()` before `pop`/`dequeue`/`peek` |
| Single element | Push then pop should return that element |
| All same elements | Monotonic stack may pop everything or nothing |
| Nested brackets | `(((())))` should work; `((())` should fail |
| Operator ordering (RPN) | `a - b` is NOT `b - a`; pop order matters |
| Integer overflow (daily temps) | Not an issue in JS, but be aware in other languages |
| Circular queue full | Reject or overwrite depending on problem |
