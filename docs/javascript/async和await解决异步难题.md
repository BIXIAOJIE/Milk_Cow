# 理解 JavaScript 的 async/await

## 参考资料

- https://segmentfault.com/a/1190000007535316
- http://www.ruanyifeng.com/blog/2015/05/async.html
- MDN-https://developer.mozilla.org/zh-CN/docs/learn/JavaScript/%E5%BC%82%E6%AD%A5

> 背景:最近在使用Node.js构建 RESTFUL API ,听闻 `async/await` 是异步编程的终极解决方案,于是来学习一下.

## async 和 await 在干什么

> 任意一个名称都是有意义的，先从字面意思来理解。async 是“异步”的简写，而 await 可以认为是 async wait 的简写。所以应该很好理解 async 用于申明一个 function 是异步的，而 await 用于等待一个异步方法执行完成。
> 另外还有一个很有意思的语法规定，await 只能出现在 async 函数中。然后细心的朋友会产生一个疑问，如果 await 只能出现在 async 函数中，那这个 async 函数应该怎么调用？
> 如果需要通过 await 来调用一个 async 函数，那这个调用的外面必须得再包一个 async 函数，然后……进入死循环，永无出头之日……
> 如果 async 函数不需要 await 来调用，那 async 到底起个啥作用？

### async 起什么作用

> 这个问题的关键在于，async 函数是怎么处理它的返回值的！

> 我们当然希望它能直接通过 return 语句返回我们想要的值，但是如果真是这样，似乎就没 await 什么事了。所以，写段代码来试试，看它到底会返回什么：

```js
async function testAsync() {
  return 'Hello World'
}
const result = testAsync()
console.log(result);
```

看到输出就恍然大悟了——输出的是一个 Promise 对象。

```bash
Promise { 'Hello World' }
```
> 所以，async 函数返回的是一个 Promise 对象。从文档中也可以得到这个信息。async 函数（包含函数语句、函数表达式、Lambda表达式）会返回一个 Promise 对象，如果在函数中 return 一个直接量，async 会把这个直接量通过 Promise.resolve() 封装成 Promise 对象。

>async 函数返回的是一个 Promise 对象，所以在最外层不能用 await 获取其返回值的情况下，我们当然应该用原来的方式：then() 链来处理这个 Promise 对象，就像这样

```js
async function testAsync() {
  console.log('Hello')
  return 'Hello World'
}
testAsync().then(v=>{
  console.log(v);
})
```

>现在回过头来想下，如果 async 函数没有返回值，又该如何？很容易想到，它会返回 `Promise.resolve(undefined)。`

> 联想一下 Promise 的特点——无等待，所以在没有 await 的情况下执行 async 函数，它会立即执行，返回一个 Promise 对象，并且，绝不会阻塞后面的语句。这和普通返回 Promise 对象的函数并无二致。
> 那么下一个关键点就在于 await 关键字了。

### await 究竟在等什么

> 一般来说，都认为 await 是在等待一个 async 函数完成。不过按语法说明，await 等待的是一个表达式，这个表达式的计算结果是 Promise 对象或者其它值（换句话说，就是没有特殊限定）。

> 因为 async 函数返回一个 Promise 对象，所以 await 可以用于等待一个 async 函数的返回值——这也可以说是 await 在等 async 函数，但要清楚，它等的实际是一个返回值。注意到 await 不仅仅用于等 Promise 对象，它可以等任意表达式的结果，所以，await 后面实际是可以接普通函数调用或者直接量的。所以下面这个示例完全可以正确运行.

```js
async function testAsync() {
  // return 'Hello World'
  return Promise.resolve("hello async");
}
function getSomething() {
  return "something"
}

async function test() {
  const v1 = await getSomething()
  const v2 = await testAsync()
  console.log(v1,v2);
}  

test()
```

> 因此，将async关键字添加到函数中以告诉它们返回promise而不是直接返回值。此外，这使同步函数可以避免运行支持使用await时带来的任何潜在开销。通过仅在函数声明为异步时添加必要的处理，JavaScript引擎可以为您优化您的程序。爽!

- 使用方法
  - async 关键字放在函数声明之前
    - 现在这个函数 function 转换为了 async function
      - 特征
         - 1. 异步函数将任何函数转换为Promise
    - await在等待什么
      - 1. await 等待一个Promise对象
      - 2. await 或者等待一个普通值
      - 3. await 也在等待一个 async 函数完成

### await 等到了要等的,然后呢.

> await 等到了它要等的东西，一个 Promise 对象，或者其它值，然后呢？我不得不先说，await 是个运算符，用于组成表达式，await 表达式的运算结果取决于它等的东西。
>如果它等到的不是一个 Promise 对象，那 await 表达式的运算结果就是它等到的东西。
>如果它等到的是一个 Promise 对象，await 就忙起来了，它会阻塞后面的代码，等着 Promise 对象 resolve，然后得到 resolve 的值，作为 await 表达式的运算结果。
>看到上面的阻塞一词，心慌了吧……放心，这就是 await 必须用在 async 函数中的原因。async 函数调用不会造成阻塞，它内部所有的阻塞都被封装在一个 Promise 对象中异步执行。

## async/await 帮我们干了啥




