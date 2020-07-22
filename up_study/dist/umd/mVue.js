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

  var Dep = /*#__PURE__*/function () {
    function Dep(vm, key, cb) {
      _classCallCheck(this, Dep);

      this.deps = [];
    }

    _createClass(Dep, [{
      key: "addDep",
      value: function addDep(dep) {
        // 收集对应的依赖
        this.deps.push(dep);
      }
    }, {
      key: "notify",
      value: function notify() {
        // 通知收集器里所有依赖的更新
        this.deps.forEach(function (dep) {
          return dep.update();
        });
      }
    }]);

    return Dep;
  }();
  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, key, cb) {
      _classCallCheck(this, Watcher);

      this.vm = vm;
      this.key = key;
      this.cb = cb; // hack的处理 将当前this委托给Dep   然后用getter去收集对应watcher的this

      Dep.target = this;
      this.vm[this.key]; // 触发observe的getter

      Dep.target = null; // 重置
    }

    _createClass(Watcher, [{
      key: "update",
      value: function update() {
        // 通知收集的依赖进行更新
        this.cb.call(this.vm, this.vm[this.key]);
      }
    }]);

    return Watcher;
  }();

  function observe(data, that) {
    if (!isObject(data)) {
      return;
    }

    if (that) {
      vm = that;
    }

    return new Observer(data);
  }
  var vm = null;

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
          this.proxyData(itemKey); // 代理到this上
        }
      }
    }, {
      key: "proxyData",
      value: function proxyData(key) {
        // 代理this.$data[key]的数据  直接代理到 this[key]
        // 原mVue的this是当前的this.vm;
        if (vm.hasOwnProperty(key)) {
          return;
        }

        Object.defineProperty(vm, key, {
          get: function get() {
            return vm.$data[key];
          },
          set: function set(newVal) {
            vm.$data[key] = newVal;
          }
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    observe(value);
    var dep = new Dep();
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: false,
      get: function get() {
        Dep.target && dep.addDep(Dep.target);
        return value;
      },
      set: function set(newVal) {
        if (newVal === value) {
          return;
        }

        observe(newVal); // 如果设置的是对象  继续劫持新设置的值

        value = newVal;
        dep.notify(); // 这里有个坑：之前将这行代码放到value = newVal之前，使得当即获取的改变还是之前的值
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
    vm.$data = data; // 挂载在this上
    // 对象劫持

    observe(data, vm);
  }

  var Compile = /*#__PURE__*/function () {
    function Compile(el, vm) {
      _classCallCheck(this, Compile);

      this.$vm = vm;
      this.$el = document.querySelector(el);

      if (this.$el) {
        // 先转换为文档碎片形式
        this.$fragment = this.node2Fragment(this.$el); // 执行编译

        this.compile(this.$fragment); // 放入原来的dom中

        this.$el.appendChild(this.$fragment);
      }
    }

    _createClass(Compile, [{
      key: "compile",
      value: function compile(el) {
        var _this = this;

        var childNodes = el.childNodes;
        Array.from(childNodes).forEach(function (node) {
          if (_this.isElement(node)) {
            // 判断是元素标签
            var nodeAttrs = node.attributes;
            Array.from(nodeAttrs).forEach(function (attr) {
              var attrName = attr.name;
              var exp = attr.value; // 属性值

              if (_this.isDirective(attrName)) {
                // 如果是指令 形如m-text m-model m-html
                var dir = attrName.substring(2); // dir为指令简写

                _this[dir] && _this[dir](node, _this.$vm, exp); // 执行对应
              }

              if (_this.isEvent(attrName)) {
                var _dir = attrName.substring(1); //  目前只考虑@的形式


                _this.eventHandler(node, _this.$vm, exp, _dir);
              }
            });
          } else if (_this.isInterpolation(node)) {
            // 判断是文本且为插值
            _this.compileText(node, RegExp.$1); // 编译插值文本

          } // 递归子节点


          if (node.childNodes && node.childNodes.length > 0) {
            _this.compile(node);
          }
        });
      }
    }, {
      key: "node2Fragment",
      value: function node2Fragment(el) {
        var frag = document.createDocumentFragment();
        var child; // 将el中元素搬至frag中

        while (child = el.firstChild) {
          frag.appendChild(child);
        }

        return frag;
      }
    }, {
      key: "compileText",
      value: function compileText(node, exp) {
        // RegExp.$1未处理 暂不允许前后空格
        // 可处理方式：let exp = RegExp.$1.trim();
        this.update(node, this.$vm, exp, 'text'); // 将匹配到的插值进行绑定
      }
    }, {
      key: "isElement",
      value: function isElement(node) {
        return node.nodeType === 1;
      }
    }, {
      key: "isInterpolation",
      value: function isInterpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
      }
    }, {
      key: "eventHandler",
      value: function eventHandler(node, vm, exp, dir) {
        var fn = vm.$options.methods && vm.$options.methods[exp];

        if (dir && fn) {
          node.addEventListener(dir, fn.bind(vm));
        }
      }
    }, {
      key: "update",
      value: function update(node, vm, exp, dir) {
        var updaterFn = this[dir + 'Updater']; // 执行对应的指令更新

        updaterFn && updaterFn(node, vm[exp]); // 给初始值
        // 依赖收集

        new Watcher(vm, exp, function (value) {
          updaterFn && updaterFn(node, value);
        });
      }
    }, {
      key: "textUpdater",
      value: function textUpdater(node, value) {
        node.textContent = value;
      }
    }, {
      key: "htmlUpdater",
      value: function htmlUpdater(node, value) {
        node.innerHTML = value;
      }
    }, {
      key: "modelUpdater",
      value: function modelUpdater(node, value) {
        node.value = value;
      }
    }, {
      key: "text",
      value: function text(node, vm, exp) {
        this.update(node, vm, exp, 'text');
      }
    }, {
      key: "html",
      value: function html(node, vm, exp) {
        this.update(node, vm, exp, 'html');
      }
    }, {
      key: "model",
      value: function model(node, vm, exp) {
        this.update(node, vm, exp, 'model');
        node.addEventListener('input', function (e) {
          vm[exp] = e.target.value;
        });
      }
    }, {
      key: "isDirective",
      value: function isDirective(attr) {
        return attr.indexOf('m-') === 0;
      }
    }, {
      key: "isEvent",
      value: function isEvent(attr) {
        return attr.indexOf('@') === 0;
      }
    }]);

    return Compile;
  }();

  // 混入init方法
  function initMixin(mVue) {
    mVue.prototype._init = function (options) {
      // console.log(options)
      var vm = this;
      vm.$options = options; // 初始化状态

      initState(vm); // 进行数据劫持
      // this.observe(options.data)

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    mVue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      var elDom = document.querySelector(el); // 一般过程：先查看是否写了render，然后是template，最后是用el

      if (options.render) ; else {
        // 如果是用template方式
        var template = options.template;

        if (!template && elDom) {
          // 如果没有template选项  但是有el
          template = elDom.outerHTML; // 则template指向el及el内的所有元素
        } // console.log(template);
        // 这里template用正则匹配的方式 将字符串 进行解析成AST树
        // 上面的方式暂时不考虑  先只考虑el挂载的方式的简单写法     且不考虑VDOM


        new Compile(el, this);
      }
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
