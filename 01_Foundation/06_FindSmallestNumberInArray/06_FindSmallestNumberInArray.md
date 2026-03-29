# 06. Find Smallest Number in an Array

Editorial Link: https://namastedev.com/blog/find-smallest-number-in-an-array/

## Pseudocode 🧠

```text
FUNCTION findSmallestNumber(array):
    IF array is empty:
        RETURN null / error
        
    INITIALIZE smallest = array[0]
    
    FOR EACH 'number' in array starting from index 1:
        IF number < smallest:
            UPDATE smallest = number
            
    RETURN smallest
```

## Detailed Notes 📝

### The Problem
You're given an array of numbers, and you need to iterate through it and determine the absolute smallest number present.

### Approach: Linear Scan (The Optimal Way)
- **Concept:** There's no magical way to know the smallest element in an unordered array without checking every single one. You start by assuming the first element is the smallest. Then, you simply scan across the array comparing each element to your 'smallest' tracker. If you find one smaller, that becomes the new 'smallest'.
- **Time Complexity:** O(N) where N is the length of the array. Every element is visited exactly once.
- **Space Complexity:** O(1). We only hold one variable in memory.

### Alternative (Less Optimal): Sorting
- **Concept:** Sort the array in ascending order, then return `array[0]`.
- **Time Complexity:** O(N log N) - Built-in sorting is much slower than a linear scan.
- **Space Complexity:** O(1) or O(log N) depending on the sort implementation. Not recommended simply because O(N) is trivial.

## Tips and Tricks for Interviews 💡
- **Empty Array Handling:** The most common mistake candidates make is assuming `array.length > 0`. Always check `if (!array || array.length === 0)` right at the start!
- **`Math.min()` in JavaScript:** In modern ES6+ JS, you can technically write `Math.min(...array)`. While concise and very readable, an interviewer will immediately ask you to "write it out from scratch without built-in operators" to test your loops. Mention the spread operator approach as a "shorthand in production", but write the loop.
- **Spread Operator Limits:** Be aware that `Math.min(...array)` can throw a "Maximum Call Stack Size Exceeded" error if the array has millions of elements because it unpacks them as arguments into the engine! The loop approach is much safer for huge data sets.
