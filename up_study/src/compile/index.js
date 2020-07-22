import { Watcher } from '../watcher/index.js';
// 模板编译
export default class Compile {
    constructor(el, vm) {
        this.$vm = vm;
        this.$el = document.querySelector(el);

        if(this.$el) {
            // 先转换为文档碎片形式
            this.$fragment = this.node2Fragment(this.$el);
            // 执行编译
            this.compile(this.$fragment);
            // 放入原来的dom中
            this.$el.appendChild(this.$fragment);
        }
    }
    compile(el) {
        let childNodes = el.childNodes;
        Array.from(childNodes).forEach(node => {
            if(this.isElement(node)) { // 判断是元素标签
                let nodeAttrs = node.attributes;
                Array.from(nodeAttrs).forEach(attr => {
                    let attrName = attr.name;
                    let exp = attr.value;   // 属性值
                    if(this.isDirective(attrName)) {    // 如果是指令 形如m-text m-model m-html
                        const dir = attrName.substring(2); // dir为指令简写
                        this[dir] && this[dir](node, this.$vm, exp);    // 执行对应
                    }
                    if(this.isEvent(attrName)) {
                        const dir = attrName.substring(1);  //  目前只考虑@的形式
                        this.eventHandler(node, this.$vm, exp, dir);
                    }
                })
            } else if(this.isInterpolation(node)) { // 判断是文本且为插值
                this.compileText(node, RegExp.$1); // 编译插值文本
            }
            // 递归子节点
            if(node.childNodes && node.childNodes.length > 0) {
                this.compile(node);
            }
        })
    }
    node2Fragment(el) {
        const frag = document.createDocumentFragment();
        let child;
        // 将el中元素搬至frag中
        while(child = el.firstChild) {
            frag.appendChild(child);
        }
        return frag;
    }
    compileText(node, exp) {
        // RegExp.$1未处理 暂不允许前后空格
        // 可处理方式：let exp = RegExp.$1.trim();
        this.update(node, this.$vm, exp, 'text'); // 将匹配到的插值进行绑定
    }
    isElement(node) {
        return node.nodeType === 1;
    }
    isInterpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }
    eventHandler(node, vm, exp, dir) {
        let fn = vm.$options.methods && vm.$options.methods[exp];
        if(dir && fn) {
            node.addEventListener(dir, fn.bind(vm));
        }
    }
    update(node, vm, exp, dir) {
        const updaterFn = this[dir + 'Updater'];    // 执行对应的指令更新
        updaterFn && updaterFn(node, vm[exp]);  // 给初始值
        // 依赖收集
        new Watcher(vm, exp, function (value) {
            updaterFn && updaterFn(node, value);
        })
    }
    textUpdater(node, value) {
        node.textContent = value;
    }
    htmlUpdater(node, value) {
        node.innerHTML = value;
    }
    modelUpdater(node, value) {
        node.value = value;
    }
    text(node, vm, exp) {
        this.update(node, vm, exp, 'text');
    }
    html(node, vm, exp) {
        this.update(node, vm, exp, 'html');
    }
    model(node, vm, exp) {
        this.update(node, vm, exp, 'model');
        node.addEventListener('input', e => {
            vm[exp] = e.target.value;
        });
    }
    isDirective(attr) {
        return attr.indexOf('m-') === 0;
    }
    isEvent(attr) {
        return attr.indexOf('@') === 0;
    }
}