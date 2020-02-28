# Generator async await Promise 我们是怎样解决异步的

>人类需要异步处理问题，编程需要有异步编程解决方案：

## 1.人类

在生活中，大家每天都会用到微信来进行聊天。那么某个时间有两个人来跟你聊天，同步与异步会有不同的表现（单线程的情况下）。
- 同步
  - 同步的做法是先选择一个比较先与你聊天的，把整个天都给聊完了，最后确定对方与你没有什么好聊的。ok接下去跟另外一个人进行聊天。
- 异步
  - 异步：异步的做法是选择同时和这两个人进行聊天，每一次把信息发出去，等待对方回信息的时间内你都可以做其他事情，比如与编辑回复另外人信息。

只要脑子是一个正常人的脑子的话，都会使用异步的方式来处理问题。

也就是：`选择同时和这两个人进行聊天，每一次把信息发出去，等待对方回信息的时间内你都可以做其他事情，比如与编辑回复另外人信息。`

计算机不够聪明，如果没有软件，或者说如果没有人类的智慧，那么计算机将不会编写程序，当然这是必然的。

## 2.计算机

既然异步的优势是如此之大，那么我们现在的计算机软件都应该是通过异步编程实现的吧，其实不然。很多开发的语言用到是同步。java处理并发是用到多线程（虽然java有一个nio处理异步，但是之前是很少人用到的，现在应该逐渐有人去重视这个），每个线程的执行是同步的。如果在这个线程中进行读取磁盘文件，在读取的过程中这个线程的资源是没有利用的。这个是同步的缺点。那为什么不使用异步呢？！异步的开发成本要高于同步，一般执行顺序不符合正常的逻辑思维（一般不是从上到下）。先说这么多，后面再讲明原因。

### 异步IO

#### 案例1 向服务器发送ajax请求
关于异步I/O，向前端开发工程师讲起来会比较简单一点，因为前端页面可以理解为是基于事件驱动的。用ajax发起请求对于前端工程师来说是更熟悉不过的

```js
// ajax 发起请求

$post('url',{title:'学习node.js'},()=>{
  console.log('收到响应')
});
console.log('发送Ajax结束'); 
```

执行这一段代码的时候，假设后台是响应成功的，执行顺序是先打印“发起Ajax结束”然后再“收到响应”。这个很好理解，执行第二次打印的时候是当后台返回数据说响应成功后执行的。我们只知道它将在这个异步请求结束后执行，但并不知道具体的时间点。异步调用中对于结果值的捕获是符合“Don’t call me, I will call you”的原则的，这也是注重结果，不关心过程的一种表现。

#### 案例2 服务端文件读取

```js
const fs = require('fs');
fs.readFile('文件路径', (err, file) => {
	console.log('文件读取完毕');
});
console.log('发起文件读取');
```

> 这里的执行顺序也是如此，先发起文件读取，然后再发起文件读取完毕。以上代码如果同时读取文件A和文件B，会几乎同时对A和B发起读取，然后线程可以执行其他代码，待到AB读取回调的时候，在执行相应的回调。这样就是异步IO的好处，可以原本读取一个文件的时间内读取更多的文件（假设文件同样大小）。

```js
const fs = require('fs')


fs.readFile('./a.txt',(err,file)=>{
  if(err){
   return console.log('读取文件错误');
  }
  console.log(file.toString());
})

fs.readFile('./b.txt',(err,file)=>{
  if(err){
   return console.log('读取文件错误');
  }
  console.log(file.toString());
})

console.log('读取文件结束');
```

代码的执行结果是：

```bash
读取文件结束
a
b
```

### 3.Node.js的优势

> Node在这方面做得不错决定了Node比其他大多数后端语言的优势在于对IO密集型业务会有更好的表现。通常，说Node擅长I/O密集型的应用场景基本上是没人反对的。Node面向网络且擅长并行I/O，能够有效地组织起更多的硬件资源，从而提供更多好的服务。
> I/O密集的优势主要在于Node利用事件循环的处理能力，而不是启动每一个线程为每一个请求服务，资源占用极少。
> 由于JavaScript是单线程语言，有人会问Node在cpu密集型业务逻辑中是不是表现不是很好。在JavaScript层面上讲，是对的。
换一个角度，在CPU密集的应用场景中，Node是否能胜任呢？实际上，V8的执行效率是十分高的。单以执行效率来做评判，V8的执行效率是毋庸置疑的。

### 4.异步操作实现

#### 4.1 函数回调

```js
f1();
f2();
function f1(callback){
    setTimeout(function () {
        callback();
    }, 1000);
}
f1(f2);

```

- 函数回调
  - 在执行某个函数，达到某个逻辑条件时候调用某个函数传某个特定的参数
  - 适用于简单的业务逻辑之下
    - 业务逻辑很复杂，就会产生回调地狱，代码可维护性为0
    - 如果修改一个小小的需求，可能没人能顶得住。
  - 层层嵌套，很难看清楚整个程序的执行流程

> 在异步的第一种实现中，我们看到了回调函数的优点，那就是易于理解。其实其他的方式也是不难理解的。

#### 4.2 事件监听

```js
f1.on('done',f2)
function f1() {
  setTimeout(()=>{
    console.log('执行函数f1');
    f1.trigger('done')
  })
}
f1();

```

>接下来是事件监听：前端对事件监听一定不会陌生，我对前端页面的理解，从某个方面上讲整个页面的逻辑调用都是基于事件监听的。很多函数的调用都是基于事件监听的。那么事件怎么实现呢？

>这个逻辑，当一秒后f1发出信息说执行完毕了，就会执行f2函数。这种方法的优点是比较容易理解，可以绑定多个事件，每个事件可以指定多个回调函数，而且可以"去耦合"（Decoupling），有利于实现模块化。缺点是整个程序都要变成事件驱动型，运行流程会变得很不清晰。

#### 4.3 订阅-发布模式

#### 4.4 Promise对象

为了解决4.1构建`函数回调`的 callback hell 回调地狱。我们使用Promise来解决这个问题。异步编程--

```js
// 无法保证顺序的代码
const fs = require('fs')


fs.readFile('./a.txt',(err,file)=>{
  if(err){
  //  return console.log('读取失败')
  // 抛出异常
  //  1.组织程序的执行
  //  2.把错误信息打印到控制台
  throw err
  }
  console.log(file.toString());
})

fs.readFile('./b.txt',(err,file)=>{
  if(err){
  //  return console.log('读取失败')
  // 抛出异常
  //  1.组织程序的执行
  //  2.把错误信息打印到控制台
  throw err
  }
  console.log(file.toString());
})

fs.readFile('./c.txt',(err,file)=>{
  if(err){
  //  return console.log('读取失败')
  // 抛出异常
  //  1.组织程序的执行
  //  2.把错误信息打印到控制台
  throw err
  }
  console.log(file.toString());
})

console.log('读取文件结束');

```

文件的读取是异步的，异步的代码是不会等待的。如果文件内容比较小，读取a,b,c的顺序是不同的。异步代码是无法解决代码顺序的，最终取决于每一个文件读取对于cpu的调度顺序。

```bash
读取文件结束
bbb
ccc
aaa
```

> 如果我希望保证代码的执行顺序呢?通过回调嵌套的方式来保证顺序执行。

```js
const fs = require('fs')


fs.readFile('./a.txt', (err, file) => {
  if (err) {
    //  return console.log('读取失败')
    // 抛出异常
    //  1.组织程序的执行
    //  2.把错误信息打印到控制台
    throw err
  }
  console.log(file.toString());
  const fs = require('fs')


  fs.readFile('./b.txt', (err, file) => {
    if (err) {
      //  return console.log('读取失败')
      // 抛出异常
      //  1.组织程序的执行
      //  2.把错误信息打印到控制台
      throw err
    }
    console.log(file.toString());
    const fs = require('fs')


    fs.readFile('./c.txt', (err, file) => {
      if (err) {
        //  return console.log('读取失败')
        // 抛出异常
        //  1.组织程序的执行
        //  2.把错误信息打印到控制台
        throw err
      }
      console.log(file.toString());
    })
  })
})
```
> 如果读取的文件有100个呢?我们需要写100个回调函数吗？

- 这种方式的问题
  - 嵌套太深，可维护性为0
  - 如何解决回调地狱
    - Promise来解决
> 为了解决以上编码方式带来的问题,所以 ES6 中提出了 Promise API。

- Promise
  - 解决回调嵌套的问题
    - Promise是一个容器
      - 内部有一个将来才可能发生的事情
        - 异步本身顺序无法控制
        - 不一定现在发生的事情
      - Promise内部
        - 内部存放着一个将来才可能执行的异步任务
          - 三种状态
            - pending 正在执行
              - ->resolved 已经解决
              - ->rejected 已经失败
            - 状态只能变成其中一种

- 使用方式
  - 创建Promise容器
    - 1. Promise 容器一旦创建就开始执行内部的代码
      - 承诺本身不是异步的，承诺内部的任务是异步的
      - 

```js
const fs = require('fs')
// 1. 创建Promise
var p1 = new Promise((resolve,reject)=>{
  fs.readFile('./a1.txt',(err,data)=>{
    if(err){
      // 失败了，承诺容器中的任务失败了
      // 把容器的pending状态变为
      reject(err)
    }else {
      // 成功了 承诺容器中的任务成功了
      // console.log(data.toString());
      resolve(data)
    }
})
})

// p1 就是承诺
// 当 p1 成功了 然后 then 做什么什么什么

// then方法接收的 function 就是容器中的 resolve 函数
p1.then(function (data) {
  console.log(data.toString())
},(err)=>{
  console.log('读取文件失败了',err);
})


```

> 一路then到底

```js


```

> 封装 Promise 版本的 fs.readFile

```js
const fs = require('fs')

function pReadFile(filepath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}




pReadFile('a.txt')
  .then(function (data) {
    console.log(data.toString())
    // 当p1读取成功的时候
    return pReadFile('b.txt')
  }, (err) => {
    console.log('读取文件失败了', err);
  })
  .then((data)=>{
    console.log(data.toString());
    return pReadFile('c.txt')
  },(err)=>{
    console.log('读取失败了',err);
  })
  .then(data=>{
    console.log(data.toString());
  },(err)=>{
    console.log('读取失败了',err);
  })

```