# 08. Binary Search

Editorial Link: https://namastedev.com/blog/binary-search/

## Pseudocode 🧠

```text
FUNCTION binarySearch(array, target):
    INITIALIZE left = 0
    INITIALIZE right = length of array - 1
    
    WHILE left <= right:
        CALCULATE mid = left + floor((right - left) / 2)
        
        IF array[mid] EQUALS target:
            RETURN mid
        ELSE IF array[mid] < target:
            left = mid + 1      // Target sits to the right
        ELSE:
            right = mid - 1     // Target sits to the left
            
    RETURN -1 // Target not found
```

## Detailed Notes 📝

### The Problem
Given an array of integers `nums` which is **sorted in ascending order**, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.

### Approach: The Binary Search (Divide and Conquer)
- **Concept:** Imagine guessing a number between 1 and 100. If you guess 50 and they say "Higher", you immediately eliminate 1-50! You just cut the search space in half. Binary search does exactly this. By jumping to the middle `(left + right) / 2`, you can completely ignore half of the array over and over until you narrow it down to the exact position.
- **Time Complexity:** O(log N) - Because each check divides the array in half, this is incredibly fast. Finding a number in an array of 4 Billion elements would only take a maximum of 32 checks!
- **Space Complexity:** O(1) for the iterative approach. If done recursively, it would be O(log N) space complexity for the call stack. Always default to Iterative!

### Iterative vs Recursive
While recursive is cleaner to look at, iterative is strictly better for memory bounds (No Call Stack Overflow risks). Stick to the `while (left <= right)` block!

## Tips and Tricks for Interviews 💡
- **The Midpoint Trap:** Many candidates write `mid = (left + right) / 2`. While this works 99% of the time, in statically typed languages like Java/C++, a massive `left` and `right` can cause `left + right` to overflow the integer maximum bound! Always write `mid = left + Math.floor((right - left) / 2)` to show Senior-level caution!
- **Off-By-One Errors:** Binary search is notorious for infinite loops. Remember strictly: 
    - `while(left <= right)` (Must have `equals` to catch the single-element case).
    - `left = mid + 1` and `right = mid - 1`. Changing exactly `mid` shifts the pointers cleanly past the already-checked midpoint!
- **Pointers:** Left and Right are **INCLUSIVE** index bounds.
