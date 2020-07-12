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

        if(vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    }
    mVue.prototype.$mount = function (el) {
        const vm = this;
        const options = vm.$options;
        el = document.querySelector(el);

        // 一般过程：先查看是否写了render，然后是template，最后是用el
        if(options.render) { // 如果是用render函数方式

        
        } else { // 如果是用template方式
            let template = options.template;
            if(!template && el) {   // 如果没有template选项  但是有el
                template = el.outerHTML;    // 则template指向el及el内的所有元素
            }
            console.log(template);
            
        }

    }
}