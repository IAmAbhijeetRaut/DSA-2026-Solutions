# 09. Merge Sort

Editorial Link: https://namastedev.com/blog/merge-sort/

## Pseudocode 🧠

```text
// Main splitting function
FUNCTION mergeSort(array):
    IF length of array <= 1:
        RETURN array
        
    CALCULATE mid = floor(length of array / 2)
    CREATE leftHalf = mergeSort(array from 0 to mid)
    CREATE rightHalf = mergeSort(array from mid to end)
    
    RETURN merge(leftHalf, rightHalf)

// Helper merging function
FUNCTION merge(leftArray, rightArray):
    CREATE empty result array
    INITIALIZE pointer i = 0 (for leftArray)
    INITIALIZE pointer j = 0 (for rightArray)
    
    WHILE i < length of leftArray AND j < length of rightArray:
        IF leftArray[i] <= rightArray[j]:
            APPEND leftArray[i] to result
            INCREMENT i
        ELSE:
            APPEND rightArray[j] to result
            INCREMENT j
            
    // Add any remaining elements from both arrays
    APPEND rest of leftArray to result
    APPEND rest of rightArray to result
    
    RETURN result
```

## Detailed Notes 📝

### The Problem
Sort an array of numbers using the classical Merge Sort algorithm. 

### Approach: Divide and Conquer
- **Concept:** It's hard to sort 100 items at once. But if you have 1 item, it's already sorted! Merge Sort splits an array cleanly in half over and over until you have arrays of size 1. Then, you conceptually build them back up (merging). 
- **Merging logic:** Merging two individually sorted arrays `[1, 5]` and `[2, 3]` is incredibly fast (you just step two pointers across and pick the smaller). You merge the pairs back up the recursive tree until you finally get a fully sorted parent array.
- **Time Complexity:** O(N log N) - Standard in all cases (Worst, Base, Average). The splitting phase takes `log N` levels, and the merging phase inherently visits `N` elements to fuse them back together across every level.
- **Space Complexity:** O(N) - A major downside of Merge Sort is that it is NOT an "in-place" sort. We have to construct and return entirely new merged arrays all the way back up the recursive tree.

## Tips and Tricks for Interviews 💡
- **Stability:** Interviewers love asking "Is this a stable sort implementation?" (Stable means that matching duplicate items maintain their exact relative order). The answer is YES, so long as you use `<=` appropriately! `if (left[i] <= right[j])` ensures the left item goes in first, keeping it stable.
- **Merge Sort vs Quick Sort:** Quick Sort is often slightly faster on average but carries worst-case O(N²) limits. Merge Sort is the absolute king when stability is demanded, data sets are enormous, or if worst case performance O(N log N) is strictly guaranteed.
- **Arrays in JS:** Merging usually looks like creating an empty array and using `.push()`. You can elegantly handle the "rest of array" drops using JS spread (`...`) or `concat()` (`return result.concat(left.slice(i)).concat(right.slice(j))`) to write incredibly clean code!
