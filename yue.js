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
    observe(data, true);
  };

  function observe(data, isRootDate) {
    if (typeof data !== 'object') {
      return;
    }
    var ob;
    if (hasOwn(data, '__ob__')) {
      ob = data.__ob__;
    } else if (Array.isArray(data) || isPlainObject(data)) {
      ob = new Observer(data);
    }
    if (isRootDate && ob) {
      ob.vmCount++;
    }
    return ob;
  }
  // 储存数组的编译方法
  var methodKeys = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse',
  ];
  var arrayMethods = {};
  var arrayProto = Array.prototype;
  methodKeys.forEach(function (method) {
    var original = arrayProto[method];
    Object.defineProperty(arrayMethods, method, {
      enumerable: true,
      configurable: false,
      value: function () {
        var args = Array.prototype.slice.call(arguments, 0);
        var inserted;
        if (method === 'push' || method === 'unshift') {
          inserted = args;
        } else if (method === 'splice') {
          inserted = args.slice(2);
        }
        inserted && this.__ob__.observeArray(inserted);
        var result = original.apply(this, arguments);
        return result;
      },
    });
  });

  function Observer(data) {
    this.value = data;
    this.vmCount = 0;
    defaultProperty(data, '__ob__', this);
    if (!Array.isArray(data)) {
      this.walk(data);
    } else {
      // 将变异方法覆盖到数组数据上
      argument(data, arrayMethods, methodKeys);
      // 深度观察数据
      this.observeArray(data);
    }
  }

  // 用于给对象加上get和set
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
  };

  function argument(target, arrayMethods, keys) {
    for (var i = 0; i < keys.length; i++) {
      defaultProperty(target, keys[i], arrayMethods[keys[i]]);
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
    let childOb = observe(val);
    console.log(childOb, target);
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

  function hasOwn(obj, key) {
    return obj.hasOwnProperty(key);
  }
  window.Yue = Yue;
})(window);