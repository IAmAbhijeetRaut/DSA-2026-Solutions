## 1. What is a Linked List?

A Linked List is a linear data structure where elements are **not stored contiguously** in memory.
Each element is an independent object called a **Node**, connected to the next via a pointer.

**Array vs Linked List — Memory Layout:**
```text
ARRAY (contiguous):
┌────┬────┬────┬────┬────┐
│ 10 │ 20 │ 30 │ 40 │ 50 │    ← all boxes sit side by side
└────┴────┴────┴────┴────┘
  0    1    2    3    4         ← direct index access arr[3] = 40

LINKED LIST (scattered):
  ┌────┬───┐     ┌────┬───┐     ┌────┬──────┐
  │ 10 │ ──┼──→  │ 20 │ ──┼──→  │ 30 │ null │
  └────┴───┘     └────┴───┘     └────┴──────┘
  addr:0x2A      addr:0x7F      addr:0x13        ← scattered in memory
```

**Key terminology:**
- **Node** — One block holding `data` + `pointer(s)`.
- **Head** — The first node. Lose this and you lose the entire list.
- **Tail** — The last node. Its `next` is `null`.
- **null** — Signifies "end of the list" (no more nodes ahead).

---

## 2. The Node — The Building Block

Every linked list is made of Nodes. A Node is just a plain object with two properties.

```text
┌───────────┬──────────┐
│ data: 42  │ next: ───┼──→ (address of next node, or null)
└───────────┴──────────┘
```

```javascript
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// Creating standalone nodes:
const a = new Node(10);
const b = new Node(20);
const c = new Node(30);

// Manually linking them:
a.next = b;     // 10 → 20
b.next = c;     // 20 → 30
// c.next is already null → end of list

// a is the head. Walk from a:
// a.data       → 10
// a.next.data  → 20
// a.next.next.data → 30
```

---

## 3. Traversal — Walking the List

You cannot use `arr[i]`. You start at `head` and walk node by node.

**Rule:** Never move `head` itself. Always use a temporary variable `current`.

```javascript
function printList(head) {
    let current = head;
    while (current !== null) {
        console.log(current.data);
        current = current.next;   // move to next node
    }
}
```

**Step-by-step visualization:**
```text
Step 0:  current = head
         ↓
        [10] → [20] → [30] → null

Step 1:  console.log(10), current = current.next
                ↓
        [10] → [20] → [30] → null

Step 2:  console.log(20), current = current.next
                       ↓
        [10] → [20] → [30] → null

Step 3:  console.log(30), current = current.next
                              ↓
        [10] → [20] → [30] → null   ← current is null, loop ends
```

---

## 4. Array vs Linked List — When to Use What

| Operation | Array | Linked List |
|---|---|---|
| Access by index | **O(1)** `arr[i]` | **O(n)** must walk from head |
| Insert at beginning | **O(n)** shift everything | **O(1)** change head pointer |
| Insert at end | **O(1)** amortised `push` | **O(n)** walk to tail (O(1) with tail pointer) |
| Insert in middle | **O(n)** shift elements | **O(n)** walk + **O(1)** re-link |
| Delete at beginning | **O(n)** shift everything | **O(1)** change head pointer |
| Delete at end | **O(1)** `pop` | **O(n)** walk to second-last |
| Delete in middle | **O(n)** shift elements | **O(n)** walk + **O(1)** re-link |
| Memory | Contiguous, fixed blocks | Scattered, extra pointer per node |

**Use an Array when:** You need fast random access (`arr[i]`), or mostly add/remove from the end.
**Use a Linked List when:** You frequently insert/delete from the beginning or middle.

---

## 5. SINGLY LINKED LIST — Complete Implementation

Each node has `data` and `next`. One-directional: Head → Tail.

```text
HEAD                                TAIL
 ↓                                   ↓
[10 | ●]──→[20 | ●]──→[30 | ●]──→[40 | null]
```

### 5.1 Class Setup

```javascript
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class SinglyLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }
}
```

### 5.2 Prepend — Insert at the Beginning — O(1)

```javascript
prepend(data) {
    const newNode = new Node(data);
    newNode.next = this.head;   // new node points to old head
    this.head = newNode;        // head now points to new node
    this.size++;
}
```

**Visualization:**
```text
BEFORE:  head → [20 | ●]──→[30 | null]

Step 1:  Create newNode [10 | null]
Step 2:  newNode.next = head
         [10 | ●]──→[20 | ●]──→[30 | null]
Step 3:  head = newNode
         head → [10 | ●]──→[20 | ●]──→[30 | null]

AFTER:   head → [10 | ●]──→[20 | ●]──→[30 | null]
```

### 5.3 Append — Insert at the End — O(n)

```javascript
append(data) {
    const newNode = new Node(data);

    if (this.head === null) {
        this.head = newNode;
    } else {
        let current = this.head;
        while (current.next !== null) {
            current = current.next;   // walk to last node
        }
        current.next = newNode;       // last node now points to new node
    }
    this.size++;
}
```

**Visualization:**
```text
BEFORE:  head → [10 | ●]──→[20 | null]

Step 1:  Create newNode [30 | null]
Step 2:  Walk to last node (20)
Step 3:  lastNode.next = newNode
         head → [10 | ●]──→[20 | ●]──→[30 | null]

AFTER:   head → [10 | ●]──→[20 | ●]──→[30 | null]
```

### 5.4 Insert at Index — O(n)

```javascript
insertAt(index, data) {
    if (index < 0 || index > this.size) return;
    if (index === 0) return this.prepend(data);

    const newNode = new Node(data);
    let current = this.head;

    // Walk to the node BEFORE the target index
    for (let i = 0; i < index - 1; i++) {
        current = current.next;
    }

    newNode.next = current.next;   // new node points to what was at index
    current.next = newNode;        // previous node points to new node
    this.size++;
}
```

**Visualization — Insert 25 at index 2:**
```text
BEFORE:  head → [10 | ●]──→[20 | ●]──→[30 | ●]──→[40 | null]
                              ↑ index 1

Step 1:  Walk to index 1 (node 20) — this is the node BEFORE target
Step 2:  newNode.next = current.next  →  [25 | ●]──→[30]
Step 3:  current.next = newNode       →  [20 | ●]──→[25]

AFTER:   head → [10 | ●]──→[20 | ●]──→[25 | ●]──→[30 | ●]──→[40 | null]
```

### 5.5 Delete from Beginning — O(1)

```javascript
deleteFirst() {
    if (this.head === null) return null;

    const removed = this.head;
    this.head = this.head.next;   // head jumps to second node
    this.size--;
    return removed.data;
}
```

**Visualization:**
```text
BEFORE:  head → [10 | ●]──→[20 | ●]──→[30 | null]

Step 1:  head = head.next
         head ──────→[20 | ●]──→[30 | null]
         [10] is now unreferenced → garbage collected

AFTER:   head → [20 | ●]──→[30 | null]
```

### 5.6 Delete from End — O(n)

```javascript
deleteLast() {
    if (this.head === null) return null;
    if (this.head.next === null) {
        const data = this.head.data;
        this.head = null;
        this.size--;
        return data;
    }

    let current = this.head;
    while (current.next.next !== null) {   // stop at second-to-last
        current = current.next;
    }

    const data = current.next.data;
    current.next = null;   // second-to-last becomes the new tail
    this.size--;
    return data;
}
```

**Visualization:**
```text
BEFORE:  head → [10 | ●]──→[20 | ●]──→[30 | null]

Step 1:  Walk until current.next.next === null
         current stops at [20]
Step 2:  current.next = null
         head → [10 | ●]──→[20 | null]
         [30] is now unreferenced → garbage collected

AFTER:   head → [10 | ●]──→[20 | null]
```

### 5.7 Delete at Index — O(n)

```javascript
deleteAt(index) {
    if (index < 0 || index >= this.size) return null;
    if (index === 0) return this.deleteFirst();

    let current = this.head;
    for (let i = 0; i < index - 1; i++) {
        current = current.next;   // walk to node BEFORE target
    }

    const removed = current.next;
    current.next = current.next.next;   // skip over the target node
    this.size--;
    return removed.data;
}
```

**Visualization — Delete at index 1:**
```text
BEFORE:  head → [10 | ●]──→[20 | ●]──→[30 | null]
                  ↑ index 0   ↑ target

Step 1:  Walk to index 0 (the node BEFORE target)
Step 2:  current.next = current.next.next
         head → [10 | ●]────────────────→[30 | null]
         [20] is now unreferenced → garbage collected

AFTER:   head → [10 | ●]──→[30 | null]
```

### 5.8 Search — O(n)

```javascript
search(value) {
    let current = this.head;
    let index = 0;

    while (current !== null) {
        if (current.data === value) return index;
        current = current.next;
        index++;
    }
    return -1;   // not found
}
```

### 5.9 Reverse — O(n)

One of the most commonly asked interview questions.

```javascript
reverse() {
    let prev = null;
    let current = this.head;
    let next = null;

    while (current !== null) {
        next = current.next;      // save next
        current.next = prev;      // reverse the link
        prev = current;           // advance prev
        current = next;           // advance current
    }
    this.head = prev;             // prev is now the new head
}
```

**Visualization — Reversing [10 → 20 → 30]:**
```text
START:   prev=null   current=[10]   next=null
         null   [10 | ●]──→[20 | ●]──→[30 | null]

ITER 1:  next = [20]
         current.next = prev (null)
         prev = [10]   current = [20]
         null ←──[10 | null]   [20 | ●]──→[30 | null]

ITER 2:  next = [30]
         current.next = prev ([10])
         prev = [20]   current = [30]
         null ←──[10 | null] ←──[20 | ●]   [30 | null]

ITER 3:  next = null
         current.next = prev ([20])
         prev = [30]   current = null   ← LOOP ENDS
         null ←──[10 | null] ←──[20 | ●] ←──[30 | ●]

RESULT:  head = prev = [30]
         head → [30 | ●]──→[20 | ●]──→[10 | null]
```

### 5.10 Print Utility

```javascript
print() {
    let current = this.head;
    const parts = [];
    while (current !== null) {
        parts.push(current.data);
        current = current.next;
    }
    console.log(parts.join(" → ") + " → null");
}
```

### 5.11 Full Working Example

```javascript
const list = new SinglyLinkedList();
list.append(10);
list.append(20);
list.append(30);
list.append(40);
list.print();           // 10 → 20 → 30 → 40 → null

list.prepend(5);
list.print();           // 5 → 10 → 20 → 30 → 40 → null

list.insertAt(2, 15);
list.print();           // 5 → 10 → 15 → 20 → 30 → 40 → null

list.deleteFirst();
list.print();           // 10 → 15 → 20 → 30 → 40 → null

list.deleteLast();
list.print();           // 10 → 15 → 20 → 30 → null

list.deleteAt(1);
list.print();           // 10 → 20 → 30 → null

console.log(list.search(20));   // 1
console.log(list.search(99));   // -1

list.reverse();
list.print();           // 30 → 20 → 10 → null
```

---

## 6. DOUBLY LINKED LIST — Complete Implementation

Each node has `data`, `next`, AND `prev`. Bidirectional traversal: Head ↔ Tail.

```text
HEAD                                                     TAIL
 ↓                                                        ↓
null ←─[● | 10 | ●]──⟷──[● | 20 | ●]──⟷──[● | 30 | ●]─→ null
```

### 6.1 Node and Class Setup

```javascript
class DoublyNode {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;     // ← the key difference
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;     // we track tail for O(1) append
        this.size = 0;
    }
}
```

### 6.2 Prepend — O(1)

```javascript
prepend(data) {
    const newNode = new DoublyNode(data);

    if (this.head === null) {
        this.head = newNode;
        this.tail = newNode;
    } else {
        newNode.next = this.head;
        this.head.prev = newNode;
        this.head = newNode;
    }
    this.size++;
}
```

**Visualization:**
```text
BEFORE:  head → [● | 20 | ●]──⟷──[● | 30 | ●] ← tail
                 prev=null            next=null

Step 1:  Create newNode [null | 10 | null]
Step 2:  newNode.next = head(20)
Step 3:  head(20).prev = newNode
Step 4:  head = newNode

AFTER:   head → [null | 10 | ●]──⟷──[● | 20 | ●]──⟷──[● | 30 | null] ← tail
```

### 6.3 Append — O(1) (because we track tail)

```javascript
append(data) {
    const newNode = new DoublyNode(data);

    if (this.tail === null) {
        this.head = newNode;
        this.tail = newNode;
    } else {
        newNode.prev = this.tail;
        this.tail.next = newNode;
        this.tail = newNode;
    }
    this.size++;
}
```

**Visualization:**
```text
BEFORE:  head → [null | 10 | ●]──⟷──[● | 20 | null] ← tail

Step 1:  Create newNode [null | 30 | null]
Step 2:  newNode.prev = tail(20)
Step 3:  tail(20).next = newNode
Step 4:  tail = newNode

AFTER:   head → [null | 10 | ●]──⟷──[● | 20 | ●]──⟷──[● | 30 | null] ← tail
```

### 6.4 Insert at Index — O(n)

```javascript
insertAt(index, data) {
    if (index < 0 || index > this.size) return;
    if (index === 0) return this.prepend(data);
    if (index === this.size) return this.append(data);

    const newNode = new DoublyNode(data);
    let current = this.head;

    for (let i = 0; i < index; i++) {
        current = current.next;
    }

    // current is the node currently AT the target index
    // we insert newNode BEFORE current
    newNode.next = current;
    newNode.prev = current.prev;
    current.prev.next = newNode;
    current.prev = newNode;
    this.size++;
}
```

**Visualization — Insert 25 at index 2:**
```text
BEFORE:  [10]──⟷──[20]──⟷──[30]──⟷──[40]
                            ↑ current (index 2)

Step 1:  newNode(25).next = current(30)
Step 2:  newNode(25).prev = current.prev(20)
Step 3:  current.prev(20).next = newNode(25)
Step 4:  current(30).prev = newNode(25)

AFTER:   [10]──⟷──[20]──⟷──[25]──⟷──[30]──⟷──[40]
```

### 6.5 Delete First — O(1)

```javascript
deleteFirst() {
    if (this.head === null) return null;

    const data = this.head.data;

    if (this.head === this.tail) {
        this.head = null;
        this.tail = null;
    } else {
        this.head = this.head.next;
        this.head.prev = null;
    }

    this.size--;
    return data;
}
```

### 6.6 Delete Last — O(1) ← this is where Doubly wins over Singly

```javascript
deleteLast() {
    if (this.tail === null) return null;

    const data = this.tail.data;

    if (this.head === this.tail) {
        this.head = null;
        this.tail = null;
    } else {
        this.tail = this.tail.prev;
        this.tail.next = null;
    }

    this.size--;
    return data;
}
```

**Visualization:**
```text
BEFORE:  [10]──⟷──[20]──⟷──[30] ← tail

Step 1:  tail = tail.prev (20)
Step 2:  tail(20).next = null

AFTER:   [10]──⟷──[20] ← tail
         [30] is garbage collected
```

### 6.7 Delete at Index — O(n)

```javascript
deleteAt(index) {
    if (index < 0 || index >= this.size) return null;
    if (index === 0) return this.deleteFirst();
    if (index === this.size - 1) return this.deleteLast();

    let current = this.head;
    for (let i = 0; i < index; i++) {
        current = current.next;
    }

    current.prev.next = current.next;
    current.next.prev = current.prev;
    this.size--;
    return current.data;
}
```

**Visualization — Delete at index 1:**
```text
BEFORE:  [10]──⟷──[20]──⟷──[30]
                    ↑ target

Step 1:  target.prev(10).next = target.next(30)
Step 2:  target.next(30).prev = target.prev(10)

AFTER:   [10]──⟷──[30]
         [20] is garbage collected
```

### 6.8 Reverse Traverse (Backward) — O(n)

This is impossible in a Singly Linked List without extra space. In Doubly, it is trivial.

```javascript
printReverse() {
    let current = this.tail;
    const parts = [];
    while (current !== null) {
        parts.push(current.data);
        current = current.prev;
    }
    console.log(parts.join(" → ") + " → null");
}
```

### 6.9 Print Forward

```javascript
print() {
    let current = this.head;
    const parts = [];
    while (current !== null) {
        parts.push(current.data);
        current = current.next;
    }
    console.log(parts.join(" ⟷ ") + " → null");
}
```

### 6.10 Full Working Example

```javascript
const dll = new DoublyLinkedList();
dll.append(10);
dll.append(20);
dll.append(30);
dll.print();             // 10 ⟷ 20 ⟷ 30 → null

dll.prepend(5);
dll.print();             // 5 ⟷ 10 ⟷ 20 ⟷ 30 → null

dll.insertAt(2, 15);
dll.print();             // 5 ⟷ 10 ⟷ 15 ⟷ 20 ⟷ 30 → null

dll.deleteFirst();
dll.print();             // 10 ⟷ 15 ⟷ 20 ⟷ 30 → null

dll.deleteLast();
dll.print();             // 10 ⟷ 15 ⟷ 20 → null

dll.printReverse();      // 20 → 15 → 10 → null
```

---

## 7. CIRCULAR LINKED LIST — Complete Implementation

The last node's `next` points back to `head` instead of `null`. There is no `null` termination.

### 7.1 Singly Circular

```text
        HEAD
         ↓
  ┌──→ [10 | ●]──→[20 | ●]──→[30 | ●]──┐
  │                                       │
  └───────────────────────────────────────┘
  (tail.next → head)
```

```javascript
class CircularLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    append(data) {
        const newNode = new Node(data);

        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
            newNode.next = newNode;     // points to itself
        } else {
            newNode.next = this.head;   // new node wraps to head
            this.tail.next = newNode;   // old tail points to new node
            this.tail = newNode;        // update tail
        }
        this.size++;
    }

    prepend(data) {
        const newNode = new Node(data);

        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
            newNode.next = newNode;
        } else {
            newNode.next = this.head;
            this.tail.next = newNode;   // tail must still wrap to new head
            this.head = newNode;
        }
        this.size++;
    }

    deleteFirst() {
        if (this.head === null) return null;

        const data = this.head.data;

        if (this.head === this.tail) {
            // only one node
            this.head = null;
            this.tail = null;
        } else {
            this.head = this.head.next;
            this.tail.next = this.head;   // rewire tail to new head
        }
        this.size--;
        return data;
    }

    // CRITICAL: traversal must NOT use (current !== null)
    // because there IS no null. Use a do...while or counter.
    print() {
        if (this.head === null) {
            console.log("Empty");
            return;
        }

        let current = this.head;
        const parts = [];

        do {
            parts.push(current.data);
            current = current.next;
        } while (current !== this.head);   // stop when we loop back

        console.log(parts.join(" → ") + " → (back to head)");
    }
}
```

**⚠️ WARNING:** If you write `while (current !== null)` on a circular list, your code will loop **forever**. Always use `do { ... } while (current !== head)` or a counter `for (let i = 0; i < size; i++)`.

### 7.2 Doubly Circular

```text
        HEAD                                    TAIL
         ↓                                       ↓
  ┌──⟷──[● | 10 | ●]──⟷──[● | 20 | ●]──⟷──[● | 30 | ●]──⟷──┐
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
  (tail.next → head AND head.prev → tail)
```

```javascript
class DoublyCircularLinkedList {
    constructor() {
        this.head = null;
        this.size = 0;
    }

    append(data) {
        const newNode = new DoublyNode(data);

        if (this.head === null) {
            newNode.next = newNode;
            newNode.prev = newNode;
            this.head = newNode;
        } else {
            const tail = this.head.prev;   // tail is always head.prev

            newNode.next = this.head;
            newNode.prev = tail;
            tail.next = newNode;
            this.head.prev = newNode;
        }
        this.size++;
    }

    print() {
        if (this.head === null) { console.log("Empty"); return; }

        let current = this.head;
        const parts = [];
        do {
            parts.push(current.data);
            current = current.next;
        } while (current !== this.head);

        console.log(parts.join(" ⟷ ") + " ⟷ (back to head)");
    }
}
```

---

## 8. Types of Linked Lists — Comparison Table

| Feature | Singly | Doubly | Circular Singly | Circular Doubly |
|---|---|---|---|---|
| **Pointers per node** | `next` | `next`, `prev` | `next` | `next`, `prev` |
| **Traverse direction** | Forward only | Forward & Backward | Forward (loop) | Both (loop) |
| **Last node points to** | `null` | `null` | `head` | `head` |
| **Delete last node** | O(n) | **O(1)** | O(n) | **O(1)** |
| **Memory per node** | Less | More | Less | Most |
| **Use case** | Stacks, simple lists | Browser history, LRU cache | Round-robin scheduling | Music playlist (prev/next + loop) |

---

## 9. The Dummy (Sentinel) Node Technique

Many DSA problems require inserting/deleting the head node itself. This creates annoying edge cases. The fix: use a **dummy node**.

```javascript
// Without dummy — messy edge case handling
function removeValue(head, target) {
    // Special case: head itself is the target
    while (head !== null && head.data === target) {
        head = head.next;
    }
    let current = head;
    while (current !== null && current.next !== null) {
        if (current.next.data === target) {
            current.next = current.next.next;
        } else {
            current = current.next;
        }
    }
    return head;
}

// With dummy — clean, no special cases
function removeValue(head, target) {
    const dummy = new Node(0);    // fake node, data doesn't matter
    dummy.next = head;

    let current = dummy;
    while (current.next !== null) {
        if (current.next.data === target) {
            current.next = current.next.next;
        } else {
            current = current.next;
        }
    }
    return dummy.next;   // the real head
}
```

**Why it works:** The dummy sits before the real head. Even if the real head gets deleted, the dummy still exists and `dummy.next` always points to whatever the new head is.

```text
BEFORE:  dummy → [10] → [20] → [30] → null     (removing 10)

Step 1:  current = dummy
         current.next.data === 10? Yes!
         current.next = current.next.next
         dummy → [20] → [30] → null

AFTER:   return dummy.next → [20] → [30] → null
```

---

## 10. Common Patterns for DSA Problems

### 10.1 Two-Pointer: Fast & Slow (Tortoise and Hare)

Use two pointers. `slow` moves 1 step. `fast` moves 2 steps.

#### Find the Middle Node

```javascript
function findMiddle(head) {
    let slow = head;
    let fast = head;

    while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;   // slow is at the middle
}
```

**Visualization:**
```text
List: [1] → [2] → [3] → [4] → [5] → null

Step 0:  slow=1  fast=1
Step 1:  slow=2  fast=3
Step 2:  slow=3  fast=5
Step 3:  fast.next is null → STOP

Result: slow = 3 (the middle)
```

```text
List: [1] → [2] → [3] → [4] → null   (even length)

Step 0:  slow=1  fast=1
Step 1:  slow=2  fast=3
Step 2:  slow=3  fast=null → STOP

Result: slow = 3 (second of the two middles)
```

#### Detect a Cycle

If a cycle exists, fast will eventually catch up to slow inside the loop.

```javascript
function hasCycle(head) {
    let slow = head;
    let fast = head;

    while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;

        if (slow === fast) return true;   // they met → cycle exists
    }
    return false;   // fast hit null → no cycle
}
```

**Visualization:**
```text
NO CYCLE:
[1] → [2] → [3] → null
slow: 1 → 2 → 3
fast: 1 → 3 → null   ← fast hit null, return false

CYCLE EXISTS:
[1] → [2] → [3] → [4] → [5]
                    ↑           │
                    └───────────┘    (5 points back to 3)
slow: 1 → 2 → 3 → 4 → 5 → 3 → 4
fast: 1 → 3 → 5 → 4 → 3 → 5 → 4
                                  ↑ slow === fast → return true
```

#### Find Where the Cycle Starts

Once slow and fast meet, reset one pointer to head. Move both 1 step at a time. They meet at the cycle start.

```javascript
function detectCycleStart(head) {
    let slow = head;
    let fast = head;

    while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) break;
    }

    if (fast === null || fast.next === null) return null;   // no cycle

    slow = head;   // reset slow to head
    while (slow !== fast) {
        slow = slow.next;
        fast = fast.next;   // both move 1 step now
    }
    return slow;   // this is where the cycle starts
}
```

### 10.2 Two-Pointer: Nth Node from End

Move `fast` N steps ahead first. Then move both until fast hits null. `slow` is at the Nth-from-end.

```javascript
function nthFromEnd(head, n) {
    let fast = head;
    let slow = head;

    // Move fast n steps ahead
    for (let i = 0; i < n; i++) {
        fast = fast.next;
    }

    // Move both until fast hits null
    while (fast !== null) {
        slow = slow.next;
        fast = fast.next;
    }

    return slow;
}
```

**Visualization — Find 2nd from end in [10, 20, 30, 40, 50]:**
```text
Step 0:  Move fast 2 steps ahead
         slow=10   fast=30

Step 1:  slow=20   fast=40
Step 2:  slow=30   fast=50
Step 3:  slow=40   fast=null → STOP

Result: slow = 40 (2nd from end)
```

### 10.3 Merge Two Sorted Lists

```javascript
function mergeSorted(l1, l2) {
    const dummy = new Node(0);
    let tail = dummy;

    while (l1 !== null && l2 !== null) {
        if (l1.data <= l2.data) {
            tail.next = l1;
            l1 = l1.next;
        } else {
            tail.next = l2;
            l2 = l2.next;
        }
        tail = tail.next;
    }

    tail.next = l1 !== null ? l1 : l2;   // attach remaining nodes
    return dummy.next;
}
```

**Visualization:**
```text
l1:  [1] → [3] → [5] → null
l2:  [2] → [4] → [6] → null

dummy → [ ]

Step 1: 1 < 2 → take 1, l1 moves     dummy → [1]
Step 2: 3 > 2 → take 2, l2 moves     dummy → [1] → [2]
Step 3: 3 < 4 → take 3, l1 moves     dummy → [1] → [2] → [3]
Step 4: 5 > 4 → take 4, l2 moves     dummy → [1] → [2] → [3] → [4]
Step 5: 5 < 6 → take 5, l1 moves     dummy → [1] → [2] → [3] → [4] → [5]
Step 6: l1 is null, attach l2         dummy → [1] → [2] → [3] → [4] → [5] → [6]

return dummy.next → [1] → [2] → [3] → [4] → [5] → [6] → null
```

---

## 11. Time Complexity — Complete Reference

### Singly Linked List (no tail pointer)

| Operation | Time | Space | Why |
|---|---|---|---|
| Prepend | O(1) | O(1) | Just update head |
| Append | O(n) | O(1) | Must walk to end |
| Insert at index | O(n) | O(1) | Walk to position |
| Delete first | O(1) | O(1) | Just update head |
| Delete last | O(n) | O(1) | Walk to second-last |
| Delete at index | O(n) | O(1) | Walk to position |
| Search by value | O(n) | O(1) | Must walk through |
| Access by index | O(n) | O(1) | Must walk through |
| Reverse | O(n) | O(1) | Single pass, pointer swap |

### Singly Linked List (WITH tail pointer)

| Operation | Time | Notes |
|---|---|---|
| Append | **O(1)** | Tail pointer eliminates walking |
| Delete last | **Still O(n)** | Need second-to-last, which requires walking |

### Doubly Linked List (with head + tail)

| Operation | Time | Notes |
|---|---|---|
| Prepend | O(1) | |
| Append | O(1) | Tail pointer |
| Delete first | O(1) | |
| Delete last | **O(1)** | Tail.prev gives second-to-last instantly |
| Delete at index | O(n) | Must walk to position |
| Search | O(n) | Can start from head or tail (optimise by choosing closer end) |

---

## 12. Edge Cases to Always Consider

These will trip you up in interviews if you forget them:

| Edge Case | What Happens | How to Handle |
|---|---|---|
| Empty list (`head === null`) | No nodes exist | Check before any operation |
| Single node (`head.next === null`) | Head is also the tail | Special case for delete/reverse |
| Deleting the head | `head` must be re-assigned | Use `head = head.next` or dummy node |
| Cycle in list | Infinite loop on traversal | Use fast/slow pointer check |
| Even vs Odd length | Middle node differs | Fast/slow handles both (see section 10.1) |
| Duplicate values | Multiple matches | Decide: delete first match or all matches |

---

## 13. LeetCode-Style Node Definition

Most LeetCode problems use this definition. You do NOT write the class — they give you this:

```javascript
// Singly
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
}

// Doubly (rare on LeetCode)
function DoublyListNode(val, next, prev) {
    this.val = (val === undefined ? 0 : val);
    this.next = (next === undefined ? null : next);
    this.prev = (prev === undefined ? null : prev);
}
```

Note: LeetCode uses `val` not `data`, and `ListNode` not `Node`. Keep this in mind when reading solutions online.

---

## 14. Quick Reference — All Operations at a Glance

```text
SINGLY:   head → [D|●] → [D|●] → [D|null]
DOUBLY:   null ← [●|D|●] ⟷ [●|D|●] ⟷ [●|D|●] → null
CIRCULAR: [D|●] → [D|●] → [D|●] → (back to head)

TRAVERSAL:        let c = head; while (c) { c = c.next; }
REVERSE:          prev/current/next swap in a while loop
FIND MIDDLE:      slow (1 step) + fast (2 steps)
DETECT CYCLE:     slow (1 step) + fast (2 steps), check if they meet
Nth FROM END:     move fast n ahead, then both move together
DUMMY NODE:       const d = new Node(0); d.next = head; return d.next;
```
