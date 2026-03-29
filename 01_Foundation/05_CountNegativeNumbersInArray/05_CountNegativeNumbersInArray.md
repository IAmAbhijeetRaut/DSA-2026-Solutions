# 05. Count Negative Numbers in a Sorted Matrix / Array

Editorial Link: https://namastedev.com/blog/count-negative-numbers-in-an-array/

## Pseudocode 🧠

```text
FUNCTION countNegatives(array):
    INITIALIZE count = 0
    FOR EACH number in array:
        IF number < 0:
            INCREMENT count
    RETURN count
```
*(Note for 2D Sorted Matrices - usually asked exactly like this):*
```text
FUNCTION countNegatives2D(matrix):
    INITIALIZE count = 0
    INITIALIZE row = 0
    INITIALIZE col = length of matrix[0] - 1
    
    WHILE row < number of rows AND col >= 0:
        IF matrix[row][col] < 0:
            count = count + (number of rows - row) 
            col = col - 1 // Move left
        ELSE:
            row = row + 1 // Move down
            
    RETURN count
```

## Detailed Notes 📝

### The Problem
Count the total number of negative integers within an array (or very commonly, a 2D matrix that is sorted both row-wise and column-wise in decreasing order).

### 1D Array Approach
If it's just a raw 1D array, a simple loop `O(N)` is strictly required unless the array is sorted. If it *is* sorted, you can use Binary Search `O(log N)` to find the first negative index, and the count is simply `length - negativeIndex`.

### Optimal Approach for 2D Sorted Matrix (The Staircase approach)
- **Concept:** Since rows and columns are sorted decreasingly, if you find a negative number, everything *below* it in that column is ALSO negative.
- **Time Complexity:** O(ROWS + COLS). We start top-right (or bottom-left). If the number is negative, we increment our count by the number of numbers below it, and move left. If it's non-negative, we move down. We never revisit paths.
- **Space Complexity:** O(1), zero extra memory.

## Tips and Tricks for Interviews 💡
- **Clarify Dimensions:** An interviewer might give you an array and casually mention "it's sorted", hinting heavily at Binary Search. O(N) is easy, but O(log N) is the expectation if it's sorted!
- **Edge cases:** What if the array is purely empty? What if it's full of zeros? Does `0` count as negative? (No, `x < 0` strictly).
- **The "Staircase" technique:** Use the properties of the sorted grid. The top right corner allows you to eliminate an entire column or entire row in a single logical step. Mentioning the term "Staircase Search" shows a high-level pattern recognition!
