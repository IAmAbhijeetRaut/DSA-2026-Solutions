// Editorial Link: https://namastedev.com/blog/check-if-a-number-is-a-palindrome/
/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function (x) {
  // negatives and numbers ending with 0 (but not 0 itself) are not palindromes
  if (x < 0 || (x % 10 === 0 && x !== 0)) return false;

  let reversedHalf = 0;

  // build reversed second half of the number
  while (x > reversedHalf) {
    const digit = x % 10;
    reversedHalf = reversedHalf * 10 + digit;
    x = Math.floor(x / 10);
  }

  // for even length: x === reversedHalf
  // for odd length: x === Math.floor(reversedHalf / 10)
  return x === reversedHalf || x === Math.floor(reversedHalf / 10);
};