let regExp = /\{\{([^}]+)\}\}/g;

class Compile {
  // 两个参数：一个当前元素；一个是当前实例
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    // 如果有这个元素，才开始编译
    if (this.el) {
      // 先把真实DOM移入到内存中 fragment==文档碎片;解析模板的过程中为了性能
      let fragment = this.nodeToFragment(this.el);
      // 然后开始编译==>提取出想要的元素节点：v-model  文本节点：{{}}
      this.compile(fragment);
      // 最后将编译好的文档碎片塞回页面去
      this.el.appendChild(fragment);
    }
  }

  /*一些辅助函数*/

  // 判断是否是元素节点
  isElementNode(node) {
    return node.nodeType === 1;
  }

  /*  核心函数 */

  // 创建文档碎片
  nodeToFragment(el) {
    // 文档碎片 内存中的DOM节点
    let fragment = document.createDocumentFragment();
    let firstChild;
    while ((firstChild = el.firstChild)) {
      fragment.appendChild(firstChild);
    }
    return fragment;
  }

  compile(fragment) {
    // 先拿到所有的子节点
    let childNodes = fragment.childNodes; //返回一个文档集合(类数组)
    Array.from(childNodes).forEach(node => {
      if (this.isElementNode(node)) {
        //如果是元素节点,那么就要继续深入检查
        // 编译元素
        this.compileElement(node);
        this.compile(node);
      } else {
        //如果是文本节点
        // 编译文本
        this.compileText(node);
      }
    })
  }


  // 编译元素的方法：检查是否带有v-
  compileElement(node) {
    //获取当前元素的属性：type,v-model。。。
    let attrs = node.attributes; ////返回一个类数组
    Array.from(attrs).forEach(attr => {
      // attr有name=v-model，和value两个值
      let attrName = attr.name;
      // 判断是否是v-开头的自定义属性
      if (this.isDirective(attrName)) {
        // 取到对应的值并放到节点中：在data中取值
        let expr = attr.value;
        let type = attrName.substring(2);
        if (type.indexOf('on') === 0) { // on
          CompileUtil.eventHandler(node, this.vm, expr, type);
        } else { // model
          CompileUtil[type](node, this.vm, expr);
        }
        node.removeAttribute(attrName);
      }
    })
  }

// 编译文本方法
  compileText(node) {
    // 检查是否带有{{message}}
    let expr = node.textContent; //取文本中的内容{{message}}
    if (regExp.test(expr)) {
      CompileUtil['text'](node, this.vm, expr);
    }
  }

  // 是不是指令
  isDirective(name) {
    return name.includes('v-');
  }


}

CompileUtil = {
  setVal(vm, expr, value) {
    expr = expr.split('.');
    return expr.reduce((prev, next, currentIndex) => {
      if ((currentIndex === expr.length - 1)) {
        return prev[next] = value; // [message, a]
      }
      return prev[next];
    }, vm.$data);
  },
  getVal(vm, expr) {
    //获取实例上对应的数据
    // expr=message.name.age
    expr = expr.split('.'); // [message,name,age]
    return expr.reduce((prev, next) => {
      return prev[next];
    }, vm.$data);
  },
  getTextValue(vm, expr) {
    //获取编译文本后的结果
    return expr.replace(regExp, (...arguments) => {
      return this.getVal(vm, arguments[1]);
    });
  },
  text(node, vm, expr) {
    // 文本处理
    let updateFn = this.updater['textUpdater'];
    // 这里需要抽离获取文本数据的方法
    let value = this.getTextValue(vm, expr);
    expr.replace(regExp, (...arguments) => {
      new Watcher(vm, arguments[1], newValue => {
        updateFn && updateFn(node, this.getTextValue(vm, expr))
      })
    });

    updateFn && updateFn(node, value);
  },

  model(node, vm, expr) {
    // 输入框处理
    let updateFn = this.updater['modelUpdater'];
    new Watcher(vm, expr, newValue => {
      updateFn && updateFn(node, this.getVal(vm, expr))
    });

    node.addEventListener('input', e => {
      let newValue = e.target.value;
      this.setVal(vm, expr, newValue);
    });

    // 问题来了：如果是嵌套数据{message:{a:1}}
    // 取到的表达式就是message.a ==> vm.$data['message.a']
    updateFn && updateFn(node, this.getVal(vm, expr));
  },
  updater: {
    // 更新数据
    textUpdater(node, value) {
      node.textContent = value;
    },
    modelUpdater(node, value) {
      node.value = value;
    }
  },
  /**
   *
   * @param node
   * @param vm
   * @param expr sayHi()
   * @param dir click, hover
   */
  eventHandler(node, vm, expr, dir) {
    let eventType = dir.split(":")[1];
    let fn = vm.$options.methods && vm.$options.methods[expr];
    if (eventType && fn) {
      console.log("typesssssssssssss")
      node.addEventListener(eventType, fn.bind(vm), false)
    }
    console.log(eventType, fn)
  }
};







