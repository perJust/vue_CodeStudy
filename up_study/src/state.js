import { observe } from './observe/index.js';
export function initState(vm) {
    const opts = vm.$options;
    // 细分各个选项的初始化
    if(opts.props) {
        initProps(vm);
    }
    if(opts.methods) {
        initMethods(vm);
    }
    if(opts.data) {
        initData(vm);
    }
    if(opts.computed) {
        initComputed(vm);
    }
    if(opts.watch) {
        initWatch(vm);
    }
}

function initProps(vm) {

}
function initMethods(vm) {

}
function initData(vm) {
    // console.log(vm.$options)
    let data = vm.$options.data;
    data = typeof data === 'function'?data.call(vm):data;
    vm.$data = data; // 挂载在this上

    // 对象劫持
    observe(data, vm);
}
function initComputed(vm) {

}
function initWatch(vm) {

}