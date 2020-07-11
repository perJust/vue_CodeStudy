import { observe } from ".";

// 拦截重写数组的方法 push pop shift unshift sort splice reverse

const oldArrayMethods = Array.prototype; // 指向数组原有的所有方法
export let arrayMethods = Object.create(oldArrayMethods);
// 上述这一步 是创建一个原型指向   使arrayMethods._proto_ = oldArrayMethods
// 现在的逻辑是 
// data.__proto__ = arrayMethods
// arrayMethods.__proto__ = oldArrayMethods
// 使得arrayMethods作为中间层进行拦截

const methods = [   // 保存需要拦截的方法
    'push',
    'pop',
    'shift',
    'unshift',
    'sort',
    'reverse',
    'splice',
];

methods.forEach(method => {
    arrayMethods[method] = function (...args) {
        let result = oldArrayMethods[method].apply(this, args); // 调用原始方法  将操作的结果存下

        let inserted; //  保存新增的值
        const ob = this.__ob__;   // hack  接收之前存的this
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;    // 新增的值为传参  没这样写args[0]的原因在于方便下面统一的对数组形式进行监听
                break;
            case 'splice':
                inserted = args.slice(2);  // 当splice进行修插值或改值时 至少有第三个参数
                break;
            default:
                break;
        }
        
        if(inserted) {
            ob.observeArray(inserted);   //  如果插入新值 则重新监听
        }
        return result;
    }
});
console.log(arrayMethods);
