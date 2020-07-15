// 模板编译
export default class Compile {
    constructor(el, vm) {
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
    compile(node) {
        let childNodes = el.childNodes;
        Array.from(childNodes).forEach(node => {
            
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
}