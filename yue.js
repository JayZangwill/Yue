(function (window) {
  function Yue(options) {
    if (!(this instanceof Yue)) {
      console.error('error');
      return;
    }
    this._init(options);
  }
  Yue.prototype._init = function (options) {
    var vm = this;
    vm.$options = options;
    this.callHook('beforeCreate', vm);
    this.initData(vm);
    this.callHook('created', vm);
  };
  Yue.prototype.callHook = function (hook, vm) {
    var options = this.$options;
    options[hook] && options[hook].call(vm, vm);
  };
  Yue.prototype.initData = function (vm) {
    var options = vm.$options;
    var data = vm._data = options.data;
    observe(data);
  };

  function observe(data) {
    if (typeof data !== 'objct') {
      return;
    }
    defaultProperty(data, '__ob__', this);
  }

  function defaultProperty(target, key, value) {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      value: value
    })
  }
  window.Yue = Yue;
})(window);