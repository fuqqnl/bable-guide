/**
* @file 开始使用 @babel/plugin-transform-runtime
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

/**
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

可以看出transform-runtime确实进行了代码合并优化的功能，而且是从 @babel/runtime/helpers中ruquire的，
从这里也可以印证我在markdown里写的依赖@babel-runtime的说法

但是，仔细看编译产出，会发现没有对Object.assign的编译产出。所以这里实际所得就跟网上的一些说法不一样了。也就是说在babel 7中，@label-runtime并
不会对新api进行polyfill。我们也可以进 node_modules看一下@babel-runtime的源码，确实没有。

这里也就体现了一个重要问题： 从babel6到babel7,label变化很大，需要具体分析。如果直接npm install babel-runtime,大家能够看到，这个模块里面是
有那些polyfill的。

所以要在 babel7中处理，请看 base5的处理
*/
