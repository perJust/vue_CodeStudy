// 混入init方法

import {initState} from './state.js';
export function initMixin(mVue) {
    mVue.prototype._init = function (options) {
        // console.log(options)
        const vm = this;
        vm.$options = options;

        // 初始化状态
        initState(vm);
        // 进行数据劫持
        // this.observe(options.data)
    }

}