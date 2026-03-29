# 03. Palindrome Number

Editorial Link: https://namastedev.com/blog/check-if-a-number-is-a-palindrome/

## Pseudocode 🧠

```text
FUNCTION isPalindrome(number):
    IF number < 0:
        RETURN false (negative numbers are not palindromes due to the minus sign)
        
    INITIALIZE originalNumber = number
    INITIALIZE reversedNumber = 0
    
    WHILE number > 0:
        EXTRACT the last digit: lastDigit = number MODULO 10
        APPEND digit to reversed: reversedNumber = (reversedNumber * 10) + lastDigit
        REMOVE the last digit: number = number DIVIDED BY 10 (integer division)
        
    IF originalNumber EQUALS reversedNumber:
        RETURN true
    ELSE:
        RETURN false
```

## Detailed Notes 📝

### The Problem
Determine whether an integer is a palindrome. An integer is a palindrome when it reads the same backward as forward. (Example: `121` is a palindrome, `-121` is not because of the `-`, `10` is not).

### Approach 1: Convert to String
- **Concept:** Convert the number to a string, reverse the string, and compare it with the original string.
- **Time Complexity:** O(N), where N is the number of digits.
- **Space Complexity:** O(N), since you create a string representation of the number.

### Approach 2: Reversing the integer mathematically (Optimal)
- **Concept:** Reverse the number mathematically using modulo math (`%`) to fetch the last digit, and integer division (`Math.floor(x / 10)`) to drop the last digit. We build up a new number and compare it at the end.
- **Time Complexity:** O(log₁₀(N)) where N is the number itself (the loop runs for the number of digits in N).
- **Space Complexity:** O(1), no extra memory, just variables.

## Tips and Tricks for Interviews 💡
- **Negative Numbers:** This is a classic "gotcha". A negative number is NEVER a palindrome because the negative sign sits at the front. Filter these out on line 1!
- **Trailing Zeros:** A number that ends with `0` (and is not zero itself, like `10` or `120`) can never be a palindrome. You can easily filter these out fast (`x % 10 === 0 && x !== 0`).
- **Half Reversal Optimization:** You only actually need to reverse half of the digits to compare! When `reversedNumber >= remainingNumber`, you've hit the middle. This prevents potential integer overflow (though in JS numbers are floats, in statically typed languages like Java/C++, reversing a massive number could cause a 32-bit overflow error).
