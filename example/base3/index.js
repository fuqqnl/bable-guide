/**
* @file 使用@babel/preset-env的 useBuiltIns 属性
*/

[1, 2, 3].map((n) => n + 1);
class Circle {
    construtor(){

    }
    circleItem() {
        return 'test'
    }
}
const obj = Object.assign({}, {a: 1}, {b: 2});

// 执行 npm run dist, 结果可以看到都已经进行处理了，但是有两个问题：
// 1. Object.assign 的polyfill是通过一个require() 直接引入的
// 2. 如果多模块的情况下，会出现很多相同的polyfill函数，详细介绍情况我写的.md文件


// 同时，您应该试试把.babelrc中的useBuiltIns中的值改为entry,看一下babel转义后的文件大小
