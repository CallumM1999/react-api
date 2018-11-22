"use strict";

const names = [
    'tom',
    'ivan',
    'luke',
    'lewis',
    'will'
];

const iterator = names[Symbol.iterator]();

console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());
console.log(iterator.next());


// function* neverEnding() {
//     let index = 0;

//     while (true) {
//         yield index++
//     }
// }

// let gen = neverEnding();

// console.log(gen.next());
// console.log(gen.next());
// console.log(gen.next());
// console.log(gen.next());
// console.log(gen.next());
// console.log(gen.next());
// console.log(gen.next());

// const getCounter = (total, int) => {
//     let count = 0;
//     return () => {
//         count += count === total ? 0 : int;
//         return count;
//     }
// }

// const counter = getCounter(20, 4);

// console.log(counter());
// console.log(counter());
// console.log(counter());
// console.log(counter());
// console.log(counter());
// console.log(counter());
// console.log(counter());
// console.log(counter());
// console.log(counter());
// console.log(counter());