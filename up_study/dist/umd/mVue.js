(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('.')) :
  typeof define === 'function' && define.amd ? define(['.'], factory) :
  (global = global || self, global.mVue = factory(global._));
}(this, (function (_) { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function isObject(data) {
    return _typeof(data) === 'object' && data !== null;
  }
  function def(data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false,
      configurable: false,
      value: value
    });
  }

  var oldArrayMethods = Array.prototype; // 指向数组原有的所有方法

  var arrayMethods = Object.create(oldArrayMethods); // 上述这一步 是创建一个原型指向   使arrayMethods._proto_ = oldArrayMethods
  // 现在的逻辑是 
  // data.__proto__ = arrayMethods
  // arrayMethods.__proto__ = oldArrayMethods
  // 使得arrayMethods作为中间层进行拦截

  var methods = [// 保存需要拦截的方法
  'push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayMethods[method].apply(this, args); // 调用原始方法  将操作的结果存下

      var inserted; //  保存新增的值

      var ob = this.__ob__; // hack  接收之前存的this

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args; // 新增的值为传参  没这样写args[0]的原因在于方便下面统一的对数组形式进行监听

          break;

        case 'splice':
          inserted = args.slice(2); // 当splice进行修插值或改值时 至少有第三个参数

          break;
      }

      if (inserted) {
        ob.observeArray(inserted); //  如果插入新值 则重新监听
      }

      return result;
    };
  });
  console.log(arrayMethods);

  function observe(data) {
    if (!isObject(data)) {
      return;
    }

    return new Observer(data);
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //  将this存向数据的_ob_上
      // data._ob_ = this;   这样写有问题，walk时会无限循环了
      def(data, '__ob__', this); // 改用Object.defineProperty定义不可枚举与再配置

      if (Array.isArray(data)) {
        // 如果是数组的话 将不会对索引进行监听  因为会导致性能问题
        // 所以只去拦截数组的方法 shift pop push unshift splice...
        data.__proto__ = arrayMethods; // 如果数组里放的是对象的话 再进行数据劫持

        this.observeArray(data);
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "observeArray",
      value: function observeArray(data) {
        for (var i = 0; i < data.length; i++) {
          observe(data[i]); // 依次进行监听判断   相当于递归 深度监听
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        var keys = Object.keys(data);

        for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
          var itemKey = _keys[_i];
          defineReactive(data, itemKey, data[itemKey]);
        }
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    observe(value);
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: false,
      get: function get() {
        return value;
      },
      set: function set(newVal) {
        if (newVal === value) {
          return;
        }

        observe(newVal); // 如果设置的是对象  继续劫持新设置的值

        value = newVal;
      }
    });
  }

  function initState(vm) {
    var opts = vm.$options; // 细分各个选项的初始化

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    // console.log(vm.$options)
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data; // 挂载在this上
    // 对象劫持

    observe(data);
  }

  // 混入init方法
  function initMixin(mVue) {
    mVue.prototype._init = function (options) {
      // console.log(options)
      var vm = this;
      vm.$options = options; // 初始化状态

      initState(vm); // 进行数据劫持
      // this.observe(options.data)
    };
  }

  /**
   * 入口函数
   */

  function mVue(options) {
    this._init(options);
  }
  /**
   * 以混入的方式进行拆分
   */
  // 在原型上添加方法


  initMixin(mVue);

  return mVue;

})));
