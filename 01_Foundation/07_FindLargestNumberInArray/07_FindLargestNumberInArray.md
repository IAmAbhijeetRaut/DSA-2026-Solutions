# 07. Find Largest Number in an Array

Editorial Link: https://namastedev.com/blog/find-largest-number-in-an-array/

## Pseudocode 🧠

```text
FUNCTION findLargestNumber(array):
    IF array is empty:
        RETURN null / error
        
    INITIALIZE largest = array[0]
    
    FOR EACH 'number' in array starting from index 1:
        IF number > largest:
            UPDATE largest = number
            
    RETURN largest
```

## Detailed Notes 📝

### The Problem
You're given an array of numbers, and you need to iterate through it and determine the absolute largest number present. It's the exact mirror counter-part to finding the smallest number.

### Approach: Linear Scan (The Optimal Way)
- **Concept:** Start by blindly assuming the first element is the largest. Then, scan across the rest of the array. Compare each element to your 'largest' tracker. If you find one bigger, update the tracker.
- **Time Complexity:** O(N) where N is the length of the array. Every element requires one comparison.
- **Space Complexity:** O(1). Only a single state tracker variable is used.

### Alternative (Less Optimal): Sorting
- **Concept:** Sort the array in descending order, then return `array[0]`.
- **Time Complexity:** O(N log N) - Avoid this unless you already needed the array sorted for a different reason!
- **Space Complexity:** O(1) or O(log N) depending on the environment sort.

## Tips and Tricks for Interviews 💡
- **Data Limits:** In JS, numbers lose precision beyond `Number.MAX_SAFE_INTEGER` (`2^53 - 1`). If the interviewer says the numbers might be larger than this, you will need to mention `BigInt`!
- **Initialization Trap:** When initializing `largest`, do not initialize it as `0`! If the array holds purely negative numbers (like `[-10, -50, -3]`), `0` will erroneously be returned. Either initialize it as `array[0]` (safest if array is not empty) or `Number.NEGATIVE_INFINITY`.
- **`Math.max()` with caution:** Like `Math.min()`, you can definitely use `Math.max(...array)` in real life JS code, but be prepared to explain the `O(N)` implementation loop because that's what the hiring manager is actually evaluating.
