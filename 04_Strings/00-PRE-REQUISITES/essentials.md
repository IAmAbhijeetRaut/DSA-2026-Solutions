## 1. Strings in JavaScript — How They Actually Work

A string is a sequence of characters. In JavaScript, strings are **immutable** — you cannot change a character in place. Every "modification" creates a brand new string.

```javascript
const s = "hello";
s[0] = "H";          // DOES NOTHING. No error, no change.
console.log(s);      // "hello" — unchanged

// To "change" a string, you must create a new one:
const s2 = "H" + s.slice(1);
console.log(s2);     // "Hello"
```

**Why this matters for DSA:**
Every time you do `str += char` inside a loop, JavaScript creates a **new string** every iteration. For `n` iterations, this is **O(n²)** total work because each new string must copy all previous characters.

```javascript
// BAD — O(n²)
let result = "";
for (let i = 0; i < n; i++) {
    result += chars[i];   // copies entire result each time
}

// GOOD — O(n)
const parts = [];
for (let i = 0; i < n; i++) {
    parts.push(chars[i]);
}
const result = parts.join("");
```

---

## 2. Accessing Characters

```javascript
const s = "hello";

// By index (O(1)):
s[0];              // "h"
s[4];              // "o"
s[10];             // undefined (out of bounds, no error)
s.charAt(0);       // "h"
s.charAt(10);      // "" (empty string, not undefined)

// ASCII code:
s.charCodeAt(0);   // 104 (the numeric code for 'h')

// Character from code:
String.fromCharCode(104);   // "h"
String.fromCharCode(65);    // "A"
String.fromCharCode(97);    // "a"
```

**ASCII reference (memorise these ranges):**
```text
'0' = 48   ...   '9' = 57       ← digits
'A' = 65   ...   'Z' = 90       ← uppercase
'a' = 97   ...   'z' = 122      ← lowercase

Useful:
'a'.charCodeAt(0) - 97 = 0      ← gives index 0–25 for frequency arrays
'z'.charCodeAt(0) - 97 = 25
```

---

## 3. Essential String Methods — Complete Reference

### 3.1 Length

```javascript
"hello".length;    // 5
"".length;         // 0
```

### 3.2 Searching

```javascript
const s = "hello world hello";

// indexOf — first occurrence, returns index or -1
s.indexOf("hello");           // 0
s.indexOf("world");           // 6
s.indexOf("xyz");             // -1
s.indexOf("hello", 1);        // 12  (search from index 1)

// lastIndexOf — last occurrence
s.lastIndexOf("hello");       // 12

// includes — boolean check
s.includes("world");          // true
s.includes("xyz");            // false

// startsWith / endsWith
s.startsWith("hello");        // true
s.endsWith("hello");          // true
s.startsWith("world", 6);     // true (from position 6)

// search — regex search, returns index or -1
s.search(/\d+/);              // -1 (no digits)
"abc123".search(/\d+/);       // 3
```

### 3.3 Extracting

```javascript
const s = "hello world";

// slice(start, end) — end is exclusive, supports negatives
s.slice(0, 5);     // "hello"
s.slice(6);        // "world"
s.slice(-5);       // "world" (last 5 characters)
s.slice(-5, -2);   // "wor"

// substring(start, end) — like slice but no negatives, swaps if start > end
s.substring(0, 5); // "hello"
s.substring(5, 0); // "hello" (swapped automatically)
```

### 3.4 Transforming

```javascript
// Case
"Hello".toUpperCase();    // "HELLO"
"Hello".toLowerCase();    // "hello"

// Trim
"  hi  ".trim();          // "hi"
"  hi  ".trimStart();     // "hi  "
"  hi  ".trimEnd();       // "  hi"

// Repeat
"ab".repeat(3);           // "ababab"

// Pad
"5".padStart(3, "0");     // "005"
"5".padEnd(3, "0");       // "500"

// Replace
"aab".replace("a", "x");       // "xab"  (first only)
"aab".replaceAll("a", "x");    // "xxb"  (all)
```

### 3.5 Splitting and Joining

```javascript
// split — string to array
"a-b-c".split("-");       // ["a", "b", "c"]
"hello".split("");         // ["h", "e", "l", "l", "o"]
"a,b,c,d".split(",", 2);  // ["a", "b"]  (limit)

// join — array to string (Array method, not String)
["a", "b", "c"].join("-"); // "a-b-c"
["h","e","l","l","o"].join(""); // "hello"
```

### 3.6 Regex Matching

```javascript
"hello123world456".match(/\d+/g);    // ["123", "456"]
"hello123".match(/\d+/);             // ["123"]  (first match)
"abc".match(/\d+/);                  // null
```

### 3.7 Comparison

```javascript
// === compares content (not reference like Java)
"abc" === "abc";       // true

// < > compares lexicographically (character code by character code)
"a" < "b";             // true  (97 < 98)
"abc" < "abd";         // true
"abc" < "ab";          // false (longer string is "greater" when prefix matches up to shorter length)
"Z" < "a";             // true  (90 < 97 — uppercase comes BEFORE lowercase!)
```

---

## 4. Converting Between Strings and Arrays

Strings are immutable. Arrays are mutable. Many DSA problems require converting between them.

```javascript
// String → Array
const arr = "hello".split("");          // ["h", "e", "l", "l", "o"]
const arr2 = Array.from("hello");       // ["h", "e", "l", "l", "o"]
const arr3 = [..."hello"];              // ["h", "e", "l", "l", "o"]

// Array → String
arr.join("");                           // "hello"

// Why convert? To modify in-place:
const chars = "hello".split("");
chars[0] = "H";
const result = chars.join("");          // "Hello"
```

---

## 5. Time Complexity of String Operations

| Operation | Time | Notes |
|---|---|---|
| `s[i]`, `s.charAt(i)` | O(1) | Direct access |
| `s.length` | O(1) | Stored property |
| `s.indexOf(sub)` | O(n·m) | n = string length, m = substring length |
| `s.includes(sub)` | O(n·m) | Same as indexOf |
| `s.slice(i, j)` | O(j - i) | Creates new string of that length |
| `s.split(sep)` | O(n) | Scans entire string |
| `s + t` | O(n + m) | Copies both strings into new one |
| `s += char` (in loop) | O(n²) total | Each iteration copies entire string |
| `arr.join("")` | O(n) | Single pass to concatenate |
| `s.toUpperCase()` | O(n) | New string, scans all chars |
| `s.replace(a, b)` | O(n) | Scans for match |
| `s === t` | O(n) | Worst case: compare all characters |

---

## 6. Pattern 1: Frequency Counting

The single most important technique for string DSA problems. Count how many times each character appears.

### 6.1 Using a Map

```javascript
function charFrequency(s) {
    const freq = new Map();
    for (const ch of s) {
        freq.set(ch, (freq.get(ch) || 0) + 1);
    }
    return freq;
}

charFrequency("aabbc");
// Map { 'a' => 2, 'b' => 2, 'c' => 1 }
```

### 6.2 Using an Array of Size 26 (lowercase only)

Faster than Map. Use when the problem says "lowercase English letters only."

```javascript
function charFrequency(s) {
    const freq = new Array(26).fill(0);
    for (const ch of s) {
        freq[ch.charCodeAt(0) - 97]++;   // 'a'=0, 'b'=1, ..., 'z'=25
    }
    return freq;
}

charFrequency("aabbc");
// [2, 2, 1, 0, 0, 0, ... 0]  (index 0=a has 2, index 1=b has 2, etc.)
```

### 6.3 Visualization — Frequency Array

```text
Input: "banana"

Index:  0  1  2  3  4  5  6  7  ... 24 25
Letter: a  b  c  d  e  f  g  h  ...  y  z
Count: [3, 1, 0, 0, 0, 0, 0, 0, ...  0, 0]
             ↑                    
             'b' appears once
        ↑
        'a' appears three times

How: 'b'.charCodeAt(0) = 98
     98 - 97 = 1 → freq[1]++
```

### 6.4 Problems That Use Frequency Counting

| Problem | How Frequency Counting Helps |
|---|---|
| Valid Anagram | Two strings are anagrams if they have identical frequency arrays |
| Group Anagrams | Sort each word (or build frequency key) → group by key |
| First Non-Repeating Char | Find first char with `freq[ch] === 1` |
| Most Frequent Vowel/Consonant | Count frequencies, filter by vowel/consonant, take max |
| Jewels and Stones | Put jewels in a Set, count how many stones are jewels |

---

## 7. Pattern 2: Two Pointers on Strings

Use two index variables (`left` and `right`) to process a string from both ends inward, or two pointers moving in the same direction.

### 7.1 Palindrome Check

A palindrome reads the same forwards and backwards.

```javascript
function isPalindrome(s) {
    let left = 0;
    let right = s.length - 1;

    while (left < right) {
        if (s[left] !== s[right]) return false;
        left++;
        right--;
    }
    return true;
}
```

**Visualization:**
```text
Input: "racecar"

Step 0:  left=0('r')  right=6('r')  →  match ✓
         r a c e c a r
         ↑           ↑

Step 1:  left=1('a')  right=5('a')  →  match ✓
         r a c e c a r
           ↑       ↑

Step 2:  left=2('c')  right=4('c')  →  match ✓
         r a c e c a r
             ↑   ↑

Step 3:  left=3  right=3  →  left >= right → STOP → true
```

### 7.2 Valid Palindrome (with cleanup — LeetCode style)

Problems often say: "Consider only alphanumeric characters, ignore case."

```javascript
function isPalindrome(s) {
    const clean = s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    let left = 0;
    let right = clean.length - 1;

    while (left < right) {
        if (clean[left] !== clean[right]) return false;
        left++;
        right--;
    }
    return true;
}

isPalindrome("A man, a plan, a canal: Panama");  // true
```

### 7.3 Reverse String (in-place on array)

```javascript
function reverseString(chars) {
    let left = 0;
    let right = chars.length - 1;

    while (left < right) {
        [chars[left], chars[right]] = [chars[right], chars[left]];  // swap
        left++;
        right--;
    }
}

const arr = ["h", "e", "l", "l", "o"];
reverseString(arr);
console.log(arr);   // ["o", "l", "l", "e", "h"]
```

**Visualization:**
```text
Step 0:  [h, e, l, l, o]     left=0  right=4  → swap h↔o
Step 1:  [o, e, l, l, h]     left=1  right=3  → swap e↔l
Step 2:  [o, l, l, e, h]     left=2  right=2  → STOP
```

### 7.4 Reverse String II (every 2k characters, reverse first k)

```javascript
function reverseStr(s, k) {
    const arr = s.split("");

    for (let i = 0; i < arr.length; i += 2 * k) {
        let left = i;
        let right = Math.min(i + k - 1, arr.length - 1);

        while (left < right) {
            [arr[left], arr[right]] = [arr[right], arr[left]];
            left++;
            right--;
        }
    }
    return arr.join("");
}

reverseStr("abcdefg", 2);   // "bacdfeg"
```

**Visualization:**
```text
s = "abcdefg", k = 2, so 2k = 4

Chunk [0..3]: "abcd" → reverse first k=2 chars → "bacd"
Chunk [4..6]: "efg"  → reverse first k=2 chars → "feg"

Result: "ba" + "cd" + "fe" + "g" = "bacdfeg"
```

---

## 8. Pattern 3: Sliding Window

A window is a range `[left, right]` that slides across the string. Used for substring problems.

### 8.1 Fixed-Size Window

```javascript
// Find max sum of any k consecutive characters (as digits)
function maxSumOfKDigits(s, k) {
    let windowSum = 0;

    // Build first window
    for (let i = 0; i < k; i++) {
        windowSum += Number(s[i]);
    }

    let maxSum = windowSum;

    // Slide the window
    for (let i = k; i < s.length; i++) {
        windowSum += Number(s[i]);       // add new right
        windowSum -= Number(s[i - k]);   // remove old left
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}
```

**Visualization:**
```text
s = "21354", k = 3

Window [0..2]: "213" → sum = 6          max = 6
Window [1..3]: "135" → sum = 6-2+5 = 9  max = 9
Window [2..4]: "354" → sum = 9-1+4 = 12 max = 12

          Slide →
         [2 1 3] 5 4     sum = 6
          2[1 3 5]4       sum = 9
          2 1[3 5 4]      sum = 12
```

### 8.2 Variable-Size Window — Longest Substring Without Repeating Characters

```javascript
function lengthOfLongestSubstring(s) {
    const seen = new Map();   // char → last index
    let left = 0;
    let maxLen = 0;

    for (let right = 0; right < s.length; right++) {
        if (seen.has(s[right]) && seen.get(s[right]) >= left) {
            left = seen.get(s[right]) + 1;   // shrink window
        }
        seen.set(s[right], right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}

lengthOfLongestSubstring("abcabcbb");   // 3 ("abc")
```

**Visualization:**
```text
s = "abcabcbb"

right=0: 'a' → window="a"     maxLen=1   seen={a:0}
right=1: 'b' → window="ab"    maxLen=2   seen={a:0, b:1}
right=2: 'c' → window="abc"   maxLen=3   seen={a:0, b:1, c:2}
right=3: 'a' → duplicate! left = 0+1 = 1
               window="bca"   maxLen=3   seen={a:3, b:1, c:2}
right=4: 'b' → duplicate! left = 1+1 = 2
               window="cab"   maxLen=3   seen={a:3, b:4, c:2}
right=5: 'c' → duplicate! left = 2+1 = 3
               window="abc"   maxLen=3   seen={a:3, b:4, c:5}
right=6: 'b' → duplicate! left = 4+1 = 5
               window="cb"    maxLen=3   seen={a:3, b:6, c:5}
right=7: 'b' → duplicate! left = 6+1 = 7
               window="b"     maxLen=3   seen={a:3, b:7, c:5}

Result: 3
```

---

## 9. Pattern 4: Hash Map for String Matching

### 9.1 Valid Anagram

Two strings are anagrams if they have the same characters in the same quantities.

```javascript
function isAnagram(s, t) {
    if (s.length !== t.length) return false;

    const freq = new Array(26).fill(0);

    for (let i = 0; i < s.length; i++) {
        freq[s.charCodeAt(i) - 97]++;   // increment for s
        freq[t.charCodeAt(i) - 97]--;   // decrement for t
    }

    return freq.every(count => count === 0);
}

isAnagram("anagram", "nagaram");   // true
isAnagram("rat", "car");           // false
```

**Visualization:**
```text
s = "anagram"    t = "nagaram"

Processing each character pair:
  s[0]='a' +1, t[0]='n' -1  →  freq[a]=+1, freq[n]=-1
  s[1]='n' +1, t[1]='a' -1  →  freq[a]=0,  freq[n]=0
  s[2]='a' +1, t[2]='g' -1  →  freq[a]=+1, freq[g]=-1
  s[3]='g' +1, t[3]='a' -1  →  freq[a]=0,  freq[g]=0
  s[4]='r' +1, t[4]='r' -1  →  freq[r]=0
  s[5]='a' +1, t[5]='a' -1  →  freq[a]=0
  s[6]='m' +1, t[6]='m' -1  →  freq[m]=0

All zeros → true (anagram!)
```

### 9.2 Group Anagrams

Group words that are anagrams of each other.

**Approach 1: Sorted Key**
```javascript
function groupAnagrams(strs) {
    const map = new Map();

    for (const word of strs) {
        const key = word.split("").sort().join("");   // "eat" → "aet"
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(word);
    }

    return Array.from(map.values());
}

groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]);
// [["eat","tea","ate"], ["tan","nat"], ["bat"]]
```

**Approach 2: Frequency Key (faster, no sorting)**
```javascript
function groupAnagrams(strs) {
    const map = new Map();

    for (const word of strs) {
        const count = new Array(26).fill(0);
        for (const ch of word) {
            count[ch.charCodeAt(0) - 97]++;
        }
        const key = count.join("#");   // "1#0#0#0#1#0#..." unique per anagram group
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(word);
    }

    return Array.from(map.values());
}
```

**Visualization — Sorted Key approach:**
```text
Input: ["eat", "tea", "tan", "ate", "nat", "bat"]

"eat" → sort → "aet"  →  map["aet"] = ["eat"]
"tea" → sort → "aet"  →  map["aet"] = ["eat", "tea"]
"tan" → sort → "ant"  →  map["ant"] = ["tan"]
"ate" → sort → "aet"  →  map["aet"] = ["eat", "tea", "ate"]
"nat" → sort → "ant"  →  map["ant"] = ["tan", "nat"]
"bat" → sort → "abt"  →  map["abt"] = ["bat"]

Result: [["eat","tea","ate"], ["tan","nat"], ["bat"]]
```

### 9.3 Isomorphic Strings

Two strings are isomorphic if characters in `s` can be mapped to characters in `t` one-to-one.

```javascript
function isIsomorphic(s, t) {
    if (s.length !== t.length) return false;

    const mapST = new Map();   // s → t
    const mapTS = new Map();   // t → s

    for (let i = 0; i < s.length; i++) {
        const cs = s[i];
        const ct = t[i];

        if (mapST.has(cs) && mapST.get(cs) !== ct) return false;
        if (mapTS.has(ct) && mapTS.get(ct) !== cs) return false;

        mapST.set(cs, ct);
        mapTS.set(ct, cs);
    }
    return true;
}

isIsomorphic("egg", "add");    // true  (e→a, g→d)
isIsomorphic("foo", "bar");    // false (o→a, but o→r? conflict)
```

**Visualization:**
```text
s = "egg"    t = "add"

i=0:  s='e'  t='a'  →  mapST: {e→a}  mapTS: {a→e}   ✓
i=1:  s='g'  t='d'  →  mapST: {e→a, g→d}  mapTS: {a→e, d→g}   ✓
i=2:  s='g'  t='d'  →  mapST[g]=d ✓  mapTS[d]=g ✓   ✓

All match → true

---

s = "foo"    t = "bar"

i=0:  s='f'  t='b'  →  mapST: {f→b}  mapTS: {b→f}   ✓
i=1:  s='o'  t='a'  →  mapST: {f→b, o→a}  mapTS: {b→f, a→o}   ✓
i=2:  s='o'  t='r'  →  mapST[o]=a, but t='r' ≠ 'a'  → false ✗
```

### 9.4 Jewels and Stones

```javascript
function numJewelsInStones(jewels, stones) {
    const jewelSet = new Set(jewels);
    let count = 0;
    for (const s of stones) {
        if (jewelSet.has(s)) count++;
    }
    return count;
}

numJewelsInStones("aA", "aAAbbbb");   // 3
```

---

## 10. Pattern 5: String Comparison / Prefix Matching

### 10.1 Longest Common Prefix

**Approach 1: Vertical Scanning (most intuitive)**

Compare characters column by column across all strings.

```javascript
function longestCommonPrefix(strs) {
    if (strs.length === 0) return "";

    for (let col = 0; col < strs[0].length; col++) {
        const ch = strs[0][col];
        for (let row = 1; row < strs.length; row++) {
            if (col >= strs[row].length || strs[row][col] !== ch) {
                return strs[0].slice(0, col);
            }
        }
    }
    return strs[0];
}

longestCommonPrefix(["flower", "flow", "flight"]);   // "fl"
```

**Visualization:**
```text
strs = ["flower", "flow", "flight"]

col=0:  f  f  f  →  all match ✓
col=1:  l  l  l  →  all match ✓
col=2:  o  o  i  →  mismatch ✗ → return "fl"
```

**Approach 2: Sort and Compare First/Last**

```javascript
function longestCommonPrefix(strs) {
    if (strs.length === 0) return "";
    strs.sort();

    const first = strs[0];
    const last = strs[strs.length - 1];
    let i = 0;

    while (i < first.length && first[i] === last[i]) {
        i++;
    }
    return first.slice(0, i);
}
```

```text
After sorting: ["flight", "flow", "flower"]
                  first              last

Compare "flight" vs "flower":
  f === f ✓
  l === l ✓
  i !== o ✗ → return "fl"
```

### 10.2 Length of Last Word

```javascript
function lengthOfLastWord(s) {
    let length = 0;
    let i = s.length - 1;

    // Skip trailing spaces
    while (i >= 0 && s[i] === " ") i--;

    // Count characters of last word
    while (i >= 0 && s[i] !== " ") {
        length++;
        i--;
    }

    return length;
}

lengthOfLastWord("Hello World");      // 5
lengthOfLastWord("   fly me   ");     // 2
```

### 10.3 Find Words Containing Character

```javascript
function findWordsContaining(words, x) {
    const result = [];
    for (let i = 0; i < words.length; i++) {
        if (words[i].includes(x)) {
            result.push(i);
        }
    }
    return result;
}

findWordsContaining(["leet", "code"], "e");   // [0, 1]
findWordsContaining(["abc", "bcd", "aaaa", "cbc"], "a");  // [0, 2]
```

---

## 11. Pattern 6: Balanced / Counting Pattern

### 11.1 Split a String in Balanced Strings

```javascript
function balancedStringSplit(s) {
    let count = 0;
    let balance = 0;

    for (const ch of s) {
        if (ch === "R") balance++;
        else balance--;         // 'L'

        if (balance === 0) count++;   // balanced substring found
    }
    return count;
}

balancedStringSplit("RLRRLLRLRL");   // 4
```

**Visualization:**
```text
s = "RLRRLLRLRL"

R → balance=+1
L → balance= 0 → count=1 ✓  (found "RL")
R → balance=+1
R → balance=+2
L → balance=+1
L → balance= 0 → count=2 ✓  (found "RRLL")
R → balance=+1
L → balance= 0 → count=3 ✓  (found "RL")
R → balance=+1
L → balance= 0 → count=4 ✓  (found "RL")

Result: 4
```

---

## 12. Pattern 7: Greedy on Strings

### 12.1 Largest Odd Number in String

The trick: a number is odd if its **last digit** is odd. Scan from the right.

```javascript
function largestOddNumber(num) {
    for (let i = num.length - 1; i >= 0; i--) {
        if (Number(num[i]) % 2 !== 0) {
            return num.slice(0, i + 1);
        }
    }
    return "";
}

largestOddNumber("52");     // "5"
largestOddNumber("4206");   // ""
largestOddNumber("35427");  // "35427"
```

**Visualization:**
```text
num = "52"

Scan from right:
  i=1: '2' → even → skip
  i=0: '5' → odd! → return "52".slice(0, 1) = "5"
```

---

## 13. Vowels and Consonants — Quick Reference

```javascript
const VOWELS = new Set(["a", "e", "i", "o", "u"]);

function isVowel(ch) {
    return VOWELS.has(ch.toLowerCase());
}

function isConsonant(ch) {
    const lower = ch.toLowerCase();
    return lower >= "a" && lower <= "z" && !VOWELS.has(lower);
}
```

### 13.1 Find Most Frequent Vowel and Consonant

```javascript
function findMostFrequent(s) {
    const vowels = new Set("aeiou");
    const vFreq = new Map();
    const cFreq = new Map();

    for (const ch of s.toLowerCase()) {
        if (ch < "a" || ch > "z") continue;   // skip non-letters

        if (vowels.has(ch)) {
            vFreq.set(ch, (vFreq.get(ch) || 0) + 1);
        } else {
            cFreq.set(ch, (cFreq.get(ch) || 0) + 1);
        }
    }

    let maxVowel = "", maxVCount = 0;
    for (const [ch, count] of vFreq) {
        if (count > maxVCount) { maxVowel = ch; maxVCount = count; }
    }

    let maxCons = "", maxCCount = 0;
    for (const [ch, count] of cFreq) {
        if (count > maxCCount) { maxCons = ch; maxCCount = count; }
    }

    return { vowel: maxVowel, consonant: maxCons };
}
```

---

## 14. Edge Cases Checklist

Always check these in string problems:

| Edge Case | Example | How to Handle |
|---|---|---|
| Empty string | `""` | Return `""`, `0`, `true`, or `[]` as appropriate |
| Single character | `"a"` | Often a valid palindrome, trivial prefix, etc. |
| All same characters | `"aaaa"` | Frequency = 1 type, longest substring = 1. |
| All spaces | `"    "` | `trim()` gives `""`, length of last word = 0 |
| Case sensitivity | `"A" vs "a"` | Normalise with `.toLowerCase()` if problem says ignore case |
| Non-alphanumeric | `"A man, a plan"` | Clean with `.replace(/[^a-zA-Z0-9]/g, "")` |
| Unicode / special chars | `"café"` | Use `codePointAt()` instead of `charCodeAt()` |

---

## 15. Time Complexity — All Patterns

| Pattern | Time | Space | When to Use |
|---|---|---|---|
| Frequency Array (26) | O(n) | O(1) | Lowercase English letters only |
| Frequency Map | O(n) | O(k) | Any character set, k = unique chars |
| Two Pointers | O(n) | O(1) | Palindrome, reverse, comparing ends |
| Sliding Window (fixed) | O(n) | O(1) | Fixed-size substring problems |
| Sliding Window (variable) | O(n) | O(k) | Longest/shortest substring with constraint |
| Sorting + Compare | O(n log n) | O(n) | Anagram grouping, prefix finding |
| Brute Force (all substrings) | O(n²) or O(n³) | varies | Avoid this! Use a pattern above instead |

---

## 16. Quick Reference — All Problems Mapped to Patterns

| # | Problem | Pattern | Key Technique |
|---|---|---|---|
| 01 | Length of Last Word | Scan from right | Trim trailing spaces, count until space |
| 02 | Find Words Containing Character | Linear scan | `includes()` or `indexOf()` |
| 03 | Jewels and Stones | Hash Set | Put jewels in Set, count matches in stones |
| 04 | Most Frequent Vowel and Consonant | Frequency Map | Separate vowel/consonant counts, take max |
| 05 | Split Balanced Strings | Counter / Balance | Increment R, decrement L, count when balance=0 |
| 06 | Reverse String II | Two Pointers | Reverse first k in every 2k chunk |
| 07 | Valid Palindrome | Two Pointers | Clean string, compare from both ends |
| 08 | Largest Odd Number in String | Greedy (right scan) | Find rightmost odd digit, slice |
| 09 | Longest Common Prefix | Vertical Scan / Sort | Compare column-by-column or sort + compare first/last |
| 10 | Valid Anagram | Frequency Array | Count chars in both, compare arrays |
| 11 | Isomorphic Strings | Bidirectional Map | Two maps (s→t and t→s), check consistency |
| 12 | Group Anagrams | Sorted Key / Freq Key | Sort each word as key, or frequency signature as key |
