/**
* @file 使用@babel/runtime-corejs2 代替 @babel-runtime
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

// 执行 npm run build, 可以从产出看出， Object.assign的polyfill已经产生，不是全局引入，而是被包装成了一个模块内的局部变量
// 至此，我们的疑问全部解决。
