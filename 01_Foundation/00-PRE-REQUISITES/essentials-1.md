## **ESSENTIAL JAVASCRIPT FUNCTIONS FOR DSA FOUNDATION - COMPLETE GUIDE**

### **PART 1: ARRAY METHODS - MOST IMPORTANT FOR DSA**

#### **1. PUSH() - Add elements to END of array**
```javascript
// Adds one or more elements to the end
const arr = [1, 2, 3];
arr.push(4);
console.log(arr);  // Output: [1, 2, 3, 4]

arr.push(5, 6);
console.log(arr);  // Output: [1, 2, 3, 4, 5, 6]

const newLength = arr.push(7);
console.log(newLength); // Output: 7 (returns new length)
```

#### **2. POP() - Remove element from END**
```javascript
const arr = [1, 2, 3, 4];
const removed = arr.pop();
console.log(removed);  // Output: 4
console.log(arr);      // Output: [1, 2, 3]
```

#### **3. UNSHIFT() - Add elements to START**
```javascript
const arr = [2, 3, 4];
arr.unshift(1);
console.log(arr);  // Output: [1, 2, 3, 4]

arr.unshift(-1, 0);
console.log(arr);  // Output: [-1, 0, 1, 2, 3, 4]
```

#### **4. SHIFT() - Remove element from START**
```javascript
const arr = [1, 2, 3, 4];
const removed = arr.shift();
console.log(removed);  // Output: 1
console.log(arr);      // Output: [2, 3, 4]
```

#### **5. SLICE() - Extract portion (NON-MUTATING)**
```javascript
const arr = [1, 2, 3, 4, 5];
const sliced = arr.slice(1, 4);
console.log(sliced);  // Output: [2, 3, 4]
console.log(arr);     // Output: [1, 2, 3, 4, 5] (unchanged)

// Negative indices
const sliced2 = arr.slice(-3);
console.log(sliced2); // Output: [3, 4, 5] (last 3 elements)

// Copy entire array
const copy = arr.slice();
console.log(copy);    // Output: [1, 2, 3, 4, 5]
```

#### **6. SPLICE() - Remove/Replace/Add elements (MUTATING)**
```javascript
const arr = [1, 2, 3, 4, 5];
const removed = arr.splice(2, 1);  // Start at index 2, remove 1 element
console.log(removed); // Output: [3]
console.log(arr);     // Output: [1, 2, 4, 5]

// Add elements while removing
const arr2 = [1, 2, 3, 4, 5];
arr2.splice(2, 2, 'a', 'b', 'c');  // Remove 2 at index 2, add 3 new
console.log(arr2);    // Output: [1, 2, 'a', 'b', 'c', 5]
```

#### **7. REVERSE() - Reverse array (MUTATING)**
```javascript
const arr = [1, 2, 3, 4, 5];
arr.reverse();
console.log(arr);  // Output: [5, 4, 3, 2, 1]
```

#### **8. SORT() - Sort elements (MUTATING)**
```javascript
// Default: alphabetical/lexicographic sort
const arr = [10, 5, 40, 25, 1000, 1];
arr.sort();
console.log(arr);  // Output: [1, 10, 25, 40, 1000, 5] (STRING SORT!)

// Correct numeric sort
const nums = [10, 5, 40, 25, 1000, 1];
nums.sort((a, b) => a - b);
console.log(nums); // Output: [1, 5, 10, 25, 40, 1000]

// Descending sort
nums.sort((a, b) => b - a);
console.log(nums); // Output: [1000, 40, 25, 10, 5, 1]
```

#### **9. MAP() - Transform elements (NON-MUTATING)**
```javascript
const arr = [1, 2, 3, 4, 5];
const doubled = arr.map(x => x * 2);
console.log(doubled);  // Output: [2, 4, 6, 8, 10]
console.log(arr);      // Output: [1, 2, 3, 4, 5] (unchanged)

// With multiple parameters
const mapped = arr.map((val, index, array) => {
  return val * index;
});
console.log(mapped);   // Output: [0, 2, 6, 12, 20]
```

#### **10. FILTER() - Keep elements that match condition (NON-MUTATING)**
```javascript
const arr = [1, 2, 3, 4, 5, 6];
const evens = arr.filter(x => x % 2 === 0);
console.log(evens);    // Output: [2, 4, 6]
console.log(arr);      // Output: [1, 2, 3, 4, 5, 6] (unchanged)
```

#### **11. REDUCE() - Combine all elements into single value**
```javascript
const arr = [1, 2, 3, 4, 5];

// Sum all
const sum = arr.reduce((acc, val) => acc + val, 0);
console.log(sum);      // Output: 15

// Product
const product = arr.reduce((acc, val) => acc * val, 1);
console.log(product);  // Output: 120

// Without initial value (uses first element)
const sum2 = arr.reduce((acc, val) => acc + val);
console.log(sum2);     // Output: 15
```

#### **12. FIND() - Get first element matching condition**
```javascript
const arr = [10, 20, 30, 40, 50];
const found = arr.find(x => x > 25);
console.log(found);    // Output: 30

const notFound = arr.find(x => x > 100);
console.log(notFound); // Output: undefined
```

#### **13. FINDINDEX() - Get index of first matching element**
```javascript
const arr = [10, 20, 30, 40, 50];
const index = arr.findIndex(x => x > 25);
console.log(index);    // Output: 2

const notFound = arr.findIndex(x => x > 100);
console.log(notFound); // Output: -1
```

#### **14. INDEXOF() - Find index of value**
```javascript
const arr = [10, 20, 30, 40, 30];
console.log(arr.indexOf(30));  // Output: 2
console.log(arr.indexOf(50));  // Output: -1

// With starting index
console.log(arr.indexOf(30, 3));  // Output: 4 (second 30)
```

#### **15. INCLUDES() - Check if array contains value**
```javascript
const arr = [10, 20, 30, 40];
console.log(arr.includes(30));     // Output: true
console.log(arr.includes(50));     // Output: false
```

#### **16. CONCAT() - Join arrays (NON-MUTATING)**
```javascript
const arr1 = [1, 2, 3];
const arr2 = [4, 5];
const combined = arr1.concat(arr2);
console.log(combined);  // Output: [1, 2, 3, 4, 5]
console.log(arr1);      // Output: [1, 2, 3] (unchanged)

// Multiple arrays
const result = arr1.concat(arr2, [6, 7]);
console.log(result);    // Output: [1, 2, 3, 4, 5, 6, 7]
```

#### **17. JOIN() - Convert array to string**
```javascript
const arr = ['a', 'b', 'c'];
const str = arr.join('');
console.log(str);      // Output: 'abc'

const str2 = arr.join('-');
console.log(str2);     // Output: 'a-b-c'

const str3 = arr.join();
console.log(str3);     // Output: 'a,b,c' (default separator)
```

#### **18. FOREACH() - Execute function for each element**
```javascript
const arr = [1, 2, 3];
arr.forEach((val, index) => {
  console.log(`Index ${index}: ${val}`);
});
// Output:
// Index 0: 1
// Index 1: 2
// Index 2: 3

// forEach does NOT return anything
const result = arr.forEach(x => x * 2);
console.log(result);   // Output: undefined
```

#### **19. SOME() - Check if ANY element matches condition**
```javascript
const arr = [1, 2, 3, 4, 5];
console.log(arr.some(x => x > 3));    // Output: true
console.log(arr.some(x => x > 10));   // Output: false
```

#### **20. EVERY() - Check if ALL elements match condition**
```javascript
const arr = [2, 4, 6, 8];
console.log(arr.every(x => x % 2 === 0));  // Output: true

const arr2 = [2, 4, 5, 8];
console.log(arr2.every(x => x % 2 === 0)); // Output: false
```

#### **21. FLAT() - Flatten nested arrays**
```javascript
const nested = [1, [2, [3, [4]]]];
console.log(nested.flat());        // Output: [1, 2, [3, [4]]]
console.log(nested.flat(2));       // Output: [1, 2, 3, [4]]
console.log(nested.flat(Infinity));// Output: [1, 2, 3, 4]
```

#### **22. FLATMAP() - Map AND flatten**
```javascript
const arr = [1, 2, 3];
const result = arr.flatMap(x => [x, x * 2]);
console.log(result);   // Output: [1, 2, 2, 4, 3, 6]
```

***

### **PART 2: CRUCIAL UTILITY FUNCTIONS**

#### **23. LENGTH property - Get array size**
```javascript
const arr = [1, 2, 3, 4, 5];
console.log(arr.length);  // Output: 5

// Set length to remove elements
arr.length = 3;
console.log(arr);         // Output: [1, 2, 3]
```

#### **24. ISARRAY() - Check if value is array**
```javascript
console.log(Array.isArray([1, 2, 3]));     // Output: true
console.log(Array.isArray('hello'));       // Output: false
console.log(Array.isArray({0: 1, length: 1})); // Output: false
```

#### **25. FROM() - Convert iterable to array**
```javascript
// From string
console.log(Array.from('hello'));  // Output: ['h', 'e', 'l', 'l', 'o']

// From Set
const set = new Set([1, 2, 3]);
console.log(Array.from(set));      // Output: [1, 2, 3]

// With mapping
const arr = Array.from([1, 2, 3], x => x * 2);
console.log(arr);                  // Output: [2, 4, 6]
```

***

### **PART 3: ESSENTIAL FOR LOOPS & ITERATION**

#### **26. FOR LOOP**
```javascript
const arr = [10, 20, 30];
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
// Output: 10, 20, 30
```

#### **27. FOR...OF LOOP**
```javascript
const arr = [10, 20, 30];
for (const val of arr) {
  console.log(val);
}
// Output: 10, 20, 30
```

#### **28. WHILE LOOP**
```javascript
let i = 0;
while (i < 3) {
  console.log(i);
  i++;
}
// Output: 0, 1, 2
```

***

### **PART 4: STRING METHODS (Essential for many problems)**

#### **29. SPLIT() - Convert string to array**
```javascript
const str = 'a-b-c';
const arr = str.split('-');
console.log(arr);  // Output: ['a', 'b', 'c']

const chars = 'hello'.split('');
console.log(chars); // Output: ['h', 'e', 'l', 'l', 'o']
```

#### **30. TOSTRING() / TOSTRING() - Convert to string**
```javascript
const arr = [1, 2, 3];
console.log(arr.toString());  // Output: '1,2,3'
```

#### **31. LENGTH property**
```javascript
const str = 'hello';
console.log(str.length);  // Output: 5
```

#### **32. CHARCODEAT() - Get character code**
```javascript
const str = 'hello';
console.log(str.charCodeAt(0));  // Output: 104 (ASCII of 'h')
```

***

### **PART 5: ESSENTIAL MATH FUNCTIONS**

#### **33. Math.MAX() / Math.MIN()**
```javascript
console.log(Math.max(5, 10, 3, 8));    // Output: 10
console.log(Math.min(5, 10, 3, 8));    // Output: 3

// With spread operator on array
const arr = [5, 10, 3, 8];
console.log(Math.max(...arr));         // Output: 10
```

#### **34. Math.ABS() - Absolute value**
```javascript
console.log(Math.abs(-5));   // Output: 5
console.log(Math.abs(-3.14));// Output: 3.14
```

#### **35. Math.FLOOR() / Math.CEIL() / Math.ROUND()**
```javascript
console.log(Math.floor(4.7));   // Output: 4
console.log(Math.ceil(4.2));    // Output: 5
console.log(Math.round(4.5));   // Output: 4
console.log(Math.round(4.6));   // Output: 5
```

#### **36. Math.POW() - Exponentiation**
```javascript
console.log(Math.pow(2, 3));    // Output: 8
console.log(2 ** 3);            // Output: 8 (same)


## **PART 6: ESSENTIAL STRING METHODS (Complete Coverage)**

#### **1. SPLIT() - Convert string to array**
```javascript
// Basic split
const str = 'hello world';
console.log(str.split(' '));  // Output: ['hello', 'world']

// Split by character
const chars = 'hello'.split('');
console.log(chars);           // Output: ['h', 'e', 'l', 'l', 'o']

// Split with limit
const limited = 'a,b,c,d'.split(',', 2);
console.log(limited);         // Output: ['a', 'b']

// Common use in DSA
const numbers = '1 2 3 4 5'.split(' ').map(Number);
console.log(numbers);         // Output: [1, 2, 3, 4, 5]
```

#### **2. CHARAT() - Get character at index**
```javascript
const str = 'hello';
console.log(str.charAt(0));   // Output: 'h'
console.log(str.charAt(4));   // Output: 'o'
console.log(str.charAt(10));  // Output: '' (empty string, out of bounds)
```

#### **3. CHARCODEAT() - Get ASCII code of character**
```javascript
const str = 'hello';
console.log(str.charCodeAt(0));  // Output: 104 (ASCII of 'h')
console.log(str.charCodeAt(1));  // Output: 101 (ASCII of 'e')

// Useful for checking characters
const char = 'a';
if (char.charCodeAt(0) >= 97 && char.charCodeAt(0) <= 122) {
  console.log('lowercase letter');  // Output: lowercase letter
}
```

#### **4. FROMCHARCODE() - Convert ASCII codes to string**
```javascript
console.log(String.fromCharCode(72, 101, 108, 108, 111));
// Output: 'Hello'

console.log(String.fromCharCode(65));  // Output: 'A'
console.log(String.fromCharCode(97));  // Output: 'a'
```

#### **5. SUBSTRING() - Extract part of string (NON-MUTATING)**
```javascript
const str = 'hello world';
console.log(str.substring(0, 5));      // Output: 'hello'
console.log(str.substring(6));         // Output: 'world' (to end)
console.log(str.substring(6, 11));     // Output: 'world'

// Note: SUBSTRING swaps parameters if start > end
console.log(str.substring(5, 0));      // Output: 'hello' (same as (0, 5))
```

#### **6. SLICE() - Extract part of string (NON-MUTATING)**
```javascript
const str = 'hello world';
console.log(str.slice(0, 5));          // Output: 'hello'
console.log(str.slice(6));             // Output: 'world'
console.log(str.slice(-5));            // Output: 'world' (last 5)
console.log(str.slice(-11, -6));       // Output: 'hello'

// Difference from substring: slice allows negative, substring doesn't
console.log(str.slice(-5, -2));        // Output: 'wor'
```

#### **7. INDEXOF() - Find index of substring**
```javascript
const str = 'hello world hello';
console.log(str.indexOf('hello'));     // Output: 0
console.log(str.indexOf('world'));     // Output: 6
console.log(str.indexOf('xyz'));       // Output: -1 (not found)
console.log(str.indexOf('hello', 1));  // Output: 12 (search from index 1)
```

#### **8. LASTINDEXOF() - Find last index of substring**
```javascript
const str = 'hello world hello';
console.log(str.lastIndexOf('hello'));      // Output: 12
console.log(str.lastIndexOf('world'));      // Output: 6
console.log(str.lastIndexOf('hello', 5));   // Output: 0
```

#### **9. INCLUDES() - Check if string contains substring**
```javascript
const str = 'hello world';
console.log(str.includes('hello'));    // Output: true
console.log(str.includes('xyz'));      // Output: false
console.log(str.includes('world', 6)); // Output: true (search from index 6)
```

#### **10. STARTSWITH() - Check if string starts with substring**
```javascript
const str = 'hello world';
console.log(str.startsWith('hello'));  // Output: true
console.log(str.startsWith('world'));  // Output: false
console.log(str.startsWith('world', 6)); // Output: true (from position 6)
```

#### **11. ENDSWITH() - Check if string ends with substring**
```javascript
const str = 'hello world';
console.log(str.endsWith('world'));    // Output: true
console.log(str.endsWith('hello'));    // Output: false
console.log(str.endsWith('hello', 5)); // Output: true (considering length 5)
```

#### **12. TOUPPER CASE() / TOLOWERCASE() - Change case**
```javascript
const str = 'Hello World';
console.log(str.toUpperCase());        // Output: 'HELLO WORLD'
console.log(str.toLowerCase());        // Output: 'hello world'
console.log('ABC'.toLowerCase());      // Output: 'abc'
```

#### **13. TRIM() / TRIMSTART() / TRIMEND() - Remove whitespace**
```javascript
const str = '  hello world  ';
console.log(str.trim());               // Output: 'hello world'
console.log(str.trimStart());          // Output: 'hello world  '
console.log(str.trimEnd());            // Output: '  hello world'
console.log('  spaces  '.trim().length); // Output: 6
```

#### **14. REPEAT() - Repeat string**
```javascript
console.log('ab'.repeat(3));           // Output: 'ababab'
console.log('hello '.repeat(2));       // Output: 'hello hello '
console.log('-'.repeat(5));            // Output: '-----'
```

#### **15. REPLACE() - Replace first occurrence**
```javascript
const str = 'hello world hello';
console.log(str.replace('hello', 'hi'));      // Output: 'hi world hello'
console.log(str.replace('world', 'universe')); // Output: 'hello universe hello'

// Case-insensitive with regex
console.log(str.replace(/hello/i, 'hi'));     // Output: 'hi world hello'
```

#### **16. REPLACEALL() - Replace all occurrences**
```javascript
const str = 'hello world hello';
console.log(str.replaceAll('hello', 'hi'));   // Output: 'hi world hi'

// With regex
console.log(str.replaceAll(/hello/g, 'hi'));  // Output: 'hi world hi'
```

#### **17. CONCAT() - Join strings**
```javascript
const str1 = 'hello';
const str2 = 'world';
console.log(str1.concat(' ', str2));   // Output: 'hello world'
console.log(str1.concat(' ', str2, '!')); // Output: 'hello world!'

// Same as using + operator
console.log(str1 + ' ' + str2);        // Output: 'hello world'
```

#### **18. PADSTART() / PADEND() - Pad string**
```javascript
const str = '5';
console.log(str.padStart(3, '0'));     // Output: '005'
console.log(str.padEnd(3, '0'));       // Output: '500'

// Common in formatting
const num = String(42).padStart(5, '0');
console.log(num);                      // Output: '00042'
```

#### **19. MATCH() - Find matches with regex**
```javascript
const str = 'hello123world456';
const matches = str.match(/\d+/g);     // Find all numbers
console.log(matches);                  // Output: ['123', '456']

const single = str.match(/\d+/);       // Find first
console.log(single);                   // Output: ['123']
```

#### **20. SEARCH() - Find index of regex match**
```javascript
const str = 'hello123world';
console.log(str.search(/\d+/));        // Output: 5 (index where digits start)
console.log(str.search('world'));      // Output: 8
console.log(str.search(/xyz/));        // Output: -1 (not found)
```

***

## **PART 7: OBJECT & NUMBER METHODS**

#### **21. PARSEINT() - Convert string to integer**
```javascript
console.log(parseInt('42'));           // Output: 42
console.log(parseInt('42.99'));        // Output: 42 (truncates decimal)
console.log(parseInt('  42  '));       // Output: 42 (ignores whitespace)
console.log(parseInt('FF', 16));       // Output: 255 (hexadecimal)
console.log(parseInt('10', 2));        // Output: 2 (binary)
```

#### **22. PARSEFLOAT() - Convert string to decimal**
```javascript
console.log(parseFloat('3.14'));       // Output: 3.14
console.log(parseFloat('3.14abc'));    // Output: 3.14 (stops at letter)
console.log(parseFloat('  42.5  '));   // Output: 42.5
```

#### **23. TOSTRING() - Convert to string**
```javascript
const num = 42;
console.log(num.toString());           // Output: '42'
console.log((255).toString(16));       // Output: 'ff' (hexadecimal)
console.log((10).toString(2));         // Output: '1010' (binary)

const obj = {a: 1};
console.log(obj.toString());           // Output: '[object Object]'
```

***

## **PART 8: OBJECT METHODS (Essential for DSA)**

#### **24. OBJECT.KEYS() - Get object keys as array**
```javascript
const obj = {name: 'John', age: 30, city: 'NYC'};
console.log(Object.keys(obj));         // Output: ['name', 'age', 'city']

// Useful for iteration
Object.keys(obj).forEach(key => {
  console.log(`${key}: ${obj[key]}`);
});
// Output:
// name: John
// age: 30
// city: NYC
```

#### **25. OBJECT.VALUES() - Get object values as array**
```javascript
const obj = {name: 'John', age: 30, city: 'NYC'};
console.log(Object.values(obj));       // Output: ['John', 30, 'NYC']
```

#### **26. OBJECT.ENTRIES() - Get key-value pairs**
```javascript
const obj = {name: 'John', age: 30};
console.log(Object.entries(obj));
// Output: [['name', 'John'], ['age', 30]]

// Useful in loops
for (const [key, value] of Object.entries(obj)) {
  console.log(`${key}: ${value}`);
}
// Output:
// name: John
// age: 30
```

#### **27. OBJECT.ASSIGN() - Copy/merge objects**
```javascript
const obj1 = {a: 1, b: 2};
const obj2 = {b: 3, c: 4};
const merged = Object.assign({}, obj1, obj2);
console.log(merged);                   // Output: {a: 1, b: 3, c: 4}

// Spread syntax does same thing
const merged2 = {...obj1, ...obj2};
console.log(merged2);                  // Output: {a: 1, b: 3, c: 4}
```

***

## **PART 9: SET & MAP (Advanced but useful)**

#### **28. SET - Store unique values**
```javascript
const set = new Set([1, 2, 2, 3, 3, 3]);
console.log(set);                      // Output: Set { 1, 2, 3 }
console.log(set.size);                 // Output: 3

// Add/remove
set.add(4);
console.log(set);                      // Output: Set { 1, 2, 3, 4 }

set.delete(2);
console.log(set);                      // Output: Set { 1, 3, 4 }

console.log(set.has(3));               // Output: true
console.log(set.has(2));               // Output: false
```

#### **29. MAP - Key-value pairs (like object but better)**
```javascript
const map = new Map();
map.set('a', 1);
map.set('b', 2);
console.log(map.get('a'));             // Output: 1
console.log(map.size);                 // Output: 2

// Iterate
for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}
// Output:
// a: 1
// b: 2
```

***

## **PART 10: SPREAD & DESTRUCTURING**

#### **30. SPREAD OPERATOR (...) - Expand arrays/objects**
```javascript
// Arrays
const arr1 = [1, 2];
const arr2 = [3, 4];
const combined = [...arr1, ...arr2];
console.log(combined);                 // Output: [1, 2, 3, 4]

// Copy array
const copy = [...arr1];
console.log(copy);                     // Output: [1, 2]

// Objects
const obj1 = {a: 1};
const obj2 = {b: 2};
const merged = {...obj1, ...obj2};
console.log(merged);                   // Output: {a: 1, b: 2}
```

#### **31. DESTRUCTURING - Extract values**
```javascript
// Arrays
const [a, b, c] = [1, 2, 3];
console.log(a, b, c);                  // Output: 1 2 3

// Skip elements
const [x, , z] = [10, 20, 30];
console.log(x, z);                     // Output: 10 30

// Objects
const {name, age} = {name: 'John', age: 30};
console.log(name, age);                // Output: John 30

// With defaults
const [p = 0, q = 0] = [5];
console.log(p, q);                     // Output: 5 0
```

***

## **PART 11: HIGHER-ORDER FUNCTIONS**

#### **32. ARROW FUNCTIONS**
```javascript
// Regular function
function add(a, b) {
  return a + b;
}

// Arrow function
const add2 = (a, b) => a + b;
console.log(add2(5, 3));               // Output: 8

// Single parameter
const square = x => x * x;
console.log(square(4));                // Output: 16

// No parameters
const greet = () => 'Hello';
console.log(greet());                  // Output: Hello
```

***

Perfect! I apologize for the incomplete table. Let me complete the **PRACTICE QUICK REFERENCE TABLE** with all essential JavaScript functions properly filled out:

***

## **COMPLETE QUICK REFERENCE TABLE - ALL ESSENTIAL JS FUNCTIONS**

### **ARRAY METHODS - COMPLETE TABLE**

| Function | Purpose | Mutating? | Returns | Example |
|----------|---------|-----------|---------|---------|
| **push()** | Add to END | ✅ Yes | New length | `arr.push(4)` → 4 |
| **pop()** | Remove from END | ✅ Yes | Removed element | `arr.pop()` → 4 |
| **unshift()** | Add to START | ✅ Yes | New length | `arr.unshift(0)` → 5 |
| **shift()** | Remove from START | ✅ Yes | Removed element | `arr.shift()` → 1 |
| **slice()** | Extract portion | ❌ No | New array | `arr.slice(1, 3)` →  |
| **splice()** | Add/remove anywhere | ✅ Yes | Removed elements | `arr.splice(1, 1, 'x')` →  |
| **concat()** | Merge arrays | ❌ No | New array | `[1,2].concat([3])` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |
| **join()** | Array to string | ❌ No | String | `[1,2,3].join(',')` → "1,2,3" |
| **reverse()** | Reverse order | ✅ Yes | Reversed array | `[1,2,3].reverse()` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |
| **sort()** | Sort elements | ✅ Yes | Sorted array | `[3,1,2].sort((a,b)=>a-b)` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |
| **map()** | Transform each | ❌ No | New array | `[1,2].map(x=>x*2)` →  |
| **filter()** | Keep matches | ❌ No | New array | `[1,2,3].filter(x=>x>1)` →  |
| **reduce()** | Combine to single | ❌ No | Single value | `[1,2,3].reduce((a,b)=>a+b,0)` → 6 |
| **reduceRight()** | Reduce right-to-left | ❌ No | Single value | `[1,2,3].reduceRight((a,b)=>a+b,0)` → 6 |
| **find()** | First match | ❌ No | Element/undefined | `[1,2,3].find(x=>x>1)` → 2 |
| **findIndex()** | Index of first match | ❌ No | Index/-1 | `[1,2,3].findIndex(x=>x>1)` → 1 |
| **findLast()** | Last match | ❌ No | Element/undefined | `[1,2,3,2].findLast(x=>x===2)` → 2 |
| **findLastIndex()** | Index of last match | ❌ No | Index/-1 | `[1,2,3,2].findLastIndex(x=>x===2)` → 3 |
| **indexOf()** | Find value position | ❌ No | Index/-1 | `[1,2,3,2].indexOf(2)` → 1 |
| **lastIndexOf()** | Find last position | ❌ No | Index/-1 | `[1,2,3,2].lastIndexOf(2)` → 3 |
| **includes()** | Contains value? | ❌ No | true/false | `[1,2,3].includes(2)` → true |
| **forEach()** | Loop all items | ❌ No | undefined | `[1,2].forEach(x=>console.log(x))` |
| **some()** | ANY match? | ❌ No | true/false | `[1,2,3].some(x=>x>2)` → true |
| **every()** | ALL match? | ❌ No | true/false | `[1,2,3].every(x=>x>0)` → true |
| **flat()** | Flatten nested | ❌ No | Flattened array | `[1,[2,3]].flat()` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |
| **flatMap()** | Map + flatten | ❌ No | New array | `[1,2].flatMap(x=>[x,x*2])` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |
| **fill()** | Fill with value | ✅ Yes | Modified array | `[1,2,3].fill(0,1,2)` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |
| **copyWithin()** | Copy within array | ✅ Yes | Modified array | `[1,2,3,4].copyWithin(0,2)` →  |
| **entries()** | Get [index, value] | ❌ No | Iterator | `[...[1,2].entries()]` → [ [namastedev](https://namastedev.com/namaste-dsa-sheet), [namastedev](https://namastedev.com/namaste-dsa-sheet)] |
| **keys()** | Get indices | ❌ No | Iterator | `[...[1,2].keys()]` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |
| **values()** | Get values | ❌ No | Iterator | `[...[1,2].values()]` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |
| **at()** | Access with negative | ❌ No | Element/undefined | `[1,2,3].at(-1)` → 3 |
| **length** | Array size | - | Number | `[1,2,3].length` → 3 |
| **Array.isArray()** | Is array? | - | true/false | `Array.isArray( [namastedev](https://namastedev.com/namaste-dsa-sheet))` → true |
| **Array.from()** | Convert iterable | - | New array | `Array.from('abc')` → ['a','b','c'] |
| **Array.of()** | Create from args | - | New array | `Array.of(1,2,3)` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |

***

### **STRING METHODS - COMPLETE TABLE**

| Function | Purpose | Mutating? | Returns | Example |
|----------|---------|-----------|---------|---------|
| **split()** | String to array | ❌ No | Array | `"a-b".split('-')` → ['a','b'] |
| **charAt()** | Get char at index | ❌ No | Character | `"hello".charAt(0)` → 'h' |
| **charCodeAt()** | Get ASCII code | ❌ No | ASCII code | `"A".charCodeAt(0)` → 65 |
| **String.fromCharCode()** | ASCII to string | ❌ No | String | `String.fromCharCode(65)` → 'A' |
| **substring()** | Extract portion | ❌ No | Substring | `"hello".substring(1,4)` → 'ell' |
| **slice()** | Extract (negative ok) | ❌ No | Substring | `"hello".slice(-3)` → 'llo' |
| **substr()** | Extract by length | ❌ No | Substring | `"hello".substr(1,3)` → 'ell' |
| **indexOf()** | Find position | ❌ No | Index/-1 | `"hello".indexOf('l')` → 2 |
| **lastIndexOf()** | Find last position | ❌ No | Index/-1 | `"hello".lastIndexOf('l')` → 3 |
| **includes()** | Contains substring? | ❌ No | true/false | `"hello".includes('ll')` → true |
| **startsWith()** | Starts with? | ❌ No | true/false | `"hello".startsWith('he')` → true |
| **endsWith()** | Ends with? | ❌ No | true/false | `"hello".endsWith('lo')` → true |
| **toUpperCase()** | All UPPERCASE | ❌ No | String | `"hello".toUpperCase()` → 'HELLO' |
| **toLowerCase()** | All lowercase | ❌ No | String | `"HELLO".toLowerCase()` → 'hello' |
| **trim()** | Remove spaces | ❌ No | String | `"  hi  ".trim()` → 'hi' |
| **trimStart()** | Remove start space | ❌ No | String | `"  hi  ".trimStart()` → 'hi  ' |
| **trimEnd()** | Remove end space | ❌ No | String | `"  hi  ".trimEnd()` → '  hi' |
| **repeat()** | Repeat string | ❌ No | String | `"ab".repeat(3)` → 'ababab' |
| **replace()** | Replace first | ❌ No | String | `"aa".replace('a','b')` → 'ba' |
| **replaceAll()** | Replace all | ❌ No | String | `"aa".replaceAll('a','b')` → 'bb' |
| **concat()** | Join strings | ❌ No | String | `"hello".concat(" ","world")` → 'hello world' |
| **padStart()** | Pad left side | ❌ No | String | `"5".padStart(3,'0')` → '005' |
| **padEnd()** | Pad right side | ❌ No | String | `"5".padEnd(3,'0')` → '500' |
| **match()** | Regex matches | ❌ No | Array/null | `"a1b2".match(/\d/g)` → ['1','2'] |
| **search()** | Regex position | ❌ No | Index/-1 | `"a1b2".search(/\d/)` → 1 |
| **length** | String length | - | Number | `"hello".length` → 5 |

***

### **NUMBER/TYPE CONVERSION - COMPLETE TABLE**

| Function | Purpose | Returns | Example |
|----------|---------|---------|---------|
| **parseInt()** | String to integer | Number | `parseInt("42")` → 42 |
| **parseFloat()** | String to decimal | Number | `parseFloat("3.14")` → 3.14 |
| **Number()** | Convert to number | Number | `Number("42")` → 42 |
| **String()** | Convert to string | String | `String(42)` → "42" |
| **Boolean()** | Convert to boolean | Boolean | `Boolean(1)` → true |
| **.toString()** | Value to string | String | `(42).toString()` → "42" |
| **.toFixed()** | Round to decimals | String | `(3.14159).toFixed(2)` → "3.14" |
| **typeof** | Type of value | String | `typeof 42` → "number" |

***

### **MATH FUNCTIONS - COMPLETE TABLE**

| Function | Purpose | Returns | Example |
|----------|---------|---------|---------|
| **Math.max()** | Largest number | Number | `Math.max(5,2,9)` → 9 |
| **Math.min()** | Smallest number | Number | `Math.min(5,2,9)` → 2 |
| **Math.abs()** | Absolute value | Number | `Math.abs(-5)` → 5 |
| **Math.floor()** | Round down | Number | `Math.floor(4.7)` → 4 |
| **Math.ceil()** | Round up | Number | `Math.ceil(4.2)` → 5 |
| **Math.round()** | Round nearest | Number | `Math.round(4.5)` → 4 |
| **Math.trunc()** | Remove decimals | Number | `Math.trunc(4.7)` → 4 |
| **Math.sqrt()** | Square root | Number | `Math.sqrt(16)` → 4 |
| **Math.pow()** | Power/exponent | Number | `Math.pow(2,3)` → 8 |
| **Math.random()** | Random 0-1 | Number | `Math.random()` → 0.234... |
| **Math.PI** | Pi constant | Number | `Math.PI` → 3.14159... |

***

### **OBJECT METHODS - COMPLETE TABLE**

| Function | Purpose | Mutating? | Returns | Example |
|----------|---------|-----------|---------|---------|
| **Object.keys()** | Get all keys | ❌ No | Array | `Object.keys({a:1,b:2})` → ['a','b'] |
| **Object.values()** | Get all values | ❌ No | Array | `Object.values({a:1,b:2})` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |
| **Object.entries()** | Get [key,val] pairs | ❌ No | Array | `Object.entries({a:1})` → [['a',1]] |
| **Object.assign()** | Copy/merge | ✅ Yes | Object | `Object.assign({},{a:1})` → {a:1} |

***

### **CONTROL FLOW & LOOPS - COMPLETE TABLE**

| Type | Syntax | Mutating? | Returns | Use Case |
|------|--------|-----------|---------|----------|
| **for** | `for(let i=0; i<n; i++)` | - | - | Index-based loop |
| **while** | `while(condition) {...}` | - | - | Conditional loop |
| **do...while** | `do{...}while(condition)` | - | - | At least once |
| **for...of** | `for(const val of arr)` | - | - | Iterate values |
| **for...in** | `for(const key in obj)` | - | - | Iterate keys |
| **forEach()** | `arr.forEach(fn)` | ❌ No | undefined | Function on each |
| **map()** | `arr.map(fn)` | ❌ No | New array | Transform each |
| **filter()** | `arr.filter(fn)` | ❌ No | New array | Keep matching |
| **reduce()** | `arr.reduce(fn, init)` | ❌ No | Single value | Combine all |

***

### **ADVANCED DATA STRUCTURES - COMPLETE TABLE**

| Type | Purpose | Key Methods | Mutating? | Example |
|------|---------|-------------|-----------|---------|
| **Set** | Unique values | `.add()`, `.delete()`, `.has()`, `.clear()` | ✅ Yes | `new Set([1,2,2,3])` → Set(3) |
| **Map** | Key-value pairs | `.set()`, `.get()`, `.delete()`, `.has()` | ✅ Yes | `new Map().set('a',1)` |
| **Object** | Key-value pairs | `.keys()`, `.values()`, `.entries()` | ✅ Yes | `{a: 1, b: 2}` |
| **Array** | Ordered list | All above | Mixed | `[1, 2, 3]` |

***

### **SPREAD & DESTRUCTURING - COMPLETE TABLE**

| Feature | Syntax | Mutating? | Returns | Example |
|---------|--------|-----------|---------|---------|
| **Spread (array)** | `[...arr]` | ❌ No | New array | `[...[1,2],[3]]` →  [namastedev](https://namastedev.com/namaste-dsa-sheet) |
| **Spread (object)** | `{...obj}` | ❌ No | New object | `{...{a:1},{b: