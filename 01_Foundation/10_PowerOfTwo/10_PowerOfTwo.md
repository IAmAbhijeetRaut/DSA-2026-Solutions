# 10. Power of Two

Editorial Link: https://namastedev.com/blog/power-of-two/

## Pseudocode 🧠

```text
FUNCTION isPowerOfTwo(number):
    IF number <= 0:
        RETURN false
        
    WHILE number % 2 == 0:
        number = number / 2
        
    IF number == 1:
        RETURN true
    ELSE:
        RETURN false

// Alternative Bitwise approach (Fast O(1)):
FUNCTION isPowerOfTwoBitwise(number):
    RETURN number > 0 AND (number BITWISE-AND (number - 1)) == 0
```

## Detailed Notes 📝

### The Problem
Given an integer `n`, return `true` if it is a power of two. Otherwise, return `false`. An integer `n` is a power of two, if there exists an integer `x` such that `n == 2^x`. 

### Approach 1: Iterative Looping (The Safe approach)
- **Concept:** Keep dividing the number by 2 as long as it's cleanly even (`n % 2 === 0`). If at the end you hit precisely 1, then it was built entirely out of 2s! If it stops on any other odd number (like 3 or 5), then it is not.
- **Time Complexity:** O(log N) - Because you are dividing by 2 repeatedly.
- **Space Complexity:** O(1).

### Approach 2: Bit Manipulation (The Optimal approach)
- **Concept:** In binary, powers of two stand out wildly. They are always a 1 followed strictly by 0s (`2 is 10`, `4 is 100`, `8 is 1000`). If you subtract 1 from a power of two, the bits heavily flip (`7 is 0111`). If you run a Bitwise AND (`&`) on a power of two and itself minus 1 (`8 & 7` -> `1000 & 0111`), the result is strictly 0!
- **Time Complexity:** O(1).
- **Space Complexity:** O(1). 

## Tips and Tricks for Interviews 💡
- **Negative check:** Any negative number or Zero is NEVER a power of 2! (`2^-1` is 0.5, which is a fraction, not an integer!). Immediately write `if (n <= 0) return false;`.
- **The "Bitwise" flex:** Solving it with the loop first is mandatory to show you know basic iterations. But then adding "Wait, I can actually do this in O(1) Time using bits" will completely blow the interviewer away. Just write `return n > 0 && (n & (n - 1)) === 0;`. Don't forget the parentheses around `n - 1`!
- **JS specific Float limits:** Even though Javascript uses numbers as massive Floats under the hood, Bitwise operations truncate values down to 32-bit signed integers automatically! Keep this nuance in mind if an interviewer challenges JS constraints.
