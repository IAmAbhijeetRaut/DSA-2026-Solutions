## OBJECT-ORIENTED PROGRAMMING IN JAVASCRIPT — COMPLETE REFERENCE

---

## 1. What is OOP?

OOP is a programming paradigm that organises code around **objects** — bundles of related data (properties) and behaviour (methods). Instead of writing loose functions and variables everywhere, you group them into self-contained units.

```text
PROCEDURAL (before OOP):                OOP:
┌─────────────────────┐               ┌──────────────────────────┐
│ let name = "Rex";   │               │ class Dog {              │
│ let breed = "Lab";  │               │   constructor(name) {    │
│                     │               │     this.name = name;    │
│ function bark() {   │               │   }                      │
│   console.log(name) │               │   bark() {               │
│ }                   │               │     console.log(this.name│
│                     │               │   }                      │
│ bark();             │               │ }                        │
└─────────────────────┘               │ const d = new Dog("Rex");│
                                      │ d.bark();                │
                                      └──────────────────────────┘
```

**Key terms:**
- **Class** — A blueprint/template for creating objects.
- **Object (Instance)** — A concrete thing created from a class.
- **Property** — Data stored inside an object (`this.name`).
- **Method** — A function that belongs to an object (`bark()`).

---

## 2. Objects — The Foundation

Before classes existed in JavaScript, everything was built on plain objects.

### 2.1 Object Literal

```javascript
const dog = {
    name: "Rex",
    breed: "Labrador",
    bark() {
        console.log(`${this.name} says Woof!`);
    }
};

dog.bark();          // "Rex says Woof!"
dog.name;            // "Rex"
dog.age = 5;         // add new property on the fly
```

### 2.2 Accessing Properties

```javascript
// Dot notation (preferred)
dog.name;            // "Rex"

// Bracket notation (required when key is dynamic or has special chars)
dog["name"];         // "Rex"
const key = "breed";
dog[key];            // "Labrador"
```

### 2.3 `this` — The Most Important Keyword in OOP

`this` refers to the **object that called the method**. Its value depends on HOW a function is called, not WHERE it is written.

```javascript
const car = {
    brand: "Toyota",
    start() {
        console.log(`${this.brand} is starting`);
        //            ^^^^ this = car (because car.start() was called)
    }
};

car.start();         // "Toyota is starting"
```

**The 4 rules of `this` (in order of priority):**

| Rule | When | `this` = |
|---|---|---|
| `new` binding | `new Dog()` | The newly created object |
| Explicit binding | `fn.call(obj)` / `fn.apply(obj)` / `fn.bind(obj)` | The object you pass in |
| Implicit binding | `obj.method()` | The object before the dot |
| Default binding | `fn()` (standalone call) | `undefined` (strict mode) or `window` (sloppy) |

```javascript
function greet() {
    console.log(this.name);
}

const person = { name: "Alice" };

// Rule 3 — Implicit:
person.greet = greet;
person.greet();           // "Alice"

// Rule 2 — Explicit:
greet.call(person);       // "Alice"
greet.apply(person);      // "Alice"
const bound = greet.bind(person);
bound();                  // "Alice"

// Rule 1 — new:
function User(name) { this.name = name; }
const u = new User("Bob");
console.log(u.name);     // "Bob"
```

### 2.4 Arrow Functions and `this`

Arrow functions do **NOT** have their own `this`. They inherit `this` from the surrounding scope.

```javascript
const obj = {
    name: "Alice",
    
    // Regular method — `this` = obj ✓
    greetRegular() {
        console.log(this.name);
    },

    // Arrow — `this` = OUTER scope (NOT obj) ✗
    greetArrow: () => {
        console.log(this.name);   // undefined (inherits from module/global)
    },

    // Useful INSIDE a method:
    delayedGreet() {
        setTimeout(() => {
            console.log(this.name);   // "Alice" ✓ — arrow inherits `this` from delayedGreet
        }, 1000);
    }
};
```

**Rule of thumb:** Use regular functions for methods. Use arrow functions for callbacks inside methods.

---

## 3. Classes — The Blueprint

ES6 (2015) introduced the `class` keyword. It is **syntactic sugar** over JavaScript's prototype system — the underlying mechanism is exactly the same.

### 3.1 Basic Class

```javascript
class Animal {
    constructor(name, sound) {
        this.name = name;       // instance property
        this.sound = sound;
    }

    speak() {                   // instance method (goes on prototype)
        console.log(`${this.name} says ${this.sound}`);
    }
}

const cat = new Animal("Whiskers", "Meow");
cat.speak();   // "Whiskers says Meow"
```

**What `new Animal(...)` does behind the scenes:**
```text
Step 1:  Create a new empty object  {}
Step 2:  Set its [[Prototype]] to Animal.prototype
Step 3:  Run the constructor with `this` = the new object
Step 4:  Return the object (unless constructor explicitly returns another object)
```

### 3.2 Constructor

The `constructor` is a special method that runs **once** when you call `new`. Use it to initialise instance properties.

```javascript
class Rectangle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    area() {
        return this.width * this.height;
    }
}

const r = new Rectangle(5, 10);
console.log(r.area());   // 50
console.log(r.width);    // 5
```

**Rules:**
- A class can have only ONE constructor.
- If you don't write one, JavaScript inserts a default empty constructor: `constructor() {}`.

---

## 4. The Four Pillars of OOP

### 4.1 Encapsulation — "Hide the internals"

Bundle data and methods together, and restrict direct access to internal state.

```javascript
class BankAccount {
    #balance;                        // PRIVATE field (# prefix)

    constructor(owner, initialBalance) {
        this.owner = owner;          // public
        this.#balance = initialBalance;
    }

    deposit(amount) {
        if (amount <= 0) throw new Error("Invalid amount");
        this.#balance += amount;
    }

    withdraw(amount) {
        if (amount > this.#balance) throw new Error("Insufficient funds");
        this.#balance -= amount;
    }

    getBalance() {
        return this.#balance;        // controlled access
    }
}

const acc = new BankAccount("Alice", 1000);
acc.deposit(500);
console.log(acc.getBalance());    // 1500
// console.log(acc.#balance);     // ❌ SyntaxError: Private field
```

**Visualization:**
```text
┌──────────────────────────────────────┐
│          BankAccount                 │
│                                      │
│  PUBLIC:                             │
│    .owner         → "Alice"          │
│    .deposit()     → adds money       │
│    .withdraw()    → removes money    │
│    .getBalance()  → returns balance  │
│                                      │
│  PRIVATE (hidden):                   │
│    #balance       → 1500          🔒 │
│                                      │
│  Outside code CANNOT touch #balance  │
│  directly. Must use methods.         │
└──────────────────────────────────────┘
```

### 4.2 Abstraction — "Hide the complexity"

Expose a simple interface, hide the complex internal logic. The user of a class doesn't need to know HOW it works, only WHAT it does.

```javascript
class CoffeeMachine {
    #waterTemp = 0;

    #boilWater() {                   // private method
        this.#waterTemp = 100;
        console.log("Water boiled to 100°C");
    }

    #grindBeans() {                  // private method
        console.log("Beans ground to fine powder");
    }

    #brew() {                        // private method
        console.log("Brewing espresso...");
    }

    // Simple public interface — user calls ONE method
    makeCoffee() {
        this.#boilWater();
        this.#grindBeans();
        this.#brew();
        console.log("☕ Coffee ready!");
    }
}

const machine = new CoffeeMachine();
machine.makeCoffee();
// Water boiled to 100°C
// Beans ground to fine powder
// Brewing espresso...
// ☕ Coffee ready!

// machine.#boilWater();   ❌ Cannot access private method
```

### 4.3 Inheritance — "Reuse and extend"

A child class inherits all properties and methods from a parent class, and can add or override them.

```javascript
class Animal {
    constructor(name) {
        this.name = name;
    }

    eat() {
        console.log(`${this.name} is eating`);
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);           // MUST call super() before using `this`
        this.breed = breed;
    }

    bark() {
        console.log(`${this.name} barks: Woof!`);
    }
}

const d = new Dog("Rex", "Labrador");
d.eat();    // "Rex is eating"      ← inherited from Animal
d.bark();   // "Rex barks: Woof!"   ← defined in Dog
```

**Visualization:**
```text
        ┌───────────────────┐
        │      Animal       │  ← Parent / Superclass
        │  .name            │
        │  .eat()           │
        └────────┬──────────┘
                 │ extends
        ┌────────▼──────────┐
        │       Dog         │  ← Child / Subclass
        │  .breed           │
        │  .bark()          │
        │  (inherits .name) │
        │  (inherits .eat)  │
        └───────────────────┘
```

**`super` keyword:**
- `super()` — calls the parent's constructor. **Required** in a child constructor before using `this`.
- `super.method()` — calls a method from the parent class.

```javascript
class Cat extends Animal {
    constructor(name) {
        super(name);            // Animal.constructor(name)
    }

    eat() {
        super.eat();            // call parent's eat()
        console.log("...and purring while eating");
    }
}

const c = new Cat("Whiskers");
c.eat();
// "Whiskers is eating"
// "...and purring while eating"
```

### 4.4 Polymorphism — "Same interface, different behaviour"

Different classes can have the same method name, but each implements it differently. Code that calls the method doesn't need to know which class it's dealing with.

```javascript
class Shape {
    area() {
        throw new Error("area() must be implemented");
    }
}

class Circle extends Shape {
    constructor(radius) {
        super();
        this.radius = radius;
    }
    area() {
        return Math.PI * this.radius ** 2;
    }
}

class Rectangle extends Shape {
    constructor(w, h) {
        super();
        this.w = w;
        this.h = h;
    }
    area() {
        return this.w * this.h;
    }
}

class Triangle extends Shape {
    constructor(base, height) {
        super();
        this.base = base;
        this.height = height;
    }
    area() {
        return 0.5 * this.base * this.height;
    }
}

// Polymorphism in action — same method call, different results:
const shapes = [new Circle(5), new Rectangle(4, 6), new Triangle(3, 8)];

shapes.forEach(shape => {
    console.log(shape.area());
});
// 78.539...  (circle)
// 24         (rectangle)
// 12         (triangle)
```

**Visualization:**
```text
                shape.area()
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
   Circle        Rectangle    Triangle
   π × r²        w × h        ½ × b × h
   78.54          24           12

Same method name → different implementation → different result
```

---

## 5. Getters and Setters

Control how properties are read and written. They look like normal property access but run a function behind the scenes.

```javascript
class Person {
    #firstName;
    #lastName;

    constructor(first, last) {
        this.#firstName = first;
        this.#lastName = last;
    }

    // GETTER — triggered by: person.fullName
    get fullName() {
        return `${this.#firstName} ${this.#lastName}`;
    }

    // SETTER — triggered by: person.fullName = "..."
    set fullName(value) {
        const parts = value.split(" ");
        if (parts.length !== 2) throw new Error("Need first and last name");
        this.#firstName = parts[0];
        this.#lastName = parts[1];
    }

    // GETTER with validation
    get firstName() {
        return this.#firstName;
    }

    set firstName(value) {
        if (typeof value !== "string" || value.length === 0) {
            throw new Error("Invalid name");
        }
        this.#firstName = value;
    }
}

const p = new Person("John", "Doe");
console.log(p.fullName);         // "John Doe"    ← calls getter
p.fullName = "Jane Smith";       //               ← calls setter
console.log(p.firstName);       // "Jane"
```

---

## 6. Static Methods and Properties

`static` members belong to the **class itself**, not to any instance.

```javascript
class MathUtils {
    static PI = 3.14159;

    static add(a, b) {
        return a + b;
    }

    static isEven(n) {
        return n % 2 === 0;
    }
}

// Called on the CLASS, not on an instance:
MathUtils.add(2, 3);       // 5
MathUtils.PI;              // 3.14159
MathUtils.isEven(4);       // true

// CANNOT call on instance:
// const m = new MathUtils();
// m.add(2, 3);             // ❌ TypeError
```

**When to use static:**
- Utility/helper functions that don't need instance data.
- Factory methods (creating instances in special ways).
- Constants that are the same for all instances.

```javascript
class User {
    static #count = 0;                       // static private

    constructor(name) {
        this.name = name;
        User.#count++;
    }

    static getCount() {
        return User.#count;
    }
}

new User("Alice");
new User("Bob");
console.log(User.getCount());   // 2
```

---

## 7. Private Fields and Methods (`#`)

The `#` prefix makes a field or method truly private. This is enforced by the JavaScript engine — not just a convention.

```javascript
class Counter {
    #count = 0;          // private field with default value

    increment() {
        this.#count++;
    }

    #log() {             // private method
        console.log(`Count: ${this.#count}`);
    }

    display() {
        this.#log();     // can call private method from inside the class
    }
}

const c = new Counter();
c.increment();
c.increment();
c.display();             // "Count: 2"
// c.#count;             // ❌ SyntaxError
// c.#log();             // ❌ SyntaxError
```

**Comparison: `#private` vs `_convention`:**

| Feature | `#private` | `_convention` |
|---|---|---|
| Enforced by engine | ✅ Yes | ❌ No (anyone can access `_prop`) |
| Accessible from subclass | ❌ No | ✅ Yes |
| Accessible from outside | ❌ No | ✅ Yes (it's just a normal property) |
| Modern standard | ✅ ES2022+ | Pre-ES2022 workaround |

---

## 8. The Prototype Chain (Under the Hood)

JavaScript classes are syntactic sugar. Under the hood, everything uses **prototypes**.

### 8.1 How It Works

Every object has a hidden internal link `[[Prototype]]` pointing to another object. When you access a property, JavaScript searches up this chain.

```javascript
class Animal {
    eat() { console.log("eating"); }
}

class Dog extends Animal {
    bark() { console.log("woof"); }
}

const d = new Dog();
```

**What the prototype chain looks like:**
```text
d (instance)
 │
 └──→ Dog.prototype          { bark() }
       │
       └──→ Animal.prototype  { eat() }
             │
             └──→ Object.prototype  { toString(), hasOwnProperty(), ... }
                   │
                   └──→ null          ← END of the chain
```

**Property lookup for `d.eat()`:**
```text
Step 1: Does d own .eat()?               → NO
Step 2: Does Dog.prototype have .eat()?   → NO
Step 3: Does Animal.prototype have .eat()? → YES ✓  → use this one
```

### 8.2 `prototype` vs `__proto__`

| | `prototype` | `__proto__` |
|---|---|---|
| **Exists on** | Functions/Classes | All objects (instances) |
| **Purpose** | Template for instances created with `new` | Actual link to the object's parent prototype |
| **Modern alternative** | — | `Object.getPrototypeOf(obj)` |

```javascript
console.log(Dog.prototype);                     // { bark: [Function] }
console.log(Object.getPrototypeOf(d) === Dog.prototype);  // true
console.log(d instanceof Dog);                  // true
console.log(d instanceof Animal);               // true
console.log(d instanceof Object);               // true
```

### 8.3 Constructor Functions (Pre-ES6 Pattern)

Before classes existed, this is how OOP was done:

```javascript
function Person(name) {
    this.name = name;
}

Person.prototype.greet = function() {
    console.log(`Hi, I'm ${this.name}`);
};

const p = new Person("Alice");
p.greet();   // "Hi, I'm Alice"
```

This is **identical** to:
```javascript
class Person {
    constructor(name) { this.name = name; }
    greet() { console.log(`Hi, I'm ${this.name}`); }
}
```

---

## 9. `instanceof` and `typeof`

### 9.1 `typeof` — Check primitive types

```javascript
typeof 42;            // "number"
typeof "hello";       // "string"
typeof true;          // "boolean"
typeof undefined;     // "undefined"
typeof null;          // "object"   ← QUIRK! null is NOT an object
typeof {};            // "object"
typeof [];            // "object"   ← arrays are objects!
typeof function(){}   // "function"
```

### 9.2 `instanceof` — Check class/prototype membership

```javascript
class Animal {}
class Dog extends Animal {}

const d = new Dog();

d instanceof Dog;       // true
d instanceof Animal;    // true  ← checks entire prototype chain
d instanceof Object;    // true

[] instanceof Array;    // true
[] instanceof Object;   // true
```

---

## 10. Method Chaining

Return `this` from each method to enable calling methods in sequence.

```javascript
class QueryBuilder {
    #table = "";
    #conditions = [];
    #limit = null;

    from(table) {
        this.#table = table;
        return this;           // ← the key: return this
    }

    where(condition) {
        this.#conditions.push(condition);
        return this;
    }

    take(n) {
        this.#limit = n;
        return this;
    }

    build() {
        let query = `SELECT * FROM ${this.#table}`;
        if (this.#conditions.length > 0) {
            query += ` WHERE ${this.#conditions.join(" AND ")}`;
        }
        if (this.#limit) {
            query += ` LIMIT ${this.#limit}`;
        }
        return query;
    }
}

// Method chaining in action:
const query = new QueryBuilder()
    .from("users")
    .where("age > 18")
    .where("active = true")
    .take(10)
    .build();

console.log(query);
// "SELECT * FROM users WHERE age > 18 AND active = true LIMIT 10"
```

**How it works:**
```text
new QueryBuilder()          → returns QueryBuilder instance
  .from("users")            → sets table, returns this (same instance)
  .where("age > 18")        → adds condition, returns this
  .where("active = true")   → adds condition, returns this
  .take(10)                 → sets limit, returns this
  .build()                  → returns the final string (breaks the chain)
```

---

## 11. Composition vs Inheritance

### Inheritance: "is-a" relationship

```javascript
class Animal {
    eat() { console.log("eating"); }
}
class Bird extends Animal {
    fly() { console.log("flying"); }
}
class Penguin extends Bird {
    fly() { throw new Error("Penguins can't fly!"); }  // ← PROBLEM
}
```

Penguins inherit `fly()` from Bird, but they can't fly. The rigid hierarchy breaks.

### Composition: "has-a" relationship — PREFERRED

Instead of inheriting, **inject** capabilities as independent pieces.

```javascript
// Independent behaviours:
const canEat = (self) => ({
    eat() { console.log(`${self.name} is eating`); }
});

const canFly = (self) => ({
    fly() { console.log(`${self.name} is flying`); }
});

const canSwim = (self) => ({
    swim() { console.log(`${self.name} is swimming`); }
});

// Compose objects by mixing in only what they need:
function createBird(name) {
    const self = { name };
    return Object.assign(self, canEat(self), canFly(self));
}

function createPenguin(name) {
    const self = { name };
    return Object.assign(self, canEat(self), canSwim(self));  // no fly!
}

const eagle = createBird("Eagle");
eagle.eat();    // "Eagle is eating"
eagle.fly();    // "Eagle is flying"

const penguin = createPenguin("Tux");
penguin.eat();  // "Tux is eating"
penguin.swim(); // "Tux is swimming"
// penguin.fly();  → undefined (doesn't have it)
```

**When to use which:**

| | Inheritance | Composition |
|---|---|---|
| Use when | Strict "is-a" hierarchy (Dog IS an Animal) | Flexible "has-a" capabilities |
| Pros | Natural, less boilerplate | Flexible, avoids hierarchy problems |
| Cons | Rigid, breaks with edge cases | More explicit wiring |
| Rule | Prefer for 1–2 levels deep | Prefer for complex systems |

---

## 12. `call()`, `apply()`, `bind()` — Explicit `this` Binding

### 12.1 `call(context, arg1, arg2, ...)`

Invokes the function **immediately** with the given `this`.

```javascript
function greet(greeting, punctuation) {
    console.log(`${greeting}, ${this.name}${punctuation}`);
}

const user = { name: "Alice" };
greet.call(user, "Hello", "!");    // "Hello, Alice!"
```

### 12.2 `apply(context, [arg1, arg2, ...])`

Same as `call`, but arguments are passed as an **array**.

```javascript
greet.apply(user, ["Hi", "?"]);    // "Hi, Alice?"
```

### 12.3 `bind(context, arg1, arg2, ...)`

Returns a **new function** with `this` permanently set. Does NOT execute immediately.

```javascript
const greetAlice = greet.bind(user, "Hey");
greetAlice(".");              // "Hey, Alice."
greetAlice("!!!");            // "Hey, Alice!!!"
```

**Summary:**

| Method | Executes immediately? | Arguments |
|---|---|---|
| `call` | ✅ Yes | Comma-separated |
| `apply` | ✅ Yes | Array |
| `bind` | ❌ No (returns new function) | Comma-separated (partial application) |

---

## 13. `Object.create()` — Prototypal Inheritance Without Classes

Create an object with a specific prototype. No `class` or `new` needed.

```javascript
const animal = {
    eat() {
        console.log(`${this.name} is eating`);
    }
};

const dog = Object.create(animal);   // dog's prototype is animal
dog.name = "Rex";
dog.bark = function() {
    console.log("Woof!");
};

dog.eat();    // "Rex is eating"   ← found on prototype (animal)
dog.bark();   // "Woof!"           ← found on dog itself
```

**Prototype chain:**
```text
dog → animal → Object.prototype → null
```

---

## 14. `Object.assign()` — Copying / Merging Objects

```javascript
const defaults = { theme: "dark", fontSize: 14, lang: "en" };
const userPrefs = { fontSize: 18, lang: "jp" };

const config = Object.assign({}, defaults, userPrefs);
console.log(config);
// { theme: "dark", fontSize: 18, lang: "jp" }
//   ↑ from defaults  ↑ overridden    ↑ overridden

// Spread syntax does the same:
const config2 = { ...defaults, ...userPrefs };
```

---

## 15. OOP in DSA — Practical Application

Classes are used constantly in DSA to build data structures:

### 15.1 Stack

```javascript
class Stack {
    #items = [];

    push(val)  { this.#items.push(val); }
    pop()      { return this.#items.pop(); }
    peek()     { return this.#items[this.#items.length - 1]; }
    isEmpty()  { return this.#items.length === 0; }
    size()     { return this.#items.length; }
}

const s = new Stack();
s.push(10);
s.push(20);
s.push(30);
s.pop();         // 30
s.peek();        // 20
```

### 15.2 Queue

```javascript
class Queue {
    #items = [];

    enqueue(val)  { this.#items.push(val); }
    dequeue()     { return this.#items.shift(); }
    front()       { return this.#items[0]; }
    isEmpty()     { return this.#items.length === 0; }
    size()        { return this.#items.length; }
}
```

### 15.3 Linked List Node

```javascript
class ListNode {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}
```

### 15.4 Binary Tree Node

```javascript
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}
```

### 15.5 Graph (Adjacency List)

```javascript
class Graph {
    #adjList = new Map();

    addVertex(v) {
        if (!this.#adjList.has(v)) {
            this.#adjList.set(v, []);
        }
    }

    addEdge(v1, v2) {
        this.#adjList.get(v1).push(v2);
        this.#adjList.get(v2).push(v1);   // undirected
    }

    getNeighbors(v) {
        return this.#adjList.get(v);
    }
}
```

---

## 16. Common Pitfalls

| Pitfall | Problem | Fix |
|---|---|---|
| Forgetting `new` | `const d = Dog()` → `this` is `undefined` | Always use `new Dog()` |
| Forgetting `super()` | `ReferenceError` in child constructor | Always call `super()` first |
| Arrow methods | `this` is wrong inside class methods defined as arrows at class body level | Use regular method syntax for class methods |
| Mutating shared prototype | All instances affected | Only add methods to prototype, not mutable data |
| Deep inheritance | Rigid, fragile hierarchy | Prefer composition for 3+ levels |
| `this` in callbacks | `setTimeout(this.method, 1000)` loses `this` | Use arrow: `setTimeout(() => this.method(), 1000)` or `.bind(this)` |

---

## 17. Quick Reference — All Syntax At a Glance

```javascript
class Parent {
    // Public field
    publicField = "visible";
    
    // Private field
    #privateField = "hidden";
    
    // Static field
    static staticField = "on class";
    
    // Static private field
    static #staticPrivate = "hidden on class";

    // Constructor
    constructor(arg) {
        this.arg = arg;
    }

    // Instance method
    instanceMethod() {
        return this.arg;
    }

    // Private method
    #privateMethod() {
        return this.#privateField;
    }

    // Static method
    static staticMethod() {
        return Parent.staticField;
    }

    // Getter
    get computed() {
        return this.arg.toUpperCase();
    }

    // Setter
    set computed(val) {
        this.arg = val.toLowerCase();
    }
}

class Child extends Parent {
    constructor(arg, extra) {
        super(arg);             // MUST call before using this
        this.extra = extra;
    }

    // Override parent method
    instanceMethod() {
        const parentResult = super.instanceMethod();
        return `${parentResult} + ${this.extra}`;
    }
}

// Usage
const obj = new Child("hello", "world");
obj.instanceMethod();     // "hello + world"
obj.computed;             // "HELLO" (getter)
obj.computed = "BYE";     // setter → this.arg = "bye"
Child.staticMethod();     // "on class"
obj instanceof Child;     // true
obj instanceof Parent;    // true
```
