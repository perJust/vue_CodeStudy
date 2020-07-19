export class Dep {
    constructor(vm, key, cb) {
        this.deps = [];
    }
    addDep(dep) {   // 收集对应的依赖
        this.deps.push(dep);
    }
    notify() {  // 通知收集器里所有依赖的更新
        this.deps.forEach(dep => {
            return dep.update();
        })
    }
}
export class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm;
        this.key = key;
        this.cb = cb;

        // hack的处理 将当前this委托给Dep   然后用getter去收集对应watcher的this
        Dep.target = this;
        this.vm[this.key];  // 触发observe的getter
        Dep.target = null; // 重置
    }
    update() {  // 通知收集的依赖进行更新
        this.cb.call(this.vm, this.vm[this.key]);
    }
}