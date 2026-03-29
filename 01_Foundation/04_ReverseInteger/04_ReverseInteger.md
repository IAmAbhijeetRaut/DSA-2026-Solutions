# 04. Reverse Integer

Editorial Link: https://namastedev.com/blog/reverse-digits-of-an-integer/

## Pseudocode 🧠

```text
FUNCTION reverseInteger(number):
    INITIALIZE isNegative = (number < 0)
    number = absolute value of number
    INITIALIZE reversedNumber = 0
    
    WHILE number > 0:
        EXTRACT lastDigit = number MODULO 10
        APPEND to reversedNumber = (reversedNumber * 10) + lastDigit
        REMOVE last digit from number: number = integer division(number / 10)
        
    IF isNegative:
        reversedNumber = reversedNumber * -1
        
    IF reversedNumber is outside the 32-bit signed integer range:
        RETURN 0
        
    RETURN reversedNumber
```

## Detailed Notes 📝

### The Problem
Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to go outside the signed 32-bit integer range `[-2^31, 2^31 - 1]`, then return 0.

### Approach: Mathematical Build Up
- **Concept:** Much like Palindrome Number, use Modulo (`% 10`) to slice off the tail digit, and use multiplication (`* 10`) to shift your new number over so you can add it. 
- **Handling negatives:** Check if it's negative right away, store a flag, run math on the absolute value `Math.abs(x)`, and multiply the final result by -1.
- **Time Complexity:** O(log₁₀(x)), because there are roughly log₁₀(x) digits in x.
- **Space Complexity:** O(1).

### Javascript Caveats
JavaScript uses 64-bit floating point numbers for everything. However, Leetcode and traditional environments enforce a 32-bit bound limit restriction: `[-2³¹, 2³¹ - 1]`. Therefore, you MUST add an explicit check before returning.
```javascript
const LIMIT = Math.pow(2, 31);
if (reversed < -LIMIT || reversed >= LIMIT) return 0;
```

## Tips and Tricks for Interviews 💡
- **Integer Limits:** If you're interviewing in C++ or Java, `reversed * 10 + digit` can natively throw an overflow exception before you can even check the condition! Interviewers love seeing you address this. You protect against overflow BEFORE multiplying by checking `if (reversed > INT_MAX / 10)`. (Fortunately, JS floats won't crash on you here, but mention it to show depth!)
- **`Math.trunc()` over `Math.floor()`:** If you don't use absolute values, be careful with negative integer division in JS. `-12.3` with `Math.floor` becomes `-13`! `Math.trunc(-12.3)` simply chops the decimal and leaves `-12`, mimicking standard static integer divisions from C++/Java.
