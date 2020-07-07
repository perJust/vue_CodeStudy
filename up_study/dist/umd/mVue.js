(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.mVue = factory());
}(this, (function () { 'use strict';

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
      console.log(vm.$options);
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
