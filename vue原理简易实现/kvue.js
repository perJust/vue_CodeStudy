class KVue {
    constructor(options){
        this.$options = options;

        // 数据响应化
        this.$data = options.data;
        this.observe(this.$data);

        // new Watcher()
        // this.$data.test

        new Compile(options.el, this)

        // created执行
        if(options.created) {
            options.created.call(this) // 用call的形式  就是方便钩子函数内灵活使用this操作
        }
    }

    observe(val){
        if(!val || typeof val !== 'object'){
            return ;
        }

        // 遍历该对象
        Object.keys(val).forEach(key => {
            this.defineReactive(val, key, val[key])

            // 代理data中的属性到vue实例上
            this.proxyData(key)
        })
    }

    defineReactive(obj, key, val){

        this.observe(val) // 递归解决数据嵌套

        const dep = new Dep() // 每个key都有专属的Dep

        Object.defineProperty(obj, key, {
            get(){
                Dep.target && dep.addDep(Dep.target)
                return val; // 获取形参val的值  注意：set会将形参改变
            },
            set(newval){
                if(newval === val) {
                    return ;
                }
                // console.log(val)
                val = newval; // 形参指代的做法 打个比方：实参传入的是3 => 对应val=3 => 但是这里val = newval 就不等于3了   将形参变量赋值改变了
                // console.log(val)
                // 通知属性更新了
                dep.notify()
            }
        })
    }

    proxyData(key) {
        Object.defineProperty(this, key, {
            get() {
                return this.$data[key]
            },
            set(newval){
                this.$data[key] = newval
            }
        })
    }
}

// Dep 用来管理Watcher  相当于订阅者收集器   消息订阅器
class Dep {
    constructor(){
        // 这里存放的若干的依赖(watcher)
        this.deps = [];
    }
    addDep(dep){
        this.deps.push(dep)
    }
    // 通知所有依赖进行更新
    notify(){
        this.deps.forEach(dep => dep.update())
    }
}

// watcher  订阅者
class Watcher {
    constructor(vm, key, cb){
        this.vm = vm
        this.key = key
        this.cb = cb

        // 将当前的watcher实例指定到Dep静态属性target上
        Dep.target = this
        this.vm[this.key] // 触发getter 添加依赖
        Dep.target = null

    }

    update() {
        // console.log('属性更新了')
        this.cb.call(this.vm, this.vm[this.key])
    }
}