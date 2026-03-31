// Editorial Link: https://namastedev.com/blog/find-the-secondlargestnumber/
/**
 * @param {string} s
 * @return {number}
 */
var secondHighest = function(s) {
    const digits = new Set();

    // collect distinct digit characters
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch >= '0' && ch <= '9') {      // ignore letters
            digits.add(ch);
        }
    }

    // if fewer than 2 distinct digits, no second largest
    if (digits.size < 2) return -1;

    // convert to numbers and sort descending
    const arr = Array.from(digits)
        .map(d => parseInt(d, 10))
        .sort((a, b) => b - a);

    // second largest is at index 1
    return arr[1];
};