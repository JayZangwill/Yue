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
    this._callHook('beforeCreate', vm);
    this.initData(vm);
    this._callHook('created', vm);
  };
  Yue.prototype._callHook = function (hook, vm) {
    var options = this.$options;
    options[hook] && options[hook].call(vm, vm);
  };
  Yue.prototype.initData = function (vm) {
    var options = vm.$options;
    var data = (vm._data = options.data);
    observe(data);
  };

  function observe(data) {
    if (typeof data !== 'object' || data.__ob__) {
      return;
    }
    if (Array.isArray(data) || isPlainObject(data)) {
      new Observer(data);
    }
  }
  var methodKeys = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
  // var arrayMethods = methodKeys.map(function(){
  //   return 
  // })
  //需添加arrayMethods

  function Observer(data) {
    this.data = data;
    defaultProperty(data, '__ob__', this);
    if (!Array.isArray(data)) {
      this.walk(data);
    } else {
      // 将变异方法覆盖到数据上
      argument(data, arrayMethods, methodKeys);
      // 深度观察数据
      this.observeArray(data);
    }
  }

  Observer.prototype.walk = function (data) {
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      defineReactive(data, keys[i]);
    }
  };

  Observer.prototype.observeArray = function (data) {
    for (var i = 0; i < data.length; i++) {
      observe(data[i]);
    }
  }

  function argument(target, arrayMethods, keys) {
    for (var i = 0; i < keys.length; i++) {
      defaultProperty(target, keys[i], arrayMethods[keys[i]])
    }
  }

  function defaultProperty(target, key, value) {
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: false,
      value: value,
    });
  }

  function defineReactive(target, key) {
    var val = target[key];
    observe(val);
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      get: function () {
        return val;
      },
      set: function (newVal) {
        if (newVal === val || (newVal !== newVal && val !== val)) {
          return;
        }
        val = newVal;
        observe(newVal);
      },
    });
  }

  function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }
  window.Yue = Yue;
})(window);