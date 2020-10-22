class Observer {
  constructor(data) {
    this.observe(data);
  }

  observe(data) {
    if (!data || typeof data !== 'object') {
      return;
    }
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
      this.observe(data[key]);
    })
  }

  /**
   * 定义响应式, 即设置对象的数据更新为响应式, 一处修改, 到处更新
   * @param obj
   * @param key
   * @param value
   * @returns {*}
   */
  defineReactive(obj, key, value) {
    let that = this; // 存储this
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      get() {
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set(newValue) {
        if ((newValue !== value)) {
          that.observe(newValue);
          value = newValue;
          dep.notify();
        }
      }
    })
  }

}

class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(watcher) {
    this.subs.push(watcher)
  }

  /**
   * 一调用set(xx), 就更新
   */
  notify() {
    this.subs.forEach(watcher => {
      watcher.update();
    })
  }
}































