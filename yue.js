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
    vm._watchers = [];
    var options = vm.$options;
    var data = (vm._data = options.data);
    observe(data, true);
  };

  Yue.prototype.$watch = function (targetPath, cb) {
    new Watcher(this, targetPath, cd);
  }

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

  var watcherUid = 0;

  function Watcher(vm, expOrFn, cb, options) {
    this.vm = vm;
    this.id = ++watcherUid;
    this.newDep = [];
    this.newDepIds = new Set();
    vm._watchers.push(this);
    this.getter = parsePath(expOrFn);
    if (!this.get) {
      console.error('parse path error!');
    }
    this.value = this.get();
  }

  Watcher.prototype.get = function () {
    return this.getter.call(this.vm, this.vm);
  }

  var depUid = 0;

  function Dep() {
    this.id = depUid++;
    this.subs = [];
  }

  Dep.prototype.addSub = function (sub) {
    this.subs.push(sub);
  }

  Dep.prototype.depend = function () {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  Dep.prototype.notify = function () {
    for (var i = 0, l = this.subs.length; i < l; i++) {
      this.subs[i].update()
    }
  }

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
    Object.defineProperty(target, key, {
      configurable: true,
      enumerable: true,
      get: function () {
        return val;
      },
      set: function (newVal) {
        if (newVal === val || (newVal !== newVal && val !== val)) { // 后面的判断是排除NaN
          return;
        }
        val = newVal;
        observe(newVal);
      },
    });
  }

  function parsePath(path) {
    var exp = /[^\w.$]/; // 排除不符合表达式的情况，类似 w~w，%等
    if (exp.test(path)) {
      return;
    }
    path = path.split('.');
    return function (obj) {
      for (var i = 0; i < path.length; i++) {
        obj = obj[path[i]];
      }
      return obj;
    }
  }

  function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  function hasOwn(obj, key) {
    return obj.hasOwnProperty(key);
  }
  window.Yue = Yue;
})(window);