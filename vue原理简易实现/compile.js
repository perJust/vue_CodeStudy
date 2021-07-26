// Compile(el,vm)
class Compile {
    constructor(el, vm) {
        this.$el = document.querySelector(el)
        this.$vm = vm

        if(this.$el) {
            // 转换内部内容为片段Fragment
            this.$fragment = this.node2Fragment(this.$el)
            // 执行编译
            this.compile(this.$fragment)
            // 将编译完的html结果追加至$el
            this.$el.appendChild(this.$fragment)
        }
    }
    // 将宿主元素中代码片段拿出来遍历，这样比较高效
    node2Fragment(el){
        const frag = document.createDocumentFragment()
        // 将el中所有子元素搬家至frag中
        let child;
        while (child = el.firstChild){ // 这步补充说明：这是赋值后进行判断
            // appendChild会对已有的dom元素做移动操作(这里是移动到frag)  所以el.firstChild总是指向新一个元素(因为原本的firstChild被移走了)
            frag.appendChild(child)
        }
        return frag
    }

    // 编译过程
    compile(el){
        const childNodes = el.childNodes
        Array.from(childNodes).forEach(node => {
            // 类型判断
            if(this.isElement(node)) { // 元素
                // console.log('编译元素' + node.nodeName);
                
                // 查找k-. @. :.
                const nodeAttrs = node.attributes
                Array.from(nodeAttrs).forEach(attr => {
                    const attrName = attr.name // 属性名
                    const exp = attr.value // 属性值

                    if(this.isDirective(attrName)) {
                        // 是指令  如k-text
                        const dir = attrName.substring(2)
                        // 执行指令
                        this[dir] && this[dir](node, this.$vm, exp)
                    }
                    if(this.isEvent(attrName)) {
                        const dir = attrName.substring(1)
                        this.eventHandler(node, this.$vm, exp, dir)
                    }
                })
            } else if(this.isInterpolation(node)) { // 文本
                // console.log('编译插值文本' + node.textContent);

                this.compileText(node)
            }

            // 递归子节点
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })

    }

    compileText(node) {
        // console.log(RegExp.$1)

        // node.textContent = this.$vm.$data[RegExp.$1]

        this.update(node, this.$vm, RegExp.$1, 'text')
    }
    
    update(node, vm, exp, dir) {
        const updaterFn = this[dir + 'Updater']
        // 初始化
        updaterFn && updaterFn(node, vm[exp])
        // 依赖收集
        new Watcher(vm, exp, function(value){
            updaterFn && updaterFn(node, value)
        })
    }

    text(node, vm, exp) {
        this.update(node, vm, exp, 'text')
    }

    model(node, vm, exp) {
        // 指定input的value属性
        this.update(node, vm, exp, 'model')

        // 视图对模型响应
        node.addEventListener('input', e=> {
            vm[exp] = e.target.value
        })
    }
    
    html(node, vm, exp) {
        this.update(node, vm, exp, 'html')
    }

    htmlUpdater(node, value) {
        node.innerHTML = value
    }

    textUpdater(node, value) {
        node.textContent = value
    }

    modelUpdater(node, value) {
        node.value = value
    }
    
    eventHandler(node, vm, exp, dir) {
        let fn = vm.$options.methods && vm.$options.methods[exp]
        if(dir && fn) {
            node.addEventListener(dir, fn.bind(vm))  // bind是改变fn内的this指向(并返回一个已改this指向的函数，原fn函数是不变的)  但是不立即执行  call是立即执行
        }
    }

    isDirective(attr) {
        return attr.indexOf('k-') === 0
    }

    isEvent(attr) {
        return attr.indexOf('@') === 0
    }

    isElement(node) {
        return node.nodeType === 1;
    }

    // 插值文本
    isInterpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
}