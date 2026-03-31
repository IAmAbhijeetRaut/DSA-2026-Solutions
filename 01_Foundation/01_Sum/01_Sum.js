// Editorial Link: https://namastedev.com/blog/sum_two/
// function giveSomeSum(args) {
//     let sum = 0;
//     for (let i = 0; i < args.length; i++) {
//         sum += args[i];
//     }
//     return sum;
// }

// Alternative solution using reduce
const giveSomeSum = (args) => {
    return args.reduce((acc, curr) => acc + curr, 0);
};

const sumOfAll = giveSomeSum([10, 20, 30]);
console.log(sumOfAll);