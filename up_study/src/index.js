/**
 * 入口函数
 */
import { initMixin } from './init';
 function mVue(options) {
    this._init(options);
}
/**
 * 以混入的方式进行拆分
 */
// 在原型上添加方法
initMixin(mVue);

 export default mVue;