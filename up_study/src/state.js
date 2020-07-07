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
    console.log(vm.$options)
}
function initComputed(vm) {

}
function initWatch(vm) {

}