## 什么是babel

简单讲 Babel 是 Javascript 编译器 ,将 ES6,ES7 ,ES8 转换成 浏览器都支持的ES5 语法,并提供一些插件来兼容浏览器API的工具。是怎么实现的勒, Babel 会将源码转换 AST(抽象语法树)之后，通过便利AST树，对树做一些修改，然后再将AST转成code，即成源码。这样，我们的代码就可以运行到支持es5的浏览器中了。

## Babel 的诞生

Babel 的前身是 6to5 这个库， 6to5的作者是Facebook 的澳大利亚的工程师 Sebastian McKenzie, 6to5 是 2014 年发布的，主要功能是就是 ES6 转成 ES5 , 它使用转换AST的引擎不是自己写的 ，fork了一个更古老的库 acorn,在2015年1月份 6to5 和 Esnext 库(这个是Ember cli 用的，Ember也是一个很出名的框架,国内用的人比较少)的团队决定一起开发 6to5,并改名为 Babel ,解析引擎改名为 Babylon ,再后来  Babylon 移入到@babel/parser

### babel的含义

- Babylon 读出来是巴比伦的意思，指的是巴比伦文明
- Babel 指的是巴别塔，是巴比伦文明里面的 通天塔(百度百科);

## 设计理念


> let a = 1 --> AST树 -->babel-traverse遍历ATS树，通过plugins/presets对ATS树进行修改 --> babel-generator 把AST再转成code --> 最后转成 var a = 1

## 默认版本

> 下文都是以 babel 7进行讲解

## babel的组成

Babel 的核心是在 @babel/core 这个npm 包，围绕在它周围的是

- @babel/cli  //AST转换的核心
- @babel/preset-env*  //把许多 @babel/plugin 综合了下，减少配置
- @babel/plugin*  //Babel 插件机制，Babel基础功能不满足的时候,手动添加些
- @babel/runtime*  //把你使用到的浏览器某些不支持语法，按需导入,代码少（说了一半）
- @babel/polyfill //把浏览器某些不支持API，兼容性代码全部导入到项目,不管你是不是用到,缺点是代码体积特别大

简单的.babelrc 是进行配置的：

```
    {
    "presets": [
        ["@babel/preset-env"]
    ],
    "plugins": ["@babel/plugin-syntax-dynamic-import"],
    ]
}
```

其实@babel-runtime的作用上面只说对了一半，后面深入讲。

现在先来围绕.babelrc作为突破口进行讲解。（下面先讲逻辑部分，有些枯燥，但很重要，后面会有实际的例子，二者结合，保证大家很快能看明白）


## .babelrc

其中有两个比较重要的部分，一个是presets（预设）,一个是 plugins（插件）

presets的意思是要用babel编译，那就得预先放入不可缺少的部分。那么介绍的就是这个@babel/preset-env

相信很多人都和我一样，刚接触babel的时候都是使用 babel-preset-es2015 这个预设套餐的，但是显然目前而言 babel-preset-env 会是一个更好的选择，babel-preset-env 可以根据配置的目标浏览器或者运行环境来自动将ES2015+的代码转换为es5。

而babel-preset-es2015为我们做了多余的事，举个例子，大部分现代浏览器已经支持ES6的generator了，但是如果你设置了babel-preset-es2015，generator函数还是会被转译成复杂的ES5代码。

那么把@babel/preset-env说的这么好，而且也是bable官方推荐的，那么它有什么特点呢？以至于我们无法抛弃它？
原因就是presets 是新语法 plugins 的集合,把很多需要转换的ES6的语法插件集合在一起，避免大家各种配置,比如:

```
 {
     "syntax-async-generator": require('@babel/plugin-syntax-async-generator'),
     "syntax-json-string": require('@babel/plugin-syntax-json-string'),
     .....
 }

  // 还有很多插件，如果没有presets,我们在es6的 async, class, let, const等都得自己去找插件进行配置，否则还是es6语法~~
 ```


preset-env里面有一些options,我这里进行介绍一下，为了更好的便于大家理解。更具体的还请大家查一下官方怎么解释的。（还是那句话，不要脱离官方的介绍）

### preset-env 具体常用参数

#### debug
 默认是 false 开启后控制台会看到 哪些语法做了转换，Babel的日志信息，开发的时候强烈建议开启

#### useBuiltIns

主要是用来配合@babel/polyfill ，这里简单讲下，在 runtime 和 polyfill 差别的环节重点讲, 有 false,entry,usage,默认是 false 什么也不干，为 entry，项目中 main.js 主动引入 @babel/polyfill ,会把所有的 polyfill 都引入，如果为 usage， main.js 主动引入 @babel/polyfill, 只会把用到的 polyfill 引入

#### targets
 targets 用来指定转换 需要支持哪些浏览器的的支持,这个语法是参照 browserslist,比如说 如果设置 "chrome >= 70" ,则意思是，按照70以上版本对es6的支持度进行编译。更通俗的说，比如说 class，chrome老版本的时候不支持，所以需要编译成es5，而如果我们设置成大于70，则class就不会进行编译了。 所以说，要看我们的工程支持到浏览器的什么版本，防止设置错误产生页面的报错或者白页。(这里是坑，注意)

 > 注： https://browserl.ist 可以查询具体的支持度~~  各个查询条件间是或的关系。


### presets和plugins 的加载顺序

presets 加载顺序和一般理解不一样 ，是倒序的，plugins 按照数组的 index 增序(从数组第一个到最后一个)进行编译

 原因是： 作者认为大部分人(在bable之前版本)会把 presets 写成 ["es2015", "stage-0"]，stage-x 是 Javascript 语法的一些提案，那这部分可能依赖了ES6的语法，解析的时候得先解析这部分到ES6,在把ES6解析成ES5。所以 presets是倒序方式进行编译的。


 > 其实写到这里我已经不想往下写着枯燥的理论了，但是思考30秒，还是先把理论一股脑抛出来吧，结合后面得具体例子，再来看上面的枯燥理论，也就会生动起来了。

 在 useBuiltIns 这个参数的时候提到了polyfill和runtime，那就把这块最容易出现混淆的问题讲讲

 ### poly & runtime

 两者的总体关系可以这么说：
 > Babel 只是转换 syntax 层语法,所以需要 @babel/polyfill 来处理API兼容,又因为 polyfill 体积太大，所以通过 preset的 useBuiltIns 来实现按需加载,再接着为了满足 npm 组件开发的需要 出现了 @babel/runtime 来做隔离。

 上一段代码:

 ```
 // 编译前

 let array = [1, 2, 3, 4, 5, 6];
 array.includes(item => item > 2);
 const obj = Object.assign({}, {a: 1}, {b: 2});

 ```

 编译后：

 ```
 var array = [1, 2, 3, 4, 5, 6];
 array.includes(function (item) {
   return item > 2;
 });
 var obj = Object.assign({}, {
   a: 1
 }, {
   b: 2
 });
 ```

通过这个例子，可以看到：对箭头函数和let进行了转化，但是，对 includes和Object.assign并没有转化。

这里就会遇到坑，包括白页都可能是由于这里出现的。

比如大概一年前，我在做feed落地页的时候出过一次白页，就是因为Object.assign在低端手机的手百下不支持，索性当时是晚上11点多上的线，影响不大。但现在想想也后怕。。。

所以，教训告诉我们，要弄清楚babel能编译哪些，不能编译哪些，需要什么垫片.

### babel能编译什么

> babel 能编译的是es6、es7的新语法(syntax)，但是不能编译新的api

那么何为新语法，何为新api？

我认为，所谓api，可以粗略的理解为能执行的函数和全局对象，比如includes/Object.assign/ Array.from/Promise 等；语法，就是我们遇到的类似于let/const/class/import/export/箭头函数/结构等。当然这么理解不全面，但绝对可以帮助大家分别。

那么，解决新api的问题，就需要polyfill（垫片）出场了。

polyfill中文翻译为`垫片`，实际上就是`补齐`的意思。最直接的办法的是：根据 一份浏览器不兼容的表格(这个browserslist已经完成了)，把对应浏览器不支持的语法全部重新写一遍，让不支持的也可以支持。

```
// 把新api降级

if (typeof Object.assign != 'function') {
      Object.defineProperty(Object, "assign",
      ·····
      )
  }


```
但是问题是babel-polyfill这个包很大，加上以后你会发现你的编译产出多了上百k，如果引在pc端还好，如果是移动端，就不太合适了。

所以，Babel通过@babel/preset-env的 `useBuiltIns` 属性，解决了按需加载的问题，需要哪个，再引入哪个。所以就代替了polyfill,所以后面的项目中可以不用再引 polyfill了。用`useBuiltIns: usage`后，会发现项目dist比直接把@bable-polyfill引入小了太多。

### runtime

现在 api的问题解决了，但是还有一个问题，就是模块间方法相互引用的问题。 这个在node中不存在，如果不导出，别的模块也拿不到。

但是label还是不太一样，在进行编译的时候，会出现方法覆盖的问题，这是怎么回事呢？主要还是因为我们在处理es6的新api时，确实把api进行处理了，但是暴露在全局。

所以，runtime的机制，就是把各个模块之间进行隔离，实现模块间的相互没有干扰。
```
// 这两个是一对，需要都install

npm install --save @babel/runtime
npm install --save-dev @babel/plugin-transform-runtime

```

嗯嗯，这块解释的逻辑没有问题。只是太过于抽象，很难体会到其中的精髓。下面我会通过真实的例子来让大家一步一步看到这个label是如何工作的。到时大家就会一步一步体会到，如果让你来处理，你也会毫不犹豫的选择这么处理。

哈哈，到那时，大家就可以get到我说的这些全部的点了。

> tips :
> 大家一定不要迷信网上的教程或文章。最重要的还是要跟官方的介绍结合起来。只有这样，你的理解才不会出现大的偏差。因为网上的文章介绍这类的很多，但其中不乏大量拿来主义的文章，其中有很多纰漏，很容易让大家从这个坑跳入另一个坑，坑坑相连，不能自拔。。。还有的文章写的确实很好，但是缺乏真实的场景举例，导致读者在理解的时候也出现大的偏差，在困顿中无法自拔。

ok，提醒了大家很多，后面开始用实例来印证上面我说的，让大家理论与实践结合，少走冤枉路。


## 从真实代码环境中找思路

> 我准备用反证的形式来证明我上面所说的，也更能让大家理解。

### 1. 如果不设置 presets，编译的结果是什么样的。
默认 .babel是没有设置的

看原代码:

```
[1, 2, 3].map((n) => n + 1);
class Circle {
    construtor(){

    }
    circleItem() {
        return 'test'
    }
}
const obj = Object.assign({}, {a: 1}, {b: 2});
```
我的项目package.json里设置的:

```
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dist": "babel index.js -d dist"
  },
```

执行 `npm run dist`

得到的结果是:

```
[1, 2, 3].map((n) => n + 1);
class Circle {
    construtor(){

    }
    circleItem() {
        return 'test'
    }
}
const obj = Object.assign({}, {a: 1}, {b: 2});

```
没变化。。。其实这也很好理解，通过执行babel，执行@babel/core的逻辑，把我们的代码转成AST树。但是我们没有对树进行任何操作，没有对新语法的解析，没有对新api的解析，所以ATS树又原样的返回了。 相信大家对这个能理解。

好，那我们就在这个基础上，一点一点加功能。那想办法把语法转一下吧，如果能把新api转一下那就一劳永逸了。

下面把 presets加入吧~~

```
// .babelrc

{
    "presets": [
        [
            "@babel/preset-env",
            {
                "debug": false,
                "targets": {"browsers": [">1%", "last 2 versions", "safari >= 12"]}
            }
        ]
    ]
}

```

原代码还是上面的，现在我们执行 `npm install @babel/preset-env -D` ,然后再执行 `npm run dist`,看看产出结果吧：

```
// 箭头函数正常转es5了

[1, 2, 3].map(function (n) {
  return n + 1;
});

// class 也正常转了

var Circle =
/*#__PURE__*/
function () {
  function Circle() {
    _classCallCheck(this, Circle);
  }

  _createClass(Circle, [{
    key: "construtor",
    value: function construtor() {}
  }, {
    key: "circleItem",
    value: function circleItem() {
      return 'test';
    }
  }]);

  return Circle;
}();

// Object.assign 没转。。。。

var obj = Object.assign({}, {
  a: 1
}, {
  b: 2
});
```

从上面结果可以看到，语法层面的转了，但是新api没转译。

还记得我上面提过 preset-env中的options中有个 `useBuiltIns`参数么？好的，现在再试试

```
// .babelrc

{
    "presets": [
        [
            "@babel/preset-env",
            {
                "debug": false,
                "targets": {"browsers": [">1%", "last 2 versions", "safari >= 12"]},
                "useBuiltIns": "usage"
            }
        ]
    ]
}

```

继续执行 `npm run dist` 吧。

结果如下：

```
require("core-js/modules/es6.object.assign");

......

var obj = Object.assign({}, {
  a: 1
}, {
  b: 2
});
```

现在能看到很重要的一行：

```
require("core-js/modules/es6.object.assign");
```

奥，原来是引了一个专门的处理Object.assign的模块啊，这就能解释的通 `useBuiltIns: 'usage'`这个参数的作用了.

同时，我们也要知道，通过增加useBuiltIns参数，polyfill是来自 `node_modules`里的 `core-js`。

> 注：大家可以改成 useBuiltIns: "entry"试试，看看打包后的文件有多大？

现在看着我们担心的问题解决了，貌似完美了。其实还没有。继续往下看：

我们发现现在的es6.object.assign引入方式，可是直接require引入的，也就是说，这个es6.object.assign是作用于全局了。这种情况，如果我们单纯些业务逻辑，基本上不会有什么问题，但是如果我们写的是很多人在用的插件呢？而且碰巧，你的插件里对Object.assign进行了重新改写：

```
Object.prototype.assign = function(){
    ....
}

```

那结果就是你的插件很大概率不会按你预想的执行.

所以，我们需要能够让polyfill在一个局部空间内，不要影响其他功能。好了，向大家隆重介绍：@babel/plugin-transform-runtime

> 这里还要知道，@babel/plugin-transform-runtime、@babel/runtime、@babel/runtime-corejs2之间的关系~~。照官网上说，@babel/plugin-transform-runtime是要依赖@babel/runtime，而且又说transform-runtime可以实现polyfill的功能，那@babel/runtime-corejs2又是什么？ @babel/plugin-transform-runtime跟 @babel/preset-env都有相同的功能，怎么取舍？怎么个情况？ 是不是头又大了？


嗯，像这种情况比较麻烦了，插件之间糊成一团了。。。官网上貌似也没说的很明白。。。

这样吧，实践是检验真理的唯一标准，开撸

这样，先分两个大类进行区分：1. @babel/preset-env 和 transform-runtime + runtime； 2. @babel/preset-env + transform-runtime + runtime-corejs2


先看第一大类：

```
    // 先看只有 preset-env的情况
    {
        "presets": [
            [
                "@babel/preset-env",
                {
                    "debug": false,
                    "targets": {"browsers": [">1%", "last 2 versions", "safari >= 7"]},
                    "useBuiltIns": "usage"
                }
            ]
        ],
    }

    // 结果是成功加入polyfill,只是有全局的隐忧

    require("core-js/modules/es6.object.assign");
    var obj = Object.assign({}, {
      a: 1
    }, {
      b: 2
    });

    // 然后看把"useBuiltIns": "usage"去掉,加入@babel/plugin-transform-runtime

    {
        "presets": [
            [
                "@babel/preset-env",
                {
                    "debug": false,
                    "targets": {"browsers": [">1%", "last 2 versions", "safari >= 7"]}
                }
            ]
        ],
        "plugins": [
            [
                "@babel/plugin-transform-runtime",

            ]
        ],
    }

    // 结果是： 没有成功polyfill, 啊？ 标榜的可以polyfill呢？？？
    // 那去找 @babel/runtime,果真里面没有Object.assign的polyfill，同样也没找到那些新的api的polyfill

```

再看第二大类：

```
// 同样可以polyfill,只是暴露到全局中
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "debug": false,
                "targets": {"browsers": [">1%", "last 2 versions", "safari >= 7"]},
                "useBuiltIns": "usage"
            }
        ]
    ],

}

// 用 runtime-corejs2
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "debug": false,
                "targets": {"browsers": [">1%", "last 2 versions", "safari >= 7"]}
            }
        ]
    ],
    "plugins": [
        [
            "@babel/plugin-transform-runtime",
            {
                "corejs": 2
            }

        ]
    ],
}
// 喔！！！成功了，而且看产出，能看到已经包装成局部变量了

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));
var obj = (0, _assign.default)({}, {
  a: 1
}, {
  b: 2
});

```

所以从以上的实验中，可以看到最合适的用法就是用 runtime-corejs2的这种啊！！！

从文档中，我们还能看到@babel/plugin-transform-runtime还有一个作用，就是把各个文件中生成的那些相同的代码合并到一处，减小代码体积

举个例子：

```
// 源码
class Person {}

```
如果不用 @babel/plugin-transform-runtime的产出

```
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Person = function Person() {
  _classCallCheck(this, Person);
};
```

如果用@babel/plugin-transform-runtime

```
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var Person = function Person() {
  (0, _classCallCheck3.default)(this, Person);
};
```
如果在一个模块中，确实不明显，但是如果我们有多个模块，而每个模块里都有定义class，那么如果不用@babel/plugin-transform-runtime，则结果是每个模块中都会进行一次 `function _classCallCheck` 的定义，所以会增加很多相同的代码。

如果用 `@babel/plugin-transform-runtime`, 那么不同的模块间最后只引同一个`@babel/runtime-corejs2/helpers/classCallCheck`即可，不需要每个模块都重复定义一次`_classCallCheck`函数,是不是的确很方便了?

### 总结一下：
- @babel/preset-env 两个重要作用：1. 方便我们新语法的解析，不用去一个一个的找对应新语法的解释器(插件)；2.可以直接通过`"useBuiltIns": "usage"`进行新api平稳过度到es5，但是是全局性的
- @babel/plugin-transform-runtime 也有两个作用：1.通过与@babel/runtime-corejs2合作，对新api进行polyfill，过度到es5，而且这种polyfill是局部的，比"useBuiltIns": "usage"要更好一些；2.可以对babel编译过程中产生的重复代码进行合并，减小代码体积。


通过我上面的看似挺麻烦的实验，我们一定对babel的原理和各个babel插件间的配合有个一个更清晰的认识。

实例源码在这里: [github源码地址](https://github.com/fuqqnl/bable-guide)

赠人玫瑰，手有余香，喜欢的朋友请start一下，鼓励我继续创作~~
