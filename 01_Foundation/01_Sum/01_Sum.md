# 01. Two Sum

Editorial Link: https://namastedev.com/blog/sum_two/

## Pseudocode 🧠

```text
FUNCTION twoSum(array, target):
    CREATE an empty dictionary/hash map called 'seen'
    
    FOR EACH index 'i' and 'number' in the array:
        CALCULATE the 'difference' = target - number
        
        IF 'difference' exists in 'seen':
            RETURN [seen[difference], i]
        
        SAVE 'number' as key and 'i' as value in 'seen'
        
    RETURN empty array (if no sum is found)
```

## Detailed Notes 📝

### The Problem
Given an array of integers and a target sum, you need to find the indices of the two numbers that add up to the target.

### Approach 1: Brute Force (The slow way)
- **Concept:** Take every number and check it against every other number to see if they add up to the target.
- **Time Complexity:** O(N²) - Because for every element, we loop through the rest of the array.
- **Space Complexity:** O(1) - No extra memory needed.

### Approach 2: Hash Map / Object (The optimal way)
- **Concept:** As you iterate through the array once, store the numbers you've seen and their indices in an Object or Map. For every number `x`, check if `target - x` is already in your Map. If yes, you found your pair!
- **Time Complexity:** O(N) - We only traverse the array once. Looking up a key in a Hash Map takes O(1) time on average.
- **Space Complexity:** O(N) - We store at most N elements in our Hash Map.

### Implementation Details in JavaScript
JavaScript provides standard `Map` and `Object` that can be used. A `Map` is slightly preferred as it avoids potential conflicts with Object prototype props and maintains insertion order, but an `Object/Dictionary` works just fine.

## Tips and Tricks for Interviews 💡
- **Clarify inputs:** Always ask if the array is sorted. If it *is* sorted, you can use the Two Pointer approach! 
- **Edge cases:** Ask if a number can be used twice (e.g. `[3, 2, 4]` target `6`, can I use index `0` twice?). Usually, the answer is no.
- **JS specific tip:** Avoid using `Array.prototype.indexOf()` or `includes()` inside a loop to search the array. That automatically makes your algorithm O(N²) under the hood! Stick to a Hash Map or `Set` for O(1) lookups.
