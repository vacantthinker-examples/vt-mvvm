class Watcher {
  /**
   *
   * @param vm
   * @param expr
   * @param cb callback
   */
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    this.value = this.get(); // 先获取旧值
  }

  getVal(vm, expr) {
    expr = expr.split('.');
    return expr.reduce((prev, next) => {
      return prev[next];
    }, vm.$data);
  }

  get() {
    Dep.target = this;
    let value = this.getVal(this.vm, this.expr);
    Dep.target = null; // 用完之后清空
    return value;
  }

  update() {
    let newValue = this.getVal(this.vm, this.expr);
    let oldValue = this.value;
    if ((newValue !== oldValue)) { // 如果新值不等于旧值, 执行[数据]更新
      this.cb(newValue);
    }
  }
}