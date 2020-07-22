import { isObject, def } from '../utils/index.js';
import { arrayMethods } from './array.js';
import { Dep } from '../watcher/index.js';
export function observe(data, that) {
    if(!isObject(data)) {
        return ;
    }
    if(that) {
        vm = that;
    }
    return new Observer(data);
}
var vm = null;
class Observer {
    constructor(data) {
        //  将this存向数据的_ob_上
        // data._ob_ = this;   这样写有问题，walk时会无限循环了
        def(data, '__ob__', this);    // 改用Object.defineProperty定义不可枚举与再配置
        if(Array.isArray(data)) {
            // 如果是数组的话 将不会对索引进行监听  因为会导致性能问题
            // 所以只去拦截数组的方法 shift pop push unshift splice...
            data.__proto__ = arrayMethods;

            // 如果数组里放的是对象的话 再进行数据劫持
            this.observeArray(data);
        } else {
            this.walk(data)
        }
    }
    observeArray(data) {
        for(let i=0;i<data.length;i++) {
            observe(data[i]);   // 依次进行监听判断   相当于递归 深度监听
        }
    }
    walk(data) {
        let keys = Object.keys(data);
        for(let itemKey of keys) {
            defineReactive(data, itemKey, data[itemKey]);
            this.proxyData(itemKey);    // 代理到this上
        }
    }
    proxyData(key) {    // 代理this.$data[key]的数据  直接代理到 this[key]
        // 原mVue的this是当前的this.vm;
        if(vm.hasOwnProperty(key)) {
            return ;
        }
        Object.defineProperty(vm, key, {
            get() {
                return vm.$data[key];
            },
            set(newVal) {
                vm.$data[key] = newVal;
            }
        })
    }
}

function defineReactive(data, key, value) {
    observe(value);
    let dep = new Dep();
    Object.defineProperty(data, key, {
        configurable: true,
        enumerable: false,
        get() {
            Dep.target && dep.addDep(Dep.target);
            return value;
        },
        set(newVal) {
            if(newVal === value) {
                return ;
            }
            observe(newVal); // 如果设置的是对象  继续劫持新设置的值
            value = newVal;
            dep.notify();   // 这里有个坑：之前将这行代码放到value = newVal之前，使得当即获取的改变还是之前的值
        }
    })
}