title: "JavaScript中的异步梳理（1）——使用消息驱动"
id: 27
date: 2012-05-28 11:09:07
tags: 
- 编程
---

继续[上一篇文章](/2012/04/23/javascript中的异步梳理（0）/ "JavaScript中的异步梳理（0）")，这篇探讨使用消息驱动来优化异步编程体验。

先举一个例子，如果希望`ABCDE`这5个函数依次执行，我们可以写出如下代码。
<!-- more -->
``` javascript
A();
B();
C();
D();
E();
```
在同步的情况下，这样的代码没有任何问题。但如果ABCDE都是异步的，还需要按次序执行，这样写就不行了。通常我们会为异步函数设置回调，当函数执行完的时候执行回调，例如
``` javascript
A(function(){
    B(function(){
        C(function(){
            D(function(){
                E();
            });
        });
    });
});
```
毫无疑问这样的编程体验是很差的。当异步流复杂的时候回调嵌套层数会很多，完全就是一场噩梦。

这还不是最重要的，如果想表达“当AB都完成的时候执行C”这样的流程，并且希望A/B可以并行，就不能简单的用这样的回调了。
虽然说“当AB都完成的时候执行C”可以通过设置一个布尔量来解决，但是“当ABCD都完成的时候执行E”这样的逻辑就需要在每个函数执行完的时候去判断其他函数是否执行完，虽然的确是可行的，但是编程体现是比较差的。

身为一名懒惰的程序员，这样显然满足不了我们的胃口。

[@朴灵](http://weibo.com/shyvo) 写了一个[EventProxy](https://github.com/JacksonTian)，提供了事件驱动的异步编程体验
``` javascript
var proxy = new EventProxy();
proxy.assign('A', function(){
    B(function(){
        proxy.trigger('B');
    });
});
proxy.assign('B', function(){
    C(function(){
        proxy.trigger('C');
    });
});
proxy.assign('C', function(){
    D(function(){
        proxy.trigger('D');
    });
});
proxy.assign('D', function(){
    E();
});
A(function(){
    proxy.trigger('A');
});
```
可以看出通过消息来驱动代码可以让异步嵌套被“拉平”了，而如果要描述“当ABCD都完成的时候执行E”这样的流程也很容易了
``` javascript
var proxy = new EventProxy();
proxy.assign('A', 'B', 'C', 'D', E);
A(function(){
    proxy.trigger('A');
});
B(function(){
    proxy.trigger('B');
});
C(function(){
    proxy.trigger('C');
});
D(function(){
    proxy.trigger('D');
});
```
除了改善异步编程体验以外，EventProxy也可以提供一个自定义的事件系统。

EventProxy很简单，源代码只有300多行，但是对于我这样的移动开发者来说任何用不上的代码都是负担。
由于我自己将Event系统拆成了单独的一个模块，而我（目前为止）也不需要EventProxy在`trigger`一个消息的时候的参数传递的功能，对于`some`, `any`, `not`这些限定词我也不需要，因此我自己实现了一个简单版的异步流控制工具。
``` javascript
(function(export){
var uid = 1;
var Jas = function(){
    this.map = {};
    this.rmap = {};
};
var indexOf = Array.prototype.indexOf || function(obj){
    for (var i=0, len=this.length; i<len; ++i){
        if (this[i] === obj) return i;
    }
    return -1;
};
var fire = function(callback, thisObj){
    setTimeout(function(){
        callback.call(thisObj);
    }, 0);
};
Jas.prototype = {
    waitFor: function(resources, callback, thisObj){
        var map = this.map, rmap = this.rmap;
        if (typeof resources === 'string') resources = [resources];
        var id = (uid++).toString(16); // using hex
        map[id] = {
            waiting: resources.slice(0), // clone Array
            callback: callback,
            thisObj: thisObj
        };

        for (var i=0, len=resources.length; i<len; ++i){
            var res = resources[i],
                list = rmap[res] || (rmap[res] = []);
            list.push(id);
        }
        return this;
    },
    trigger: function(resources){
        if (!resources) return this;
        var map = this.map, rmap = this.rmap;
        if (typeof resources === 'string') resources = [resources];
        for (var i=0, len=resources.length; i<len; ++i){
            var res = resources[i];
            if (typeof rmap[res] === 'undefined') continue;
            this._release(res, rmap[res]); // notify each callback waiting for this resource
            delete rmap[res]; // release this resource
        }
        return this;
    },
    _release: function(res, list){
        var map = this.map, rmap = this.rmap;
        for (var i=0, len=list.length; i<len; ++i){
            var uid = list[i], mapItem = map[uid], waiting = mapItem.waiting,
                pos = indexOf.call(waiting, res);
            waiting.splice(pos, 1); // remove
            if (waiting.length === 0){ // no more depends
                fire(mapItem.callback, mapItem.thisObj); // fire the callback asynchronously
                delete map[uid];
            }
        }
    }
};
export.Jas = Jas; // Jas is JavaScript Asynchronous (callings) Synchronizer
})(window);
```
使用起来也挺简单
``` javascript
var flow = new Jas();
flow.waitFor(['A', 'B'], function(){
    // both A and B are done!!
});

$.getJSON(url1, function(data){
    // An ajax request
    flow.trigger('A');
});
$.getJSON(url2', function(data){
    // Another ajax request
    flow.trigger('B');
});
```
**~~小姐~~小结一下：**
使用消息驱动的方式可以让我们在异步编程中避免一些回调嵌套的噩梦，优化编程体验，在流程有修改的时候也更加灵活，可以用一种接近“声明”式的方式去描述异步函数流。