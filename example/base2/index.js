/**
* @file 使用@babel/preset-env的情况
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

// 先执行 npm install 
// 执行 npm run dist, 结果可以看到 箭头函数和class已经处理了，但是Object.assign还没有进行处理
// 也就是说新的语法可以进行正常解析降级到es5了，但是新api还没有处理。
