/**
* @file 没有用@babel/preset-env和 @babel/plugin-transform-runtime的情况
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

// 执行 npm run dist的结果是没有进行转换，包括箭头函数和Object.assign都没有进行处理
