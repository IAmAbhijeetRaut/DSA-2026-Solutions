// Editorial Link: https://namastedev.com/blog/sum_two/

function giveSomeSum(args) {
    let sum = 0;
    for (let i = 0; i < args.length; i++) {
        sum += args[i];
    }
    return sum;
}

const sumOfAll = giveSomeSum([10, 20, 30]);
console.log(sumOfAll);