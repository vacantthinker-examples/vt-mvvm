class MVVM {
  constructor(options) {
    // 一上来，先把可用的东西挂载到实例上
    this.$options = options;
    this.$el = options.el;
    this.$data = options.data;

    // 如果有要编译的模板，就开始编译
    if (this.$el) {

      new Observer(this.$data);

      new Compile(this.$el, this);
    }
  }
}
