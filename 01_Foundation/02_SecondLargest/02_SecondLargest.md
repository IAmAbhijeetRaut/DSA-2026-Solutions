# 02. Second Largest Number

Editorial Link: https://namastedev.com/blog/find-the-secondlargestnumber/

## Pseudocode 🧠

```text
FUNCTION findSecondLargest(array):
    IF array has less than 2 elements:
        RETURN null / error
        
    INITIALIZE largest as negative infinity
    INITIALIZE secondLargest as negative infinity
    
    FOR EACH 'number' in array:
        IF number > largest:
            UPDATE secondLargest = largest
            UPDATE largest = number
        ELSE IF number > secondLargest AND number is not equal to largest:
            UPDATE secondLargest = number
            
    IF secondLargest is still negative infinity:
        RETURN indication that no second largest exists
        
    RETURN secondLargest
```

## Detailed Notes 📝

### The Problem
You need to return the second largest element from an array of integers. Note that duplicates might exist (e.g. `[10, 10, 10]` has no second largest, while `[10, 5, 10]` has 5 as the second largest).

### Approach 1: Sorting (The easy way)
- **Concept:** Sort the array in descending order. Then traverse it to find the first element that is strictly less than the first element (the largest).
- **Time Complexity:** O(N log N) - Because of sorting.
- **Space Complexity:** Varies based on sorting algorithms but generally O(1) or O(log N).

### Approach 2: One-Pass Traversal (The optimal way)
- **Concept:** Keep track of both the `largest` and `secondLargest` numbers simultaneously as you loop through the array exactly once.
- **Time Complexity:** O(N) - We only look at each element exactly once.
- **Space Complexity:** O(1) - We only need two variables to keep track.

### State Transitions
When looking at the current number:
1. Is it bigger than `largest`? It takes the throne! The old `largest` becomes the `secondLargest`.
2. Is it smaller than `largest` but bigger than `secondLargest`? It becomes the new `secondLargest`.
3. If it equals `largest`, do nothing (to handle duplicates cleanly).

## Tips and Tricks for Interviews 💡
- **Clarification:** Always ask the interviewer: "What should I return if all elements are the same?" or "What if the array length is 1 or 0?"
- **JavaScript `Infinity`:** Use `-Infinity` to initialize your tracker variables securely. `Number.MIN_SAFE_INTEGER` is also great if you know inputs are restricted to standard integer bounds.
- **Code Readability:** Showing the one-pass approach indicates strong foundational understanding of state tracking without relying on built-in library sorting overhead.
