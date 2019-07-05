## 什么是babel

简单讲 Babel 是 Javascript 编译器 ,将 ES6,ES7 ,ES8 转换成 浏览器都支持的ES5 语法,并提供一些插件来兼容浏览器API的工具。是怎么实现的勒, Babel 会将源码转换 AST(抽象语法树)之后，通过便利AST树，对树做一些修改，然后再将AST转成code，即成源码。这样，我们的代码就可以运行到支持es5的浏览器中了。

## Babel 的诞生

Babel 的前身是 6to5 这个库， 6to5的作者是Facebook 的澳大利亚的工程师 Sebastian McKenzie, 6to5 是 2014 年发布的，主要功能是就是 ES6 转成 ES5 , 它使用转换AST的引擎不是自己写的 ，fork了一个更古老的库 acorn,在2015年1月份 6to5 和 Esnext 库(这个是Ember cli 用的，Ember也是一个很出名的框架,国内用的人比较少)的团队决定一起开发 6to5,并改名为 Babel ,解析引擎改名为 Babylon ,再后来  Babylon 移入到@babel/parser

### babel的含义

- Babylon 读出来是巴比伦的意思，指的是巴比伦文明
- Babel 指的是巴别塔，是巴比伦文明里面的 通天塔(百度百科);

## 设计理念


> let a = 1 --> AST树 -->babel-traverse遍历ATS树，通过plugins/presets对ATS树进行修改 --> babel-generator 把AST再转成code --> 最后转成 var a = 1


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

这是因为babel-preset-es2015为我们做了多余的事，举个例子，大部分现代浏览器已经支持ES6的generator了，但是如果你设置了babel-preset-es2015，generator函数还是会被转译成复杂的ES5代码。

那么把@babel/preset-env说的这么好，而且也是bable官方推荐的，那么它有什么特点呢？以至于我们无法抛弃它？
原因就是presets 是 plugins 的集合,把很多需要转换的ES6的语法插件集合在一起，避免大家各种配置,比如:

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

主要是用来配合@babel/polyfill ，这里简单讲下，在 runtime 和 polyfill 差别的环节重点讲, 有 false,entry,usage,默认是 false 什么也不干，为 entry，项目中 main.js 主动引入 @babel/polyfill ,会把所有的 polyfill 都引入，如果为 usage main.js 主动引入 @babel/polyfill, 只会把用到的 polyfill 引入

#### targets
 targets 用来指定转换 需要支持哪些浏览器的的支持,这个语法是参照 browserslist,比如说 如果设置 "chrome >= 70" ,则意思是，按照70以上版本对es6的支持度进行编译。更通俗的说，比如说 class，chrome 的时候不支持，所以需要编译成es5，而如果我们设置成大于70，则class就不会进行编译了。 所以说，要看我们的工程支持到浏览器的什么版本，防止设置错误产生页面的报错或者白页。(这里是坑，注意)

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

我认为，所谓api，可以粗略的理解为能执行的函数，比如includes/Object.assign/ Array.from/Promise 等；语法，就是我们遇到的类似于let/const/class/import/export/箭头函数/结构等。当然这么理解不全面，但绝对可以帮助大家分别。

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

所以，Babel通过@babel/preset-env的 `useBuiltIns` 属性，解决了按需加载的问题，需要哪个，再引入哪个。所以就代替了polyfill,所以后面的项目中可以不用再引 polyfill了。

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
> 大家一定不要迷信往上的所有教程或文章，包括我写的这一系列。最重要的还是要跟官方的介绍结合起来。只有这样，你的理解才不会出现大的偏差。因为网上的文章介绍这类的很多，但其中不乏大量拿来主义的文章，其中有很多纰漏，很容易让大家从这个坑跳入另一个坑，坑坑相连，不能自拔。。。还有的文章写的确实很好，但是缺乏真实的场景举例，导致读者在理解的时候也出现大的偏差，在困顿中无法自拔。

ok，提醒了大家很多，后面开始用实例来印证上面我说的，让大家理论与实践结合，少走冤枉路。
